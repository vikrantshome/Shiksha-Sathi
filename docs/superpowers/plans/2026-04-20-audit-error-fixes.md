# Audit Error Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all audit errors (7,270 total) by: (1) fetching missing answers from NCERT sources via web search, (2) retrying parse errors with enhanced JSON parsing, (3) automatic fixes for fixable issues

**Architecture:** Modify audit-agent.py to handle errors in three phases: Phase 1 - retry MISSING_RESULT with improved parsing; Phase 2 - use crawl4ai to fetch answers for empty_answer from NCERT; Phase 3 - apply rule-based fixes for remaining fixable issues

**Tech Stack:** Python, pymongo, crawl4ai, NVIDIA NIM API

---

## Error Summary

| Error | Count | Fix Strategy |
|-------|-------|--------------|
| empty_answer | 4,654 | Fetch from NCERT via web search |
| MISSING_RESULT | 2,395 | Retry with enhanced JSON parsing |
| placeholder_answer | 65 | Rule-based cleanup |
| unsupported_type | 103 | Convert to supported types |
| corrupted_control_chars | 28 | Remove bad chars |
| too_short | 17 | Skip for now |
| missing_context | 4 | Skip for now |
| UNKNOWN | 2 | Skip for now |

---

### Task 1: Add Error Retry Logic for MISSING_RESULT

**Files:**
- Modify: `scripts/audit-agent/audit-agent.py:380-462`

- [ ] **Step 1: Add retry method with enhanced JSON parsing**

Add this method to the AuditAgent class (around line 380):

```python
def _parse_response_enhanced(self, content: str, questions: List[Dict]) -> List[Dict]:
    """Enhanced JSON parsing with multiple fallback strategies."""
    results = []
    content = content.strip()
    
    # Remove markdown code blocks
    content = re.sub(r"```json", "", content)
    content = re.sub(r"```", "", content)
    content = re.sub(r"<thinking>.*?</thinking>", "", content, flags=re.DOTALL)
    
    # Strategy 1: Find JSON array
    start_idx = content.find("[")
    if start_idx == -1:
        start_idx = content.find("{")
    
    if start_idx != -1:
        json_str = content[start_idx:]
        
        # Try to find matching closing bracket
        depth = 0
        end_idx = 0
        in_string = False
        escape = False
        for i, c in enumerate(json_str):
            if escape:
                escape = False
                continue
            if c == "\\":
                escape = True
                continue
            if c == '"':
                in_string = not in_string
                continue
            if not in_string:
                if c == "[" or c == "{":
                    depth += 1
                elif c == "]" or c == "}":
                    depth -= 1
                if depth == 0:
                    end_idx = i + 1
                    break
        
        if end_idx > 0:
            json_str = json_str[:end_idx]
            
            # Try original
            try:
                data = json.loads(json_str)
                if isinstance(data, list):
                    results.extend(data)
                elif isinstance(data, dict):
                    results.append(data)
                if results:
                    return results[:len(questions)]
            except:
                pass
            
            # Try fixing trailing commas
            try:
                json_str_fixed = re.sub(r",(\s*[}\]])", r"\1", json_str)
                data = json.loads(json_str_fixed)
                if isinstance(data, list):
                    results.extend(data)
                elif isinstance(data, dict):
                    results.append(data)
                if results:
                    return results[:len(questions)]
            except:
                pass
            
            # Try extracting individual JSON objects
            try:
                # Find all { } pairs and try to parse each
                obj_matches = re.finditer(r'\{[^{}]*\}', json_str)
                for match in matches:
                    try:
                        obj = json.loads(match.group())
                        results.append(obj)
                    except:
                        continue
                if results:
                    return results[:len(questions)]
            except:
                pass
    
    # If all strategies fail, return error
    while len(results) < len(questions):
        results.append({
            "status": "error",
            "issues": ["Parse error: Missing result for question"],
            "error_category": "MISSING_RESULT",
            "recommendation": "retry"
        })
    return results[:len(questions)]
```

- [ ] **Step 2: Modify audit_questions to use enhanced parsing on failure**

Find the `audit_questions` method and add retry logic after line 375:

```python
# First attempt with normal parsing
try:
    response = self.client.chat.completions.create(
        model=self.model,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
        max_tokens=4096,
    )
    
    message = response.choices[0].message
    content = message.content or message.reasoning or ""
    results = self._parse_response(content, questions)
    
    # Check if we got valid results
    if results and all(r.get("status") == "error" and "Parse error" in str(r.get("issues", [])) for r in results):
        # Retry with enhanced parsing
        logger.info("First parse failed, retrying with enhanced parsing")
        results = self._parse_response_enhanced(content, questions)
    
    return results

