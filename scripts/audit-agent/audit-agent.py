#!/usr/bin/env python3
"""
Enhanced Question Bank Audit Agent using NVIDIA NIM API (Kimi K2 Thinking model)
Detects and fixes question defects with WEB SEARCH for authoritative verification

Features:
- Uses moonshotai/kimi-k2-thinking model (best for reasoning)
- Web search: Uses crawl4ai to verify questions against authoritative sources (NCERT, etc.)
- NOT RAG: No longer uses flawed "ok" questions as examples
- Auto-fix issues when detected
"""

import argparse
import json
import logging
import os
import re
import subprocess
import sys
import time
from datetime import datetime
from typing import Any, Dict, List, Optional, Set, Tuple

from openai import OpenAI
from pymongo import MongoClient

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s,%(msecs)03d [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.FileHandler("audit-agent.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


def web_search(query: str) -> Optional[str]:
    """Perform web search using crawl4ai CLI tool"""
    try:
        cmd = [
            "python",
            "-m",
            "crawl4ai",
            "--url",
            f"https://www.google.com/search?q={query}",
            "--format",
            "markdown",
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0 and result.stdout:
            logger.info(f"Web search completed for: {query[:50]}...")
            return result.stdout[:5000]  # Limit context size
    except FileNotFoundError:
        logger.warning("crawl4ai not installed, skipping web search")
    except Exception as e:
        logger.warning(f"Web search error: {e}")
    return None


def load_mongodb_uri() -> str:
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.strip().startswith("MONGODB_URI="):
                    uri = line.split("=", 1)[1].strip().strip('"')
                    return uri
    return os.environ.get("MONGODB_URI", "mongodb://localhost:27017/")


def get_mongodb_connection() -> MongoClient:
    uri = load_mongodb_uri()
    client = MongoClient(uri)
    return client["shikshasathi"]


def load_api_key() -> str:
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.strip().startswith("NVIDIA_API_KEY="):
                    return line.split("=", 1)[1].strip()
    api_key = os.environ.get("NVIDIA_API_KEY")
    if not api_key:
        raise ValueError("NVIDIA_API_KEY not found in .env or environment")
    return api_key


def pre_validate_question(question: Dict) -> Tuple[bool, Optional[str]]:
    """Pre-validate question before LLM call to avoid wasted API costs."""
    q_text = str(question.get("text", question.get("question_text", ""))).strip()
    q_answer_raw = question.get("correctAnswer", question.get("answer", ""))
    # Convert answer to string if it's a dict/list (e.g., for matching questions)
    if isinstance(q_answer_raw, (dict, list)):
        q_answer = json.dumps(q_answer_raw)
    else:
        q_answer = str(q_answer_raw).strip()
    q_type = question.get("type", "")

    if len(q_text) < 10:
        return False, "too_short"

    # Control characters (except whitespace)
    if any(ord(c) < 32 and c not in "\n\t\r" for c in q_text):
        return False, "corrupted_control_chars"

    # Placeholder answer patterns
    placeholder_patterns = [
        r"^Explanation\s*:?\s*(None|Answer\s*:|See|Not provided)",
        r"^See detailed solution",
        r"^Model Response\s*:",
        r"^Answer:\s*See",
        r"^numerical factor needed",
        r"^reason required",
    ]
    if q_answer and any(re.search(p, q_answer, re.I) for p in placeholder_patterns):
        return False, "placeholder_answer"

    # Empty answer
    if not q_answer or q_answer.lower() in ["none", "n/a", "na", "not applicable"]:
        return False, "empty_answer"

    # Missing context references
    context_refs = [
        r"fig\.?\s*\d+",
        r"figure\s*\d+",
        r"question\s+\d+\s+above",
        r"above question",
        r"following table",
    ]
    if any(re.search(ref, q_text, re.I) for ref in context_refs):
        if len(q_text) < 100:
            return False, "missing_context"

    # Unsupported types
    unsupported_types = [
        "ESSAY",
        "LONG_ANSWER",
        "CONSTRUCTION",
        "MATCHING",
        "MULTI_PART",
        "MULTI_PART_SHORT_ANSWER",
        "LONG_DESCRIPTIVE",
    ]
    if q_type in unsupported_types:
        return False, "unsupported_type"

    return True, None


class AuthoritativeSourceFetcher:
    """Fetches authoritative content from NCERT and educational sources"""

    NCERT_BASE_URLS = [
        "https://ncert.nic.in/textbook.php",
        "https://www.ncert.nic.in/ncert-links",
    ]

    def __init__(self):
        self.search_cache: Dict[str, str] = {}

    def fetch_authoritative_content(
        self, question_text: str, class_num: str, subject: str = ""
    ) -> Optional[str]:
        """Fetch relevant authoritative content for a question"""
        cache_key = f"{class_num}:{question_text[:50]}"
        if cache_key in self.search_cache:
            return self.search_cache[cache_key]

        query = self._build_search_query(question_text, class_num, subject)
        content = web_search(query)

        if content:
            self.search_cache[cache_key] = content

        return content

    def _build_search_query(
        self, question_text: str, class_num: str, subject: str
    ) -> str:
        """Build search query for authoritative sources"""
        keywords = question_text[:100]
        query = f"NCERT Class {class_num} {keywords}"
        return query


class AuditAgent:
    def __init__(
        self,
        api_key: str,
        model: str = "moonshotai/kimi-k2-thinking",
        enable_web_search: bool = True,
    ):
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=api_key,
        )
        self.model = model
        self.enable_web_search = enable_web_search
        self.source_fetcher = (
            AuthoritativeSourceFetcher() if enable_web_search else None
        )

        self.system_prompt = """You are a question bank quality assurance expert specializing in Indian education (NCERT curriculum for Classes 6-12).

Your task is to analyze each question and respond with ONLY a valid JSON array (no other text).

## Response Format - STRICT JSON
[{"question_id": "id", "status": "ok"|"needs_fix"|"error", "issues": [], "auto_fixes": {}, "recommendation": "approve"|"needs_review"}]

IMPORTANT: Output must be valid JSON that can be parsed by Python json.loads(). 
- Use double quotes for all strings
- No trailing commas
- No comments or explanations
- No markdown code blocks
- Escape special characters properly

## Quality Rules
 1. **Type Matching**: TRUE_FALSE questions must have definite true/false answers, not explanations
 2. **Superscript Issues**: "a2b" should be "a²b", "x2" should be "x²"
 3. **Complete Explanations**: Answer must include justification, not just "Answer: True"
 4. **Single Question**: Each question should be self-contained, not multi-part
 5. **Valid Content**: No garbled text, date stamps, JS code, or nonsense
 6. **Placeholder Answers**: Reject answers like "reason required", "numerical factor needed"
 7. **Complete Questions**: No incomplete sentences or missing options
 8. **MCQ Type Detection**: If question text contains options like "(a)", "(b)", "(c)", "(d)" or "A)", "B)", "C)", "D)" and answer references these letters, it should be type MCQ not SHORT_ANSWER
 9. **Options in Answer**: If answer contains "(a)", "(b)", "(c)" or "option (a)", "option b" - the question likely has hidden MCQ options and should be converted to MCQ type with proper options extracted
10. **Embedded Options Detection**: If options field contains concatenated options like "7 (b) 8 (c) 9 (d) 10" - this is malformed. Extract properly: options=["7", "8", "9", "10"], answer="8"
11. **True/False Detection**: If answer is "True.", "False.", "true", "false", "Yes", "No" (without explanation), type should be TRUE_FALSE not SHORT_ANSWER
12. **Vague Questions**: If question asks "main message of the chapter" or "what is the theme" without specifying chapter/story name - INVALID. Fix: Add chapter name.
13. **MCQ Options in Question Text**: MCQ questions MUST include options in question text like "(a) option1 (b) option2". If options field exists but question text doesn't have them, ADD them.
14. **DESCRIPTIVE Type**: DESCRIPTIVE type should NOT have MCQ-style options (a,b,c,d). If options exist, change type to MCQ.
15. **Letter Answers**: If answer is "(a)", "(b)", "option a", convert to full option text. correctAnswer should be full text, not letter.
16. **Type-Answer Mismatch**: If question is "What is X?" and answer is definition/explanation, type should be DESCRIPTIVE or SHORT_ANSWER, not TRUE_FALSE.
17. **Vague Definitions**: If answer is full paragraph definition for "What is adaptation?", type should be DESCRIPTIVE or SHORT_ANSWER, not TRUE_FALSE.
18. **Embedded MCQ in SHORT_ANSWER**: If type is SHORT_ANSWER but question text contains multiple option patterns like "(A)", "(B)", "(C)", "(D)" - this is actually MCQ. Convert to MCQ type and extract options.
19. **Concatenated Options**: If question text has options merged like "1:10 10:1 1:1 100:1" without separators - extract and create proper MCQ format.
20. **Multi-part TRUE_FALSE**: If TRUE_FALSE question contains multiple sub-statements like "(a) statement (b) statement" - these should be split into separate questions. One TRUE_FALSE question = one statement only.
21. **TRUE_FALSE Must Have Options**: TRUE_FALSE questions should have "True" and "False" as explicit options in question text or options field. If not provided, add them.
22. **MCQ Must Have 4 Options**: If type is MCQ but options field is empty or has < 4 options, this is invalid. Search trusted sources for actual question with options. If not found, generate 4 plausible options based on question context. Options should be realistic distractors.
23. **TRUE_FALSE Answer Cleanup**: If correctAnswer contains "Explanation:" or extra text like "True because...", extract just "True" or "False". Strip everything after first word if matches true/false.
24. **MCQ Letter → Full Text**: If correctAnswer is "(a)", "(b)", "(c)", "(d)" or just "a", "b", "c", "d", and options array exists, convert to the full option text. Map letter index to options list.
25. **Extract MCQ Options from Text**: If options field is empty but question_text contains "(a) text (b) text (c) text (d) text" patterns, extract them into options array and ensure answer references full text. Handle uppercase letters and variations with periods.
26. **Invalid Type Conversion**: For unsupported types:
    - LONG_ANSWER → DESCRIPTIVE (if answer is paragraph)
    - ESSAY → DESCRIPTIVE (if answer is explanatory text)
    - CONSTRUCTION → SHORT_ANSWER (if answer is brief)
    - MATCHING → needs_review (flag for manual handling)
27. **Multi-part Detection**: If question_text contains multiple sub-questions labeled (a), (b), (c), (d) and type is not MCQ, either split into separate questions (if independent) or change type to MULTI_PART_SHORT_ANSWER if they are meant to be answered together. Flag as error if unclear.

## MATH NOTATION VALIDATION (CRITICAL)
Check for suspicious empty spaces where math operators should be:
- Pattern "X (X Y)" where X is variable and Y is number - likely means "X (X ± Y)" or similar
- Look at the ANSWER and OPTIONS to deduce the correct operator
- For "n (n 1)" - check if answer is "n(n-1)" or "n(n+1)" from options
- Use THINKING REASONING: analyze options to determine operator
- If question has garbled math with empty spaces:
  1. Look at correct answer to determine operator
  2. Look at options for clues
  3. Provide corrected "question" field in auto_fixes

Example: If question shows "n (n 1)" and correct answer is "n(n-1)/2", missing operator is "-". Fix should replace "n (n 1)" with "n(n-1)".

## Analysis Guidelines
- For MATH: Check formula correctness, proper notation (use ², ³, √, π)
- For SCIENCE: Verify scientific accuracy, proper terminology
- For LANGUAGE: Check grammar, proper word usage, spelling
- Use provided authoritative source content to verify factual accuracy when available

## Trusted Source Verification (CRITICAL)
When authoritative content is provided:
1. Compare question and answer with source
2. If source has a DIFFERENT answer, note this as issue and use verified answer
3. Note the source in audit_result
4. Verify the question TYPE matches source format

Trusted sources (in priority order):
- learncbse.in (NCERT solutions, exemplar problems)
- vedantu.com (NCERT solutions, video explanations)
- tiwariacademy.com (NCERT Hindi/English medium)
- cbselabs.com (CBSE labs, sample papers)
- doubtnut.com (NCERT solutions, video answers)

Respond ONLY with JSON array, no explanations."""

    def _build_prompt(
        self, question: Dict, authoritative_content: Optional[str] = None
    ) -> tuple:
        """Build prompt with optional authoritative source content"""

        # Add authoritative content if available
        source_context = ""
        if authoritative_content:
            source_context = f"""
## Authoritative Reference (from web search):
{authoritative_content[:2000]}
"""

        prompt = self.system_prompt + source_context

        q_text = question.get("text", question.get("question_text", ""))
        q_type = question.get("type", "UNKNOWN")
        q_answer = question.get("correctAnswer", question.get("answer", ""))
        q_explanation = question.get("explanation", "")
        q_class = question.get("provenance", {}).get("class", "unknown")
        q_subject = question.get("provenance", {}).get("subject", "")

        user_prompt = f"""## Question to Analyze
Question ID: {question["_id"]}
Class: {q_class}
Subject: {q_subject}
Type: {q_type}
Question: {q_text}
Answer: {q_answer}
Explanation: {q_explanation}

Analyze and respond with JSON array."""

        return prompt, user_prompt

    def audit_questions(self, questions: List[Dict]) -> List[Dict]:
        if not questions:
            return []

        question = questions[0]

        # Pre-validation: Skip obvious problems to save API costs
        is_valid, error_category = pre_validate_question(question)
        if not is_valid:
            q_id = str(question["_id"])
            logger.warning(f"  {q_id}: Pre-validation failed: {error_category}")
            return [
                {
                    "question_id": q_id,
                    "status": "error",
                    "issues": [f"Pre-validation failed: {error_category}"],
                    "error_category": error_category,
                    "recommendation": "manual_review"
                    if error_category in ["corrupted_control_chars", "missing_context"]
                    else "reject",
                }
            ]

        # Fetch authoritative content from web search
        authoritative_content = None
        if self.source_fetcher and self.enable_web_search:
            q_text = question.get("text", question.get("question_text", ""))
            q_class = question.get("provenance", {}).get("class", "6")
            q_subject = question.get("provenance", {}).get("subject", "")
            try:
                authoritative_content = self.source_fetcher.fetch_authoritative_content(
                    q_text, q_class, q_subject
                )
            except Exception as e:
                logger.warning(f"Web search failed: {e}")

        prompt, user_prompt = self._build_prompt(question, authoritative_content)

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
            return self._parse_response(content, questions)

        except Exception as e:
            logger.error(f"API error: {e}")
            return [{"error": str(e)} for _ in questions]

    def _parse_response(self, content: str, questions: List[Dict]) -> List[Dict]:
        results = []

        # Clean up the response
        content = content.strip()

        # Remove markdown code blocks
        content = re.sub(r"```json", "", content)
        content = re.sub(r"```", "", content)

        # Remove thinking tags
        content = re.sub(r"<thinking>.*?</thinking>", "", content, flags=re.DOTALL)

        # Find JSON array or object
        start_idx = content.find("[")
        if start_idx == -1:
            start_idx = content.find("{")

        if start_idx != -1:
            json_str = content[start_idx:]

            # Try to find the end of the JSON
            if json_str.startswith("["):
                # Find matching closing bracket
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

            # Try to parse
            try:
                data = json.loads(json_str)
                if isinstance(data, list):
                    results.extend(data)
                elif isinstance(data, dict):
                    results.append(data)
            except json.JSONDecodeError as e:
                # Try to fix common issues and retry
                try:
                    # Remove trailing commas
                    json_str_fixed = re.sub(r",(\s*[}\]])", r"\1", json_str)
                    data = json.loads(json_str_fixed)
                    if isinstance(data, list):
                        results.extend(data)
                    elif isinstance(data, dict):
                        results.append(data)
                except:
                    logger.warning(f"JSON parse error: {e}")
                    logger.warning(f"Content sample: {json_str[:200]}")

        while len(results) < len(questions):
            results.append(
                {
                    "status": "error",
                    "issues": ["Parse error: Missing result for question"],
                    "error_category": "MISSING_RESULT",
                    "recommendation": "retry",
                }
            )

        return results[: len(questions)]


def apply_rule_based_fixes(question: Dict, result: Dict) -> Dict:
    """Apply rule-based fixes as fallback when LLM missed fixable issues."""
    updates = {}
    q_text = str(question.get("text", "")).strip()
    q_type = question.get("type", "").upper()
    q_answer_raw = question.get("correctAnswer", "")
    # Convert to string if dict/list (e.g., matching questions)
    if isinstance(q_answer_raw, (dict, list)):
        q_answer = json.dumps(q_answer_raw)
    else:
        q_answer = str(q_answer_raw).strip()
    q_options = question.get("options", [])

    # Rule 23: TRUE_FALSE answer cleanup
    if q_type == "TRUE_FALSE" and q_answer:
        cleaned = re.sub(r"^Explanation\s*:?\s*", "", q_answer, flags=re.I).strip()
        first_word = cleaned.split()[0] if cleaned else ""
        if first_word.lower() in ["true", "false"]:
            cleaned = first_word
        if cleaned.lower() in ["true", "false"]:
            updates["correctAnswer"] = cleaned.capitalize()
            result.setdefault("issues", []).append(
                "TRUE_FALSE answer contained explanation"
            )
            result.setdefault("auto_fixes", {})["answer"] = updates["correctAnswer"]

    # Rule 24: MCQ letter -> full text conversion
    if q_type == "MCQ" and q_answer and q_options:
        letter_match = re.match(r"^\(?([a-d])\)?$", q_answer, re.I)
        if letter_match:
            letter = letter_match.group(1).lower()
            idx = ord(letter) - ord("a")
            if 0 <= idx < len(q_options):
                updates["correctAnswer"] = q_options[idx]
                result.setdefault("issues", []).append(
                    "MCQ answer was letter, converted to full text"
                )

    # Rule 25: Extract MCQ options from text
    if q_type == "MCQ" and not q_options:
        pattern = r"\(([a-d])\)\s*([^()]+?)(?=\s*\([a-d]\)|$)"
        matches = re.findall(pattern, q_text, re.I)
        if len(matches) >= 4:
            sorted_matches = sorted(matches, key=lambda m: m[0].lower())
            options = [text.strip() for _, text in sorted_matches[:4]]
            if len(options) == 4:
                updates["options"] = options
                if not any(f"({chr(97 + i)})" in q_text.lower() for i in range(4)):
                    opt_str = " ".join(
                        [f"({chr(97 + i)}) {opt}" for i, opt in enumerate(options)]
                    )
                    updates["text"] = f"{q_text.strip()} {opt_str}"
                result.setdefault("issues", []).append(
                    "Extracted MCQ options from question text"
                )
                result.setdefault("auto_fixes", {})["options"] = options

    # Rule 26: Invalid type conversion
    if q_type in ["LONG_ANSWER", "ESSAY", "CONSTRUCTION"]:
        if q_type in ["LONG_ANSWER", "ESSAY"]:
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

    # Rule 27: Multi-part detection
    if re.search(r"\([a-d]\)\s*\.?\s*[A-Z]", q_text) and q_type not in [
        "MCQ",
        "MULTI_PART_SHORT_ANSWER",
    ]:
        result.setdefault("issues", []).append(
            "Multi-part question with inappropriate type"
        )
        result["recommendation"] = "needs_review"

    return updates


def process_result(
    question: Dict,
    result: Dict,
    db,
    dry_run: bool,
    results_file: str,
    stats: Dict[str, int],
) -> None:
    question_id = str(question["_id"])

    try:
        result["question_id"] = question_id
        result["question_text"] = question.get(
            "text", question.get("question_text", "")
        )
        result["type"] = question.get("type", "UNKNOWN")
        result["correctAnswer"] = question.get(
            "correctAnswer", question.get("answer", "")
        )
        result["timestamp"] = datetime.utcnow().isoformat()

        # Write to JSONL results file
        with open(results_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(result) + "\n")

        if result.get("status") == "ok":
            stats["skipped"] += 1
            logger.info(
                f"  {question_id}: OK - {result.get('recommendation', 'approve')}"
            )
            if not dry_run:
                db.questions.update_one(
                    {"_id": question["_id"]},
                    {
                        "$set": {
                            "audit_status": "ok",
                            "audit_result": ["approved"],
                            "audit_timestamp": datetime.utcnow().isoformat(),
                            "review_status": "PUBLISHED",
                        }
                    },
                )
        elif result.get("status") == "needs_fix":
            stats["fixed"] += 1
            issues = result.get("issues", [])
            logger.info(f"  {question_id}: FIXED - {', '.join(issues[:2])}")

            if not dry_run:
                # Collect LLM auto_fixes
                updates = {}
                auto_fixes = result.get("auto_fixes", {})

                if "type" in auto_fixes:
                    updates["type"] = auto_fixes["type"]
                if "explanation" in auto_fixes:
                    updates["explanation"] = auto_fixes["explanation"]
                if "answer" in auto_fixes:
                    updates["correctAnswer"] = auto_fixes["answer"]
                if "text" in auto_fixes:
                    updates["text"] = auto_fixes["text"]
                if "question" in auto_fixes:
                    updates["text"] = auto_fixes["question"]
                if "options" in auto_fixes:
                    updates["options"] = auto_fixes["options"]
                if "choices" in auto_fixes:
                    updates["options"] = auto_fixes["choices"]

                # Apply LLM fixes first
                if updates:
                    db.questions.update_one(
                        {"_id": question["_id"]},
                        {
                            "$set": {
                                **updates,
                                "audit_status": "fixed",
                                "audit_result": result.get("issues", []),
                                "audit_timestamp": datetime.utcnow().isoformat(),
                                "review_status": "PUBLISHED",
                            }
                        },
                    )
                    logger.info(f"    Applied LLM fixes: {list(updates.keys())}")

                # Apply rule-based fixes as fallback
                q_updated = db.questions.find_one({"_id": question["_id"]})
                if q_updated:
                    combined = {
                        "status": result.get("status", "needs_fix"),
                        "issues": result.get("issues", []),
                        "auto_fixes": auto_fixes,
                    }
                    rule_updates = apply_rule_based_fixes(q_updated, combined)
                    if rule_updates:
                        db.questions.update_one(
                            {"_id": question["_id"]},
                            {
                                "$set": {
                                    **rule_updates,
                                    "audit_status": "fixed",
                                    "audit_result": result.get("issues", []),
                                    "audit_timestamp": datetime.utcnow().isoformat(),
                                    "review_status": "PUBLISHED",
                                }
                            },
                        )
                        logger.info(
                            f"    Applied rule-based fixes: {list(rule_updates.keys())}"
                        )
                        updates.update(rule_updates)

                # Post-process: Convert letter answers to full text (legacy)
                q_updated = db.questions.find_one({"_id": question["_id"]})
                if q_updated and q_updated.get("type") == "MCQ":
                    answer = q_updated.get("correctAnswer", "")
                    options = q_updated.get("options", [])
                    if answer and len(answer) <= 5 and "(" in answer:
                        letter = (
                            answer.strip().replace("(", "").replace(")", "").lower()
                        )
                        if letter in ["a", "b", "c", "d"] and options:
                            idx = ord(letter) - ord("a")
                            if 0 <= idx < len(options):
                                db.questions.update_one(
                                    {"_id": question["_id"]},
                                    {"$set": {"correctAnswer": options[idx]}},
                                )
                                logger.info(
                                    f"    Converted letter answer to full text: {options[idx]}"
                                )

                # Post-process: Add options to question text if missing
                q_check = db.questions.find_one({"_id": question["_id"]})
                if q_check and q_check.get("type") == "MCQ":
                    q_text = q_check.get("text", "")
                    opts = q_check.get("options", [])
                    if opts and not any(
                        f"({chr(97 + i)})" in q_text.lower()
                        or f"({chr(65 + i)})" in q_text
                        for i in range(len(opts))
                    ):
                        opt_str = " ".join(
                            [f"({chr(97 + i)}) {opt}" for i, opt in enumerate(opts)]
                        )
                        new_text = f"{q_text.strip()} {opt_str}"
                        db.questions.update_one(
                            {"_id": question["_id"]}, {"$set": {"text": new_text}}
                        )
                        logger.info(f"    Added options to question text")

                if updates:
                    logger.info(f"    Applied fixes: {list(updates.keys())}")
                else:
                    logger.warning(
                        f"    No fixes could be applied despite needs_fix status"
                    )
                    db.questions.update_one(
                        {"_id": question["_id"]},
                        {
                            "$set": {
                                "audit_status": "error",
                                "audit_result": [
                                    "No auto_fixes provided and rule-based fixes not applicable"
                                ],
                                "audit_timestamp": datetime.utcnow().isoformat(),
                            }
                        },
                    )
        else:
            stats["errors"] += 1
            logger.warning(
                f"  {question_id}: ERROR - {result.get('issues', ['Unknown'])}"
            )
            if not dry_run:
                update_doc = {
                    "audit_status": "error",
                    "audit_result": result.get("issues", ["Parse error"]),
                    "audit_errors": str(result.get("error", "Parse error")),
                    "audit_timestamp": datetime.utcnow().isoformat(),
                }
                # Add error_category if present (from pre-validation or parse categorization)
                if result.get("error_category"):
                    update_doc["error_category"] = result["error_category"]
                db.questions.update_one({"_id": question["_id"]}, {"$set": update_doc})

        stats["processed"] += 1

    except Exception as e:
        logger.error(f"Error processing result: {e}")
        stats["errors"] += 1


def audit_class(
    db,
    agent: AuditAgent,
    class_num: str,
    batch_size: int = 1,
    dry_run: bool = True,
    statuses: List[str] = None,
    results_file: str = "audit-results.jsonl",
    processed_ids: Optional[Set[str]] = None,
) -> Dict[str, int]:
    """Audit all questions for a given class number."""
    if statuses is None:
        statuses = ["DRAFT", "PUBLISHED"]

    if processed_ids is None:
        processed_ids = set()

    stats = {"processed": 0, "fixed": 0, "skipped": 0, "errors": 0}
    total_processed = 0

    for status in statuses:
        query = {
            "provenance.class": class_num,
            "review_status": status,
        }
        questions = list(db.questions.find(query))

        if not questions:
            continue

        logger.info(f"Class {class_num}, Status '{status}': {len(questions)} questions")

        batch = []
        for q in questions:
            if str(q["_id"]) in processed_ids:
                stats["skipped"] += 1
                continue

            batch.append(q)

            if len(batch) >= batch_size:
                results = agent.audit_questions(batch)
                for question, result in zip(batch, results):
                    result["class"] = class_num
                    result["status_db"] = status
                    process_result(question, result, db, dry_run, results_file, stats)
                batch = []
                total_processed += len(results)
                logger.info(f"Progress: {total_processed} for Class {class_num}")
                time.sleep(0.5)

        if batch:
            results = agent.audit_questions(batch)
            for question, result in zip(batch, results):
                result["class"] = class_num
                result["status_db"] = status
                process_result(question, result, db, dry_run, results_file, stats)
            total_processed += len(results)
            logger.info(f"Progress: {total_processed} for Class {class_num}")

    logger.info(f"Completed Class {class_num}: {total_processed} processed")
    return stats


def load_processed_ids(results_file: str) -> Set[str]:
    """Load already processed question IDs"""
    processed = set()
    if os.path.exists(results_file):
        with open(results_file, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    d = json.loads(line)
                    processed.add(d["question_id"])
                except json.JSONDecodeError:
                    pass
    return processed


def main():
    parser = argparse.ArgumentParser(
        description="Enhanced Question Bank Audit Agent with Web Search"
    )
    parser.add_argument(
        "--class-num",
        help="Class number to audit (optional)",
    )
    parser.add_argument("--batch-size", type=int, default=1, help="Batch size")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        default=False,
        help="Dry run mode (no changes)",
    )
    parser.add_argument(
        "--model",
        default="mistralai/mistral-small-4-119b-2603",
        help="Model to use (mistralai/mistral-small-4-119b-2603 - best GPQA)",
    )
    parser.add_argument(
        "--classes",
        nargs="+",
        default=["6", "7", "8", "9", "10", "11", "12"],
        help="Classes to audit",
    )
    parser.add_argument(
        "--results-file",
        default="audit-results.jsonl",
        help="Results file path",
    )
    parser.add_argument(
        "--no-web-search",
        action="store_true",
        help="Disable web search for authoritative verification",
    )
    args = parser.parse_args()

    logger.info(f"Model: {args.model}")
    logger.info(f"Batch size: {args.batch_size}")
    logger.info(f"Dry run: {args.dry_run}")
    logger.info(f"Web search: {not args.no_web_search}")

    try:
        db = get_mongodb_connection()
        logger.info("Connected to MongoDB")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        return 1

    api_key = load_api_key()
    agent = AuditAgent(api_key, args.model, enable_web_search=not args.no_web_search)

    processed_ids = load_processed_ids(args.results_file)
    logger.info(f"Already processed: {len(processed_ids)} questions")

    classes_to_process = [args.class_num] if args.class_num else args.classes

    total_stats = {"processed": 0, "fixed": 0, "skipped": 0, "errors": 0}

    for class_num in classes_to_process:
        logger.info(f"=== Starting audit for Class {class_num} ===")

        stats = audit_class(
            db,
            agent,
            class_num,
            args.batch_size,
            args.dry_run,
            results_file=args.results_file,
            processed_ids=processed_ids,
        )

        for key in total_stats:
            total_stats[key] += stats[key]

        logger.info(f"=== Class {class_num} Summary ===")
        logger.info(
            f"Processed: {stats['processed']}, Fixed: {stats['fixed']}, OK: {stats['skipped']}, Errors: {stats['errors']}"
        )

    logger.info("=== FINAL SUMMARY ===")
    logger.info(f"Total Processed: {total_stats['processed']}")
    logger.info(f"Total Fixed: {total_stats['fixed']}")
    logger.info(f"Total OK: {total_stats['skipped']}")
    logger.info(f"Total Errors: {total_stats['errors']}")
    if args.dry_run:
        logger.info("(dry-run - no changes made)")

    return 0


if __name__ == "__main__":
    sys.exit(main())
