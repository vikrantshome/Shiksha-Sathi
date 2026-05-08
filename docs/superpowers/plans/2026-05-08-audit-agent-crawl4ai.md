# Upgrade Audit Agent with crawl4ai — NCERT Semantic Verification

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Python audit-agent to use crawl4ai for semantic verification of NCERT questions against official sources, adding checks for source validity, answer correctness, and chapter alignment — without requiring exact text matches.

**Architecture:** The audit-agent will gain a new `ncert_verifier` module that uses crawl4ai's `AsyncWebCrawler` to fetch official NCERT textbook/exemplar pages. An LLM-based extraction strategy (via crawl4ai) will parse the official content and compare it semantically with the database question. The comparison is **not** exact text matching — it verifies the question makes sense, the answer is correct, and the source exists.

**Tech Stack:** Python 3.11+, crawl4ai (async web crawler), pymongo, pydantic, asyncio

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `audit-agent/requirements.txt` | Modify | Add crawl4ai + pydantic dependencies |
| `audit-agent/config.py` | Modify | Add crawl4ai/LLM config (provider, API key, rate limits) |
| `audit-agent/ncert_url_builder.py` | Create | Map Provenance fields → NCERT URLs |
| `audit-agent/ncert_scraper.py` | Create | crawl4ai-based async scraper for NCERT pages |
| `audit-agent/ncert_verifier.py` | Create | Semantic comparison logic (LLM-based verification) |
| `audit-agent/main.py` | Modify | Integrate ncert_verifier into audit pipeline |
| `audit-agent/prompts/verify_question.txt` | Create | LLM prompt for question verification |

---

## Task 1: Add Dependencies

**Files:**
- Modify: `audit-agent/requirements.txt`

- [ ] **Step 1: Add crawl4ai and pydantic to requirements**

Add to `audit-agent/requirements.txt`:
```
crawl4ai>=0.4.0
pydantic>=2.0.0
```

- [ ] **Step 2: Install dependencies**

```bash
cd audit-agent
pip install -r requirements.txt
```

Expected: crawl4ai and pydantic install successfully.

---

## Task 2: Update Configuration

**Files:**
- Modify: `audit-agent/config.py`

- [ ] **Step 1: Add crawl4ai/LLM configuration**

```python
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/shikshasathi")
DB_NAME = os.getenv("DB_NAME", "shikshasathi")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

BATCH_SIZE = int(os.getenv("AUDIT_BATCH_SIZE", "50"))
MAX_QUESTIONS = int(os.getenv("AUDIT_MAX_QUESTIONS", "1000"))
FIX_MODES = ["placeholder_answer", "corrupted_control_chars", "empty_explanation", "mcq_options", "ncert_mismatch", "answer_verification_failed", "chapter_mismatch"]

# crawl4ai / LLM config
LLM_PROVIDER = os.getenv("AUDIT_LLM_PROVIDER", "gemini/gemini-2.0-flash")
LLM_API_KEY = os.getenv("AUDIT_LLM_API_KEY") or os.getenv("GEMINI_API_KEY")
LLM_TEMPERATURE = float(os.getenv("AUDIT_LLM_TEMPERATURE", "0.1"))

# Rate limiting for NCERT site
NCERT_REQUEST_DELAY = float(os.getenv("NCERT_REQUEST_DELAY", "2.0"))
NCERT_MAX_RETRIES = int(os.getenv("NCERT_MAX_RETRIES", "3"))
NCERT_CACHE_DIR = os.getenv("NCERT_CACHE_DIR", "./.ncert_cache")

# Enable/disable external verification
ENABLE_NCERT_VERIFICATION = os.getenv("ENABLE_NCERT_VERIFICATION", "true").lower() == "true"
```

---

## Task 3: Build NCERT URL Builder

**Files:**
- Create: `audit-agent/ncert_url_builder.py`

- [ ] **Step 1: Create URL builder module**