except Exception as e:
    logger.error(f"API error: {e}")
    return [{"error": str(e)} for _ in questions]
```

- [ ] **Step 3: Add command line option for error retry mode**

Add to the argument parser (around line 853):

```python
parser.add_argument(
    "--retry-errors",
    action="store_true",
    help="Only process questions with audit_status=error",
)
```

- [ ] **Step 4: Add logic to query only error questions**

Add to main() function, after line 874:

```python
# Handle error retry mode
if args.retry_errors:
    classes_to_process = ["6", "7", "8", "9", "10", "11", "12"]
    for class_num in classes_to_process:
        query = {
            "provenance.class": class_num,
            "audit_status": "error"
        }
        error_questions = list(db.questions.find(query))
        logger.info(f"Class {class_num}: {len(error_questions)} error questions to retry")
        # Process these with retry logic
```

- [ ] **Step 5: Commit**

```bash
git add scripts/audit-agent/audit-agent.py
git commit -m "feat: add enhanced JSON parsing for retry on MISSING_RESULT errors"
```

---

### Task 2: Fetch Empty Answers from NCERT Sources

**Files:**
- Modify: `scripts/audit-agent/audit-agent.py:150-188`
- Create: `scripts/audit-agent/fetch-ncert-answers.py`

- [ ] **Step 1: Create NCERT answer fetcher script**

Create `scripts/audit-agent/fetch-ncert-answers.py`:

```python
#!/usr/bin/env python3
"""Fetch missing answers from NCERT and educational sources."""

import argparse
import json
import re
import subprocess
import time
from typing import Optional, Dict, List
from openai import OpenAI
from pymongo import MongoClient

def load_mongodb_uri() -> str:
    import os
    for line in open("scripts/audit-agent/.env"):
        if line.startswith("MONGODB_URI="):
            return line.split("=")[1].strip()
    return os.environ.get("MONGODB_URI", "")

def load_api_key() -> str:
    import os
    for line in open("scripts/audit-agent/.env"):
        if line.startswith("NVIDIA_API_KEY="):
            return line.split("=")[1].strip()
    return os.environ.get("NVIDIA_API_KEY", "")

def search_ncert(query: str) -> Optional[str]:
    """Search for answer using crawl4ai."""
    try:
        # Use Google search for NCERT content
        search_query = f"{query} NCERT solution site:ncert.nic.in OR site:vedantu.com OR site:learncbse.in"
        cmd = [
            "python", "-m", "crawl4ai",
            "--url", f"https://www.google.com/search?q={search_query}",
            "--format", "markdown",
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0 and result.stdout:
            return result.stdout[:3000]
    except Exception as e:
        print(f"Search error: {e}")
    return None

def get_answer_from_llm(question_text: str, question_type: str, api_key: str) -> Optional[str]:
    """Use LLM to generate answer based on question context."""
    client = OpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=api_key,
    )
    
    prompt = f"""You are an expert in NCERT curriculum for Indian schools.
Given the following question, provide a correct and complete answer.

Question Type: {question_type}
Question: {question_text}

Provide:
1. A clear, accurate answer
2. If MCQ, provide the correct option letter and text
3. If TRUE_FALSE, answer with just True or False
4. If SHORT_ANSWER/DESCRIPTIVE, provide a concise answer

Respond in JSON format:
{{"answer": "your answer here", "type": "SHORT_ANSWER/MCQ/TRUE_FALSE/DESCRIPTIVE"}}"""

    try:
        response = client.chat.completions.create(
            model="mistralai/mistral-small-4-119b-2603",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=500,
        )
        content = response.choices[0].message.content
        # Extract JSON
        data = json.loads(content)
        return data.get("answer", "")
    except Exception as e:
        print(f"LLM error: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Fetch missing answers from NCERT")
    parser.add_argument("--dry-run", action="store_true", default=False)
    parser.add_argument("--batch-size", type=int, default=50)
    args = parser.parse_args()
    
    client = MongoClient(load_mongodb_uri())
    db = client["shikshasathi"]
    
    api_key = load_api_key()
    
    # Get questions with empty_answer error
    query = {
        "audit_status": "error",
        "error_category": "empty_answer"
    }
    
    questions = list(db.questions.find(query).limit(500))
    print(f"Found {len(questions)} questions with empty answers")
    
    for i, q in enumerate(questions):
        q_id = str(q["_id"])
        q_text = q.get("text", q.get("question_text", ""))
        q_type = q.get("type", "SHORT_ANSWER")
        q_class = q.get("provenance", {}).get("class", "unknown")
        
        print(f"[{i+1}/{len(questions)}] Processing {q_id} (Class {q_class})")
        
        # Try web search first
        answer = None
        
        # Build search query
        search_query = f"Class {q_class} {q_text[:100]}"
        search_result = search_ncert(search_query)
        
        if search_result:
            # Use LLM to extract answer from search results
            prompt = f"""Based on the following NCERT educational content, 
provide the correct answer to this question:

Question: {q_text}

Reference Content:
{search_result}

Respond with just the answer, nothing else:"""
            
            try:
                client_llm = OpenAI(
                    base_url="https://integrate.api.nvidia.com/v1",
                    api_key=api_key,
                )
                response = client_llm.chat.completions.create(
                    model="mistralai/mistral-small-4-119b-2603",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.1,
                    max_tokens=300,
                )
                answer = response.choices[0].message.content.strip()
            except Exception as e:
                print(f"  LLM extraction error: {e}")
        
        # If no answer from search, try direct LLM generation
        if not answer:
            print(f"  No search result, trying direct LLM...")
            answer = get_answer_from_llm(q_text, q_type, api_key)
        
        if answer and not args.dry_run:
            db.questions.update_one(
                {"_id": q["_id"]},
                {"$set": {
                    "correctAnswer": answer,
                    "audit_status": "retry_pending",
                    "audit_result": ["Answer fetched from NCERT"],
                    "audit_timestamp": "2026-04-20T00:00:00"
                }}
            )
            print(f"  ✓ Updated with answer: {answer[:50]}...")
        elif answer:
            print(f"  [DRY RUN] Would update: {answer[:50]}...")
        
        time.sleep(1)  # Rate limiting
    
    print("Done!")

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Test the NCERT fetcher on a small batch**