```python
"""Build NCERT URLs from question provenance metadata."""
import re
from typing import Optional

# NCERT textbook PDF base URLs by class and subject
TEXTBOOK_URL_PATTERNS = {
    "Mathematics": {
        "6": "https://ncert.nic.in/textbook/pdf/gemh1/{chapter:02d}.pdf",
        "7": "https://ncert.nic.in/textbook/pdf/gemh2/{chapter:02d}.pdf",
        "8": "https://ncert.nic.in/textbook/pdf/gemh3/{chapter:02d}.pdf",
        "9": "https://ncert.nic.in/textbook/pdf/gemh1/{chapter:02d}.pdf",
        "10": "https://ncert.nic.in/textbook/pdf/gemh2/{chapter:02d}.pdf",
        "11": "https://ncert.nic.in/textbook/pdf/gemh1/{chapter:02d}.pdf",
        "12": "https://ncert.nic.in/textbook/pdf/gemh1/{chapter:02d}.pdf",
    },
    "Science": {
        "6": "https://ncert.nic.in/textbook/pdf/gesc1/{chapter:02d}.pdf",
        "7": "https://ncert.nic.in/textbook/pdf/gesc2/{chapter:02d}.pdf",
        "8": "https://ncert.nic.in/textbook/pdf/gesc3/{chapter:02d}.pdf",
        "9": "https://ncert.nic.in/textbook/pdf/gesc1/{chapter:02d}.pdf",
        "10": "https://ncert.nic.in/textbook/pdf/gesc2/{chapter:02d}.pdf",
    },
}

EXEMPLAR_BASE_URL = "https://ncert.nic.in/exemplar-problems.php"


def build_textbook_pdf_url(provenance: dict) -> Optional[str]:
    """Build PDF URL for NCERT textbook chapter.
    
    Args:
        provenance: Question provenance dict with keys:
            - subject (str)
            - class (str)
            - chapterNumber (int)
            
    Returns:
        URL string or None if pattern not available.
    """
    subject = provenance.get("subject", "")
    class_level = str(provenance.get("class", ""))
    chapter = provenance.get("chapterNumber")
    
    if not subject or not class_level or chapter is None:
        return None
    
    patterns = TEXTBOOK_URL_PATTERNS.get(subject)
    if not patterns:
        return None
    
    url_template = patterns.get(class_level)
    if not url_template:
        return None
    
    return url_template.format(chapter=int(chapter))


def build_exemplar_url(provenance: dict) -> Optional[str]:
    """Build URL for NCERT exemplar problems page.
    
    Args:
        provenance: Question provenance dict.
        
    Returns:
        URL string or None.
    """
    subject = provenance.get("subject", "")
    class_level = str(provenance.get("class", ""))
    
    if not subject or not class_level:
        return None
    
    # Construct exemplar query params
    params = f"?class={class_level}&subject={subject.replace(' ', '+')}"
    return EXEMPLAR_BASE_URL + params


def build_ncert_url(provenance: dict, source_kind: str = "CANONICAL") -> Optional[str]:
    """Build appropriate NCERT URL based on source kind.
    
    Args:
        provenance: Question provenance dict.
        source_kind: CANONICAL, DERIVED, or EXEMPLAR.
        
    Returns:
        URL string or None.
    """
    if source_kind == "EXEMPLAR":
        return build_exemplar_url(provenance)
    
    return build_textbook_pdf_url(provenance)


def get_subject_slug(subject: str) -> str:
    """Convert subject name to NCERT URL slug."""
    slug_map = {
        "Mathematics": "math",
        "Science": "sc",
        "English": "eng",
        "Physics": "phy",
        "Chemistry": "chem",
        "Biology": "bio",
        "Social Science": "socsc",
    }
    return slug_map.get(subject, subject.lower().replace(" ", ""))
```

---

## Task 4: Build NCERT Scraper

**Files:**
- Create: `audit-agent/ncert_scraper.py`

- [ ] **Step 1: Create async scraper using crawl4ai**

```python
"""Async NCERT content scraper using crawl4ai."""
import asyncio
import os
from typing import Optional
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
from crawl4ai import LLMConfig, LLMExtractionStrategy
from pydantic import BaseModel, Field

from config import LLM_PROVIDER, LLM_API_KEY, LLM_TEMPERATURE, NCERT_REQUEST_DELAY, NCERT_CACHE_DIR


class NcertQuestionContent(BaseModel):
    """Schema for LLM-extracted question content from NCERT pages."""
    found: bool = Field(description="Whether the question was found on the page")
    question_text: str = Field(description="The actual question text from NCERT")
    answer: str = Field(description="The official answer from NCERT")
    explanation: str = Field(description="Any explanation provided in NCERT")
    exercise_name: str = Field(description="Which exercise or section this belongs to")
    confidence: float = Field(description="Confidence score 0-1 that this is the correct match")
    reasoning: str = Field(description="Brief reasoning for the match decision")


class NcertScraper:
    """Scraper for NCERT official content using crawl4ai."""
    
    def __init__(self):
        self.browser_config = BrowserConfig(
            headless=True,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        self.llm_config = LLMConfig(
            provider=LLM_PROVIDER,
            api_token=LLM_API_KEY,
        )
        self._crawler: Optional[AsyncWebCrawler] = None
    
    async def __aenter__(self):
        self._crawler = AsyncWebCrawler(config=self.browser_config)
        await self._crawler.__aenter__()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._crawler:
            await self._crawler.__aexit__(exc_type, exc_val, exc_tb)
            self._crawler = None
    
    async def fetch_page_content(self, url: str) -> str:
        """Fetch raw page content (markdown) from URL.
        
        Args:
            url: NCERT page URL.
            
        Returns:
            Markdown content string.
        """
        if not self._crawler:
            raise RuntimeError("Scraper not initialized. Use async context manager.")
        
        run_config = CrawlerRunConfig(
            cache_mode=CacheMode.ENABLED,
            word_count_threshold=10,
            page_timeout=30000,
        )
        
        result = await self._crawler.arun(url=url, config=run_config)
        
        if not result.success:
            raise RuntimeError(f"Failed to fetch {url}: {result.error_message}")
        
        return result.markdown or ""
    
    async def verify_question_against_source(
        self,
        url: str,
        question_text: str,
        correct_answer: str,
        question_type: str,
    ) -> NcertQuestionContent:
        """Verify a question against its NCERT source using LLM extraction.
        
        Args:
            url: NCERT source URL.
            question_text: The question text from our database.
            correct_answer: The answer from our database.
            question_type: MCQ, SHORT_ANSWER, etc.
            
        Returns:
            NcertQuestionContent with verification results.
        """
        if not self._crawler:
            raise RuntimeError("Scraper not initialized. Use async context manager.")
        
        instruction = f"""You are verifying NCERT question content. 

Given the NCERT source page and a candidate question, determine:
1. Does the source contain a question semantically equivalent to the candidate?
2. What is the official answer in the source?
3. Does the candidate answer match the official answer?

Candidate question: "{question_text}"
Candidate answer: "{correct_answer}"
Question type: {question_type}

Important: The question text may be paraphrased or use different wording. 
Focus on whether the QUESTION CONCEPT and ANSWER are correct, not exact text matching.
Return structured JSON matching the schema."""
        
        run_config = CrawlerRunConfig(
            cache_mode=CacheMode.ENABLED,
            word_count_threshold=1,
            page_timeout=45000,
            extraction_strategy=LLMExtractionStrategy(
                llm_config=self.llm_config,
                schema=NcertQuestionContent.model_json_schema(),
                extraction_type="schema",
                instruction=instruction,
                extra_args={"temperature": LLM_TEMPERATURE, "max_tokens": 2000},
            ),
        )
        
        result = await self._crawler.arun(url=url, config=run_config)
        
        if not result.success or not result.extracted_content:
            return NcertQuestionContent(
                found=False,
                question_text="",
                answer="",
                explanation="",
                exercise_name="",
                confidence=0.0,
                reasoning=f"Failed to extract: {result.error_message}",
            )
        
        import json
        data = json.loads(result.extracted_content)
        return NcertQuestionContent(**data)
    
    async def verify_with_delay(
        self,
        url: str,
        question_text: str,
        correct_answer: str,
        question_type: str,
    ) -> NcertQuestionContent:
        """Verify with rate limiting delay."""
        await asyncio.sleep(NCERT_REQUEST_DELAY)
        return await self.verify_question_against_source(
            url, question_text, correct_answer, question_type
        )
```

---

## Task 5: Build NCERT Verifier

**Files:**
- Create: `audit-agent/ncert_verifier.py`

- [ ] **Step 1: Create semantic verification module**