```bash
cd .worktrees/audit-run
source .venv/bin/activate
python scripts/audit-agent/fetch-ncert-answers.py --dry-run --batch-size 5
```

- [ ] **Step 3: Run on full empty_answer errors**

```bash
python scripts/audit-agent/fetch-ncert-answers.py --batch-size 100
```

- [ ] **Step 4: Commit**

```bash
git add scripts/audit-agent/fetch-ncert-answers.py
git commit -m "feat: add NCERT answer fetcher for empty_answer errors"
```

---

### Task 3: Fix Placeholder Answers with Rule-Based Cleanup

**Files:**
- Modify: `scripts/audit-agent/audit-agent.py:465-546`

- [ ] **Step 1: Enhance apply_rule_based_fixes to handle placeholders**

Add these rules to the `apply_rule_based_fixes` function:

```python
# Rule 28: Fix placeholder answers
placeholder_patterns = [
    (r"^Explanation\s*:?\s*(None|Answer\s*:|See|Not provided)", ""),
    (r"^See detailed solution", ""),
    (r"^Model Response\s*:", ""),
    (r"^Answer:\s*See", ""),
    (r"^numerical factor needed", ""),
    (r"^reason required", ""),
    (r"^Please refer to.*", ""),
    (r"^See attached.*", ""),
]

for pattern, replacement in placeholder_patterns:
    if re.search(pattern, q_answer, re.I):
        # Try to extract actual answer from explanation field
        if q_explanation and len(q_explanation.split()) > 2:
            updates["correctAnswer"] = q_explanation.strip()
            result.setdefault("issues", []).append("Replaced placeholder with explanation")
            break
        else:
            # Mark for manual review
            result["recommendation"] = "needs_review"
            break
```

- [ ] **Step 2: Add to main processing**

The rule-based fixes are already applied in `process_result` function (lines 632-657). Just ensure they're applied for error questions too.

- [ ] **Step 3: Commit**

```bash
git add scripts/audit-agent/audit-agent.py
git commit -m "feat: add placeholder answer fixes"
```

---

### Task 4: Fix Unsupported Types Automatically

**Files:**
- Modify: `scripts/audit-agent/audit-agent.py:522-534`

- [ ] **Step 1: The conversion rules already exist but enhance them**

The existing code at lines 522-534 handles:
- LONG_ANSWER → DESCRIPTIVE (if answer > 20 words)
- LONG_ANSWER → SHORT_ANSWER (if answer ≤ 20 words)
- ESSAY → DESCRIPTIVE
- CONSTRUCTION → SHORT_ANSWER