```python
"""Semantic verification of questions against NCERT official sources."""
import asyncio
from typing import Optional, List, Dict, Any
from ncert_url_builder import build_ncert_url
from ncert_scraper import NcertScraper
from config import ENABLE_NCERT_VERIFICATION


class NcertVerificationResult:
    """Result of verifying a question against NCERT sources."""
    
    def __init__(
        self,
        verified: bool,
        issues: List[str],
        fixes: List[Dict[str, Any]],
        source_found: bool,
        confidence: float,
        reasoning: str,
    ):
        self.verified = verified
        self.issues = issues
        self.fixes = fixes
        self.source_found = source_found
        self.confidence = confidence
        self.reasoning = reasoning


async def verify_question_ncert(question: dict) -> NcertVerificationResult:
    """Verify a single question against NCERT official sources.
    
    This performs semantic verification — it checks whether the question
    concept and answer are correct per NCERT, NOT exact text matching.
    
    Args:
        question: Question dict from MongoDB.
        
    Returns:
        NcertVerificationResult with findings.
    """
    if not ENABLE_NCERT_VERIFICATION:
        return NcertVerificationResult(
            verified=True,
            issues=[],
            fixes=[],
            source_found=True,
            confidence=1.0,
            reasoning="NCERT verification disabled",
        )
    
    provenance = question.get("provenance", {})
    source_kind = question.get("sourceKind", "CANONICAL")
    
    if not provenance:
        return NcertVerificationResult(
            verified=False,
            issues=["missing_provenance"],
            fixes=[{
                "field": "provenance",
                "issue": "missing_provenance",
                "suggestion": "Question has no provenance metadata — cannot verify source",
            }],
            source_found=False,
            confidence=0.0,
            reasoning="No provenance metadata available",
        )
    
    url = build_ncert_url(provenance, source_kind)
    
    if not url:
        return NcertVerificationResult(
            verified=False,
            issues=["ncert_url_unavailable"],
            fixes=[{
                "field": "provenance",
                "issue": "ncert_url_unavailable",
                "suggestion": f"No NCERT URL pattern for subject={provenance.get('subject')}, class={provenance.get('class')}",
            }],
            source_found=False,
            confidence=0.0,
            reasoning="Cannot construct NCERT URL from provenance",
        )
    
    async with NcertScraper() as scraper:
        try:
            result = await scraper.verify_with_delay(
                url=url,
                question_text=question.get("text", ""),
                correct_answer=question.get("correctAnswer", ""),
                question_type=question.get("type", ""),
            )
        except Exception as e:
            return NcertVerificationResult(
                verified=False,
                issues=["ncert_fetch_failed"],
                fixes=[{
                    "field": "verification",
                    "issue": "ncert_fetch_failed",
                    "suggestion": f"Failed to fetch NCERT source: {str(e)}",
                }],
                source_found=False,
                confidence=0.0,
                reasoning=f"Fetch failed: {str(e)}",
            )
    
    issues = []
    fixes = []
    
    if not result.found:
        issues.append("ncert_source_missing")
        fixes.append({
            "field": "text",
            "issue": "ncert_source_missing",
            "suggestion": "Question not found in claimed NCERT source — verify provenance or remove",
        })
    
    if result.found and result.confidence < 0.5:
        issues.append("ncert_low_confidence_match")
        fixes.append({
            "field": "text",
            "issue": "ncert_low_confidence_match",
            "suggestion": f"Low confidence match ({result.confidence:.2f}) — manual review needed",
        })
    
    if result.found and result.answer:
        db_answer = str(question.get("correctAnswer", "")).strip().lower()
        ncert_answer = str(result.answer).strip().lower()
        
        if db_answer and ncert_answer and db_answer != ncert_answer:
            issues.append("answer_verification_failed")
            fixes.append({
                "field": "correctAnswer",
                "issue": "answer_verification_failed",
                "suggestion": f"DB answer '{db_answer}' differs from NCERT answer '{ncert_answer}'",
            })
    
    verified = len(issues) == 0
    
    return NcertVerificationResult(
        verified=verified,
        issues=issues,
        fixes=fixes,
        source_found=result.found,
        confidence=result.confidence,
        reasoning=result.reasoning,
    )


async def batch_verify_questions(questions: List[dict]) -> List[NcertVerificationResult]:
    """Verify multiple questions concurrently with rate limiting.
    
    Args:
        questions: List of question dicts.
        
    Returns:
        List of NcertVerificationResult in same order.
    """
    semaphore = asyncio.Semaphore(3)  # Max 3 concurrent NCERT requests
    
    async def _verify_with_limit(q):
        async with semaphore:
            return await verify_question_ncert(q)
    
    tasks = [_verify_with_limit(q) for q in questions]
    return await asyncio.gather(*tasks)
```

---

## Task 6: Integrate into Main Audit Pipeline

**Files:**
- Modify: `audit-agent/main.py`

- [ ] **Step 1: Import ncert_verifier and add new checks**

```python
import json
import sys
import argparse
import asyncio
from datetime import datetime
from pymongo import UpdateOne
from mongodb_utils import get_questions_collection, get_audit_logs_collection, get_audit_queue_collection, close_connection
from config import BATCH_SIZE, MAX_QUESTIONS, FIX_MODES
from ncert_verifier import verify_question_ncert


def audit_question(question):
    issues = []
    fixes = []
    
    text = question.get("text", "")
    answer = question.get("answer", "")
    explanation = question.get("explanation", "")
    q_type = question.get("type", "")
    options = question.get("options", [])
    
    if not text or len(text.strip()) < 5:
        issues.append("empty_or_short_text")
    
    if answer in ["", None, "Not provided", "N/A", "TBD"]:
        issues.append("placeholder_answer")
        fixes.append({
            "field": "answer",
            "issue": "placeholder_answer",
            "suggestion": "Answer needs to be extracted from source material"
        })
    
    if explanation in ["", None, "Not provided"]:
        issues.append("empty_explanation")
        fixes.append({
            "field": "explanation",
            "issue": "empty_explanation",
            "suggestion": "Explanation needs to be added"
        })
    
    if q_type == "MCQ":
        if not options or len(options) < 2:
            issues.append("insufficient_options")
            fixes.append({
                "field": "options",
                "issue": "insufficient_options",
                "suggestion": f"Need at least 2 options, found {len(options)}"
            })
        elif len(options) != 4:
            issues.append("non_standard_option_count")
    
    if q_type == "TRUE_FALSE":
        if options and len(options) != 2:
            issues.append("true_false_invalid_options")
    
    corrupted_chars = ['\x00', '\x01', '\x02', '\x03', '\x04', '\x05']
    for char in corrupted_chars:
        if char in text or char in str(answer) or char in str(explanation):
            issues.append("corrupted_control_chars")
            fixes.append({
                "field": "text",
                "issue": "corrupted_control_chars",
                "suggestion": "Remove corrupted control characters"
            })
            break
    
    return {
        "question_id": str(question.get("_id")),
        "issues": issues,
        "fixes": fixes,
        "severity": "high" if len(issues) > 2 else "medium" if len(issues) > 0 else "low"
    }


async def run_audit(mode="check", fix_mode=None, class_level=None, subject=None, limit=MAX_QUESTIONS, enable_ncert=False):
    questions_collection = get_questions_collection()
    audit_logs_collection = get_audit_logs_collection()
    audit_queue_collection = get_audit_queue_collection()
    
    query = {}
    if class_level:
        query["provenance.class"] = str(class_level)
    if subject:
        query["provenance.subject"] = subject
    
    total_count = questions_collection.count_documents(query)
    print(f"Found {total_count} questions to audit")
    
    if total_count == 0:
        print("No questions found matching criteria")
        return
    
    audit_results = []
    fixes_applied = 0
    queued_items = 0
    ncert_results = []
    
    cursor = questions_collection.find(query).limit(min(limit, total_count))
    questions = list(cursor)
    
    # Run NCERT verification if enabled
    if enable_ncert:
        print(f"Running NCERT verification on {len(questions)} questions...")
        ncert_results = await batch_verify_questions(questions)
        print(f"NCERT verification complete")
    
    for idx, question in enumerate(questions):
        result = audit_question(question)
        
        # Merge NCERT findings if available
        if enable_ncert and idx < len(ncert_results):
            ncert = ncert_results[idx]
            result["issues"].extend(ncert.issues)
            result["fixes"].extend(ncert.fixes)
            result["ncert_verified"] = ncert.verified
            result["ncert_confidence"] = ncert.confidence
            result["ncert_reasoning"] = ncert.reasoning
        
        if result["issues"]:
            audit_results.append(result)
            
            audit_logs_collection.insert_one({
                "question_id": result["question_id"],
                "issues": result["issues"],
                "fixes": result["fixes"],
                "severity": result["severity"],
                "created_at": datetime.utcnow(),
                "status": "pending_review",
                **({"ncert_verified": result.get("ncert_verified")} if enable_ncert else {}),
                **({"ncert_confidence": result.get("ncert_confidence")} if enable_ncert else {}),
                **({"ncert_reasoning": result.get("ncert_reasoning")} if enable_ncert else {}),
            })
            
            if mode == "fix" and result["fixes"]:
                should_fix = True
                if fix_mode:
                    should_fix = any(f["issue"] == fix_mode for f in result["fixes"])
                
                if should_fix:
                    for fix in result["fixes"]:
                        if fix_mode and fix["issue"] != fix_mode:
                            continue
                        
                        audit_queue_collection.insert_one({
                            "question_id": result["question_id"],
                            "suggested_fix": fix["suggestion"],
                            "field": fix["field"],
                            "issue_type": fix["issue"],
                            "confidence": 0.8,
                            "status": "pending",
                            "created_at": datetime.utcnow()
                        })
                        queued_items += 1
    
    summary = {
        "total_audited": len(questions),
        "issues_found": len(audit_results),
        "fixes_queued": queued_items,
        "mode": mode,
        "ncert_verification": enable_ncert,
        "criteria": {
            "class_level": class_level,
            "subject": subject,
            "limit": limit
        }
    }
    
    print(f"\nAudit Complete:")
    print(f"  Total questions audited: {summary['total_audited']}")
    print(f"  Issues found: {summary['issues_found']}")
    print(f"  Fixes queued: {summary['fixes_queued']}")
    if enable_ncert:
        ncert_verified_count = sum(1 for r in ncert_results if r.verified)
        print(f"  NCERT verified: {ncert_verified_count}/{len(questions)}")
    
    return summary


def main():
    parser = argparse.ArgumentParser(description="Audit questions for quality issues")
    parser.add_argument("--mode", choices=["check", "fix"], default="check",
                       help="Audit mode: check only or queue fixes")
    parser.add_argument("--fix-mode", choices=FIX_MODES,
                       help="Specific fix mode to apply")
    parser.add_argument("--class", dest="class_level", type=int,
                       help="Filter by class level (6-12)")
    parser.add_argument("--subject",
                       help="Filter by subject")
    parser.add_argument("--limit", type=int, default=MAX_QUESTIONS,
                       help="Maximum questions to audit")
    parser.add_argument("--ncert", action="store_true",
                       help="Enable NCERT external verification via crawl4ai")
    
    args = parser.parse_args()
    
    try:
        summary = asyncio.run(run_audit(
            mode=args.mode,
            fix_mode=args.fix_mode,
            class_level=args.class_level,
            subject=args.subject,
            limit=args.limit,
            enable_ncert=args.ncert
        ))
        
        print(json.dumps(summary, indent=2, default=str))
        
    except Exception as e:
        print(f"Error during audit: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        close_connection()


if __name__ == "__main__":
    main()
```