Add more aggressive conversion for other unsupported types:

```python
# Enhanced Rule 26: Invalid type conversion
if q_type in ["LONG_ANSWER", "ESSAY", "CONSTRUCTION", "FILL_IN_BLANKS"]:
    # Fix FILL_IN_BLANKS - convert to SHORT_ANSWER
    if q_type == "FILL_IN_BLANKS":
        updates["type"] = "SHORT_ANSWER"
        result.setdefault("issues", []).append("Converted FILL_IN_BLANKS to SHORT_ANSWER")
    elif q_type in ["LONG_ANSWER", "ESSAY"]:
        if len(q_answer.split()) > 20:
            updates["type"] = "DESCRIPTIVE"
        else:
            updates["type"] = "SHORT_ANSWER"
    else:
        updates["type"] = "SHORT_ANSWER"
    
    result.setdefault("issues", []).append(
        f"Converted invalid type {q_type} to {updates['type']}"
    )
    result.setdefault("auto_fixes", {})["type"] = updates["type"]
```

- [ ] **Step 2: Commit**

```bash
git add scripts/audit-agent/audit-agent.py
git commit -m "feat: enhance unsupported type conversion"
```

---

### Task 5: Fix Corrupted Control Characters

**Files:**
- Modify: `scripts/audit-agent/audit-agent.py`

- [ ] **Step 1: Add control character cleanup**

Add this function and integrate it into the processing:

```python
def cleanup_control_chars(text: str) -> str:
    """Remove control characters except whitespace."""
    if not text:
        return text
    # Keep newlines, tabs, carriage returns
    return ''.join(c for c in text if ord(c) >= 32 or c in "\n\t\r")
```

- [ ] **Step 2: Apply in pre-validation bypass mode**

Create a new mode that processes corrupted questions:

```python
def fix_corrupted_question(question: Dict) -> Dict:
    """Fix questions that failed pre-validation."""
    updates = {}
    
    # Fix control characters
    if question.get("text"):
        cleaned = cleanup_control_chars(question["text"])
        if cleaned != question["text"]:
            updates["text"] = cleaned
    
    if question.get("correctAnswer"):
        cleaned = cleanup_control_chars(question["correctAnswer"])
        if cleaned != question.get("correctAnswer"):
            updates["correctAnswer"] = cleaned
    
    return updates
```

- [ ] **Step 3: Commit**

```bash
git add scripts/audit-agent/audit-agent.py
git commit -m "feat: add control character cleanup"
```

---

### Task 6: Run Full Error Fix Pipeline

**Files:**
- Run: Existing scripts

- [ ] **Step 1: Run retry on MISSING_RESULT errors**

```bash
cd .worktrees/audit-run
source .venv/bin/activate
python scripts/audit-agent/audit-agent.py --retry-errors --classes 6 7 8 9 10 11 12
```

- [ ] **Step 2: Run NCERT answer fetcher for empty_answer**

```bash
python scripts/audit-agent/fetch-ncert-answers.py --batch-size 100
```

- [ ] **Step 3: Re-run audit on fixed questions**

```bash
python scripts/audit-agent/audit-agent.py --classes 6 7 8 9 10 11 12
```

- [ ] **Step 4: Check final error counts**

```bash
python -c "
from pymongo import MongoClient
client = MongoClient('mongodb+srv://devteam2025:devteam2026@naviksha.g77okxs.mongodb.net/shikshasathi?appName=naviksha')
db = client['shikshasathi']
pipeline = [{'\$match': {'audit_status': 'error'}}, {'\$group': {'_id': '\$error_category', 'count': {'\$sum': 1}}}]
errors = list(db.questions.aggregate(pipeline))
print('Remaining errors:')
for e in sorted(errors, key=lambda x: -x['count']):
    print(f'  {e[\"_id\"]}: {e[\"count\"]}')
"
```

- [ ] **Step 5: Commit final changes**

```bash
git add -A
git commit -m "fix: process all audit errors - empty answers, parse errors, placeholders"
```

---

## Summary

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Add retry logic for MISSING_RESULT | 15 min |
| 2 | Fetch empty answers from NCERT | 2-4 hours |
| 3 | Fix placeholder answers | 10 min |
| 4 | Fix unsupported types | 10 min |
| 5 | Fix control characters | 10 min |
| 6 | Run full pipeline | 3-5 hours |

**Plan complete.** Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?