---

## Task 7: Update Backend AuditService

**Files:**
- Modify: `backend/api/src/main/java/com/shikshasathi/backend/api/service/AuditService.java`

- [ ] **Step 1: Add --ncert flag to ProcessBuilder**

```java
public String runAudit(AuditRequestDTO request) throws Exception {
    String scriptPath = "audit-agent/main.py";
    List<String> command = new ArrayList<>(List.of(
        "python3", scriptPath,
        "--mode", request.getMode() != null ? request.getMode() : "check",
        "--limit", String.valueOf(request.getLimit() != null ? request.getLimit() : 100)
    ));
    
    if (request.getClassLevel() != null) {
        command.add("--class");
        command.add(String.valueOf(request.getClassLevel()));
    }
    if (request.getSubject() != null) {
        command.add("--subject");
        command.add(request.getSubject());
    }
    if (request.getFixMode() != null) {
        command.add("--fix-mode");
        command.add(request.getFixMode());
    }
    if (Boolean.TRUE.equals(request.getEnableNcert())) {
        command.add("--ncert");
    }
    
    ProcessBuilder pb = new ProcessBuilder(command);
    pb.directory(new java.io.File("."));
    pb.redirectErrorStream(true);
    Process process = pb.start();
    
    // ... rest unchanged
}
```

- Modify: `backend/api/src/main/java/com/shikshasathi/backend/api/dto/audit/AuditRequestDTO.java`

```java
package com.shikshasathi.backend.api.dto.audit;

import lombok.Data;

@Data
public class AuditRequestDTO {
    private String mode;
    private Integer limit;
    private Integer classLevel;
    private String subject;
    private String fixMode;
    private Boolean enableNcert;
}
```

---

## Task 8: Update Frontend

**Files:**
- Modify: `src/lib/api/audit.ts`

- [ ] **Step 1: Add enableNcert to runAudit**

```typescript
export interface AuditRunRequest {
  mode?: 'check' | 'fix';
  limit?: number;
  classLevel?: number;
  subject?: string;
  fixMode?: string;
  enableNcert?: boolean;
}

export const audit = {
  // ... getStats, getQueue, approveFix, rejectFix unchanged

  runAudit: async (request: AuditRunRequest): Promise<string> => {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/admin/audit/run`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(text || `Server error (${response.status})`);
    }

    return response.text();
  },
};
```

- Modify: `src/app/admin/audit/page.tsx`

- [ ] **Step 2: Add NCERT toggle to Run Audit modal**

Add a checkbox in the modal:
```tsx
<div className="flex items-center gap-2">
  <input
    type="checkbox"
    id="enableNcert"
    checked={runParams.enableNcert || false}
    onChange={(e) =>
      setRunParams({ ...runParams, enableNcert: e.target.checked })
    }
    className="w-4 h-4"
  />
  <label htmlFor="enableNcert" className="text-sm text-on-surface-variant">
    Verify against NCERT official sources (slower)
  </label>
</div>
```

---

## Task 9: Update AuditQueueItem Model

**Files:**
- Modify: `backend/api/src/main/java/com/shikshasathi/backend/api/dto/audit/AuditQueueItemDTO.java`
- Modify: `backend/core/src/main/java/com/shikshasathi/backend/core/domain/audit/AuditQueueItem.java`

- [ ] **Step 1: Add ncert fields to DTO and entity**

Add to `AuditQueueItemDTO`:
```java
private Boolean ncertVerified;
private Double ncertConfidence;
private String ncertReasoning;
```

Add to `AuditQueueItem` entity (same fields).

---

## Task 10: Testing

- [ ] **Step 1: Run audit without --ncert**

```bash
cd /Users/anuraagpatil/naviksha/Shiksha Sathi
python3 audit-agent/main.py --class 6 --subject Science --limit 5 --mode check
```

Expected: Works as before, no issues.

- [ ] **Step 2: Run audit with --ncert**

```bash
python3 audit-agent/main.py --class 6 --subject Science --limit 2 --mode check --ncert
```

Expected: Slower (due to web requests), may find `ncert_source_missing` or `answer_verification_failed` issues.

- [ ] **Step 3: Run backend build**

```bash
cd backend && ./gradlew build
```

Expected: Builds successfully.

- [ ] **Step 4: Run frontend typecheck**

```bash
npx tsc --noEmit
```

Expected: No errors.

---

## Spec Coverage Checklist

| Requirement | Task | Status |
|------------|------|--------|
| Add crawl4ai dependency | Task 1 | Planned |
| Create NCERT URL builder | Task 3 | Planned |
| Create async scraper | Task 4 | Planned |
| Add semantic verification (not exact match) | Task 5 | Planned |
| Integrate into audit pipeline | Task 6 | Planned |
| New issue types: ncert_source_missing, answer_verification_failed | Task 5, 6 | Planned |
| New fix modes | Task 2 (config) | Planned |
| Backend API updates | Task 7 | Planned |
| Frontend NCERT toggle | Task 8 | Planned |
| Testing | Task 10 | Planned |

---

## Open Decisions

1. **LLM Provider**: Default is `gemini/gemini-2.0-flash` (already in project). Can be overridden via env.
2. **Rate Limiting**: 2-second delay between NCERT requests, max 3 concurrent. Configurable.
3. **Text Matching Strategy**: Semantic via LLM — NOT exact match. The prompt explicitly instructs the LLM to check concept/answer correctness, not wording.
4. **Caching**: crawl4ai internal cache + NCERT_CACHE_DIR for raw content.
5. **Scope**: Only CANONICAL and EXEMPLAR questions. DERIVED questions (AI-generated) are skipped for NCERT verification.

---

**Plan complete.**
