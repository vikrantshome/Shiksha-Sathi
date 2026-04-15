#!/usr/bin/env python3
"""
Expert Audit Agent using NVIDIA NIM API (Kimi K2.5)
Processes all questions for a given class, detects QA issues, and auto-fixes where possible.
"""

import os
import re
import json
import logging
import argparse
import time
import ast
from datetime import datetime
from typing import Optional, Dict, List, Tuple, Any
from dataclasses import dataclass, field

from dotenv import load_dotenv
from pymongo import MongoClient
from openai import OpenAI
from openai import APIError, RateLimitError

load_dotenv(os.path.join(os.path.dirname(__file__), ".env.local"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("audit-agent.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

MONGO_URI = os.environ.get(
    "MONGO_URI",
    "mongodb+srv://devteam2025:devteam2026@naviksha.g77okxs.mongodb.net/shikshasathi?appName=naviksha",
)

INVOKE_URL = "https://integrate.api.nvidia.com/v1"
MODEL_NAME = "moonshotai/kimi-k2-instruct"

BATCH_SIZE = 5
MAX_RETRIES = 3
RETRY_DELAY = 2.0


@dataclass
class AuditResult:
    question_id: str
    issues: List[str] = field(default_factory=list)
    auto_fixes: Dict[str, Any] = field(default_factory=dict)
    status: str = "ok"
    recommendation: str = "approve"


class AuditAgent:
    def __init__(self, api_key: str):
        self.client = OpenAI(base_url=INVOKE_URL, api_key=api_key)
        self.audit_system_prompt = """You are an expert QA auditor for educational math and science questions from NCERT Exemplar.
Your task is to analyze questions for quality issues and provide corrections.

## Audit Checklist - Check for ALL of these:

1. **Type Mismatch**: 
   - If question contains "True" or "False", type should be TRUE_FALSE
   - If question has options A/B/C/D, type should be MULTIPLE_CHOICE
   - If question asks for short explanation/calculation, type should be SHORT_ANSWER
   - If question asks for long explanation/essay, type should be ESSAY

2. **Superscript Issues**:
   - "a2b" should be "a²b" (superscript 2)
   - "a3b" should be "a³b" (superscript 3)
   - "24a2bc" should mean "24a²bc" not "24 × a × 2 × b × c"
   - Detect multiplication sign "×" used incorrectly for exponents

3. **Multi-part Questions**:
   - If question contains "(i)", "(ii)", "(iii)" - these should be SEPARATE questions
   - If question contains "and" with distinct sub-parts - should be separate
   - Multiple sub-questions combined as one is a quality issue

4. **Division Symbol Issues**:
   - "÷" mixed with variables like "(3x + 3x2) ÷ 3x" is problematic
   - Should use proper fraction notation or proper formatting

5. **Missing Explanation**:
   - Explanation field should exist and be substantive (>30 chars)
   - "See explanation" or placeholder is not acceptable

6. **Incomplete Options** (for MCQ):
   - Must have at least 2 options
   - Options should be meaningful (not empty, not placeholder text)

7. **Placeholder Answers**:
   - Check for: "see detailed solution", "reason required", "ans required", 
     "solution given below", "follow text", "not provided", "to be filled"

8. **Nonsense Questions**:
   - Question should make grammatical sense
   - Should not be garbled or incomplete

## Output Format - JSON only:

```json
{
  "question_id": "the question id",
  "issues": ["issue1", "issue2"],
  "auto_fixes": {
    "type": "TRUE_FALSE",
    "explanation": "Your custom explanation if missing"
  },
  "status": "needs_fix" or "ok",
  "recommendation": "approve" or "reject" or "needs_review"
}
```

If no issues found, return:
```json
{
  "question_id": "the question id",
  "issues": [],
  "auto_fixes": {},
  "status": "ok",
  "recommendation": "approve"
}
```

Now analyze these questions:"""

    def _call_api(self, messages: List[Dict], max_tokens: int = 4096) -> Optional[str]:
        for attempt in range(MAX_RETRIES):
            try:
                response = self.client.chat.completions.create(
                    model=MODEL_NAME,
                    messages=messages,
                    temperature=0.6,
                    top_p=0.95,
                    max_tokens=max_tokens,
                )
                return response.choices[0].message.content
            except RateLimitError as e:
                logger.warning(
                    f"Rate limit hit, waiting {RETRY_DELAY * (attempt + 1)}s..."
                )
                time.sleep(RETRY_DELAY * (attempt + 1))
            except APIError as e:
                logger.warning(f"API error {attempt + 1}: {e}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))
                else:
                    return None
        return None

    def _extract_json_from_response(self, text: str) -> Optional[Dict]:
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            json_match = re.search(r"\{.*\}", text, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except:
                    pass
        return None

    def audit_questions(self, questions: List[Dict]) -> List[AuditResult]:
        if not questions:
            return []

        questions_text = ""
        for i, q in enumerate(questions):
            q_text = q.get("text", "")
            q_type = q.get("type", "")
            q_options = q.get("options", [])
            q_answer = q.get("correct_answer") or q.get("correctAnswer") or ""
            q_explanation = q.get("explanation", "")
            q_id = q.get("question_id") or str(q.get("_id", ""))

            questions_text += f"""
---
Question {i + 1}:
ID: {q_id}
Type: {q_type}
Text: {q_text}
Options: {q_options}
Answer: {q_answer}
Explanation: {q_explanation}
"""

        messages = [
            {"role": "system", "content": self.audit_system_prompt},
            {"role": "user", "content": questions_text},
        ]

        response = self._call_api(messages, max_tokens=8192)
        if not response:
            logger.error("API call failed, returning empty results")
            return [
                AuditResult(
                    q.get("question_id") or str(q.get("_id", "")),
                    issues=["API call failed"],
                    status="error",
                )
                for q in questions
            ]

        results = self._extract_json_from_response(response)
        if not results:
            logger.error(f"Failed to parse JSON from response: {response[:500]}")
            return [
                AuditResult(
                    q.get("question_id") or str(q.get("_id", "")),
                    issues=["Failed to parse audit response"],
                    status="error",
                )
                for q in questions
            ]

        if isinstance(results, list):
            return [self._parse_result(r) for r in results]
        elif isinstance(results, dict):
            if "results" in results:
                return [self._parse_result(r) for r in results["results"]]
            else:
                return [self._parse_result(results)]
        return []

    def _parse_result(self, data: Dict) -> AuditResult:
        return AuditResult(
            question_id=data.get("question_id", ""),
            issues=data.get("issues", []),
            auto_fixes=data.get("auto_fixes", {}),
            status=data.get("status", "ok"),
            recommendation=data.get("recommendation", "approve"),
        )


def load_dotenv(path: str):
    if os.path.exists(path):
        with open(path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    if "=" in line:
                        key, value = line.split("=", 1)
                        os.environ[key.strip()] = value.strip()


def get_mongodb():
    client = MongoClient(MONGO_URI)
    return client.get_default_database()


def audit_class_questions(
    agent: AuditAgent,
    db,
    class_num: int,
    batch_size: int = BATCH_SIZE,
    dry_run: bool = False,
    statuses: List[str] = None,
) -> Dict[str, int]:
    if statuses is None:
        statuses = ["DRAFT", "PUBLISHED"]

    stats = {"processed": 0, "fixed": 0, "skipped": 0, "errors": 0}
    results_file = "scripts/audit-results.jsonl"

    # Load already processed question IDs to skip them
    processed_ids = set()
    if os.path.exists(results_file):
        with open(results_file, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    d = json.loads(line)
                    processed_ids.add(d["question_id"])
                except json.JSONDecodeError:
                    pass
    logger.info(f"Skipping {len(processed_ids)} already processed questions")

    for status in statuses:
        query = {
            "provenance.class": str(class_num),
            "review_status": status,
        }

        total = db.questions.count_documents(query)
        logger.info(f"Class {class_num}, Status '{status}': {total} questions")

        cursor = db.questions.find(query).batch_size(batch_size)

        batch = []
        for q_doc in cursor:
            q_id = str(q_doc.get("_id", ""))
            if q_id in processed_ids:
                continue

            batch.append(q_doc)
            if len(batch) >= batch_size:
                results = agent.audit_questions(batch)
                for q, result in zip(batch, results):
                    stats["processed"] += 1
                    process_result(q, result, db, dry_run, results_file, stats)
                batch = []
                time.sleep(1)

        if batch:
            results = agent.audit_questions(batch)
            for q, result in zip(batch, results):
                stats["processed"] += 1
                process_result(q, result, db, dry_run, results_file, stats)

    return stats


def process_result(
    question: Dict,
    result: AuditResult,
    db,
    dry_run: bool,
    results_file: str,
    stats: Dict,
):
    q_id = question.get("question_id") or str(question.get("_id", ""))

    if result.status == "error":
        stats["errors"] += 1
        log_msg = (
            f"  {q_id}: ERROR - {result.issues[0] if result.issues else 'Unknown'}"
        )
    elif result.issues:
        if result.auto_fixes and not dry_run:
            update_question(question, result, db)
            stats["fixed"] += 1
            log_msg = f"  {q_id}: FIXED - {', '.join(result.issues)}"
        elif dry_run:
            stats["skipped"] += 1
            log_msg = f"  {q_id}: WOULD FIX - {', '.join(result.issues)}"
        else:
            stats["fixed"] += 1
            update_question(question, result, db)
            log_msg = f"  {q_id}: FIXED - {', '.join(result.issues)}"
    else:
        stats["skipped"] += 1
        log_msg = f"  {q_id}: OK - {result.recommendation}"

    logger.info(log_msg)

    with open(results_file, "a", encoding="utf-8") as f:
        f.write(
            json.dumps(
                {
                    "question_id": q_id,
                    "status": result.status,
                    "issues": result.issues,
                    "auto_fixes": result.auto_fixes,
                    "recommendation": result.recommendation,
                    "timestamp": datetime.utcnow().isoformat(),
                }
            )
            + "\n"
        )


def update_question(question: Dict, result: AuditResult, db):
    q_id = question.get("_id")
    if not q_id:
        return

    update_doc = {"$set": {}, "$addToSet": {}}

    fixes = result.auto_fixes
    if fixes:
        for field, value in fixes.items():
            if field == "type":
                update_doc["$set"]["type"] = value
            elif field == "explanation" and value:
                if len(value) > 20:
                    update_doc["$set"]["explanation"] = value
            elif field == "correct_answer" and value:
                update_doc["$set"]["correct_answer"] = value
            elif field == "options" and value:
                if len(value) >= 2:
                    update_doc["$set"]["options"] = value

    if result.issues:
        update_doc["$addToSet"]["qa_flags"] = {"$each": result.issues}

    if result.recommendation == "reject":
        update_doc["$set"]["review_status"] = "REJECTED"
    elif result.recommendation == "needs_review":
        update_doc["$set"]["review_status"] = "REVIEW"

    if update_doc["$set"]:
        db.questions.update_one({"_id": q_id}, update_doc)


def main():
    parser = argparse.ArgumentParser(description="Expert Audit Agent for Questions")
    parser.add_argument(
        "--class-num", type=int, required=True, help="Class to audit (e.g., 10)"
    )
    parser.add_argument("--dry-run", action="store_true", help="Don't update database")
    parser.add_argument(
        "--batch-size", type=int, default=BATCH_SIZE, help="Questions per API call"
    )
    parser.add_argument(
        "--status",
        type=str,
        action="append",
        dest="statuses",
        help="Statuses to process (can repeat for multiple)",
    )
    parser.add_argument("--limit", type=int, help="Max questions to process per status")
    args = parser.parse_args()

    api_key = os.environ.get("NVIDIA_API_KEY")
    if not api_key:
        logger.error("NVIDIA_API_KEY not found in .env.local")
        return

    class_num = args.class_num
    logger.info(f"Starting audit for Class {class_num}")
    logger.info(f"Model: {MODEL_NAME}")
    logger.info(f"Batch size: {args.batch_size}")

    agent = AuditAgent(api_key)

    try:
        db = get_mongodb()
        logger.info("Connected to MongoDB")
    except Exception as e:
        logger.error(f"Cannot connect to MongoDB: {e}")
        return

    statuses = args.statuses if args.statuses else ["DRAFT", "PUBLISHED"]

    stats = {"processed": 0, "fixed": 0, "skipped": 0, "errors": 0}

    for status in statuses:
        query = {
            "provenance.class": str(class_num),
            "review_status": status,
        }

        total = db.questions.count_documents(query)
        logger.info(f"Class {class_num}, Status '{status}': {total} questions")

        cursor = db.questions.find(query).batch_size(args.batch_size)

        batch = []
        count = 0
        for q_doc in cursor:
            batch.append(q_doc)
            count += 1

            if len(batch) >= args.batch_size:
                results = agent.audit_questions(batch)
                for q, result in zip(batch, results):
                    stats["processed"] += 1
                    process_result(
                        q,
                        result,
                        db,
                        args.dry_run,
                        "scripts/audit-results.jsonl",
                        stats,
                    )
                batch = []
                time.sleep(0.5)
                if args.limit and stats["processed"] >= args.limit:
                    break

        if batch and stats["processed"] < (args.limit or float("inf")):
            results = agent.audit_questions(batch)
            for q, result in zip(batch, results):
                stats["processed"] += 1
                process_result(
                    q, result, db, args.dry_run, "audit-results.jsonl", stats
                )

    logger.info(f"\n=== FINAL SUMMARY ===")
    logger.info(f"Processed: {stats['processed']}")
    logger.info(f"Fixed: {stats['fixed']}")
    logger.info(f"OK/Skipped: {stats['skipped']}")
    logger.info(f"Errors: {stats['errors']}")
    if args.dry_run:
        logger.info("(dry-run mode - no changes made)")


if __name__ == "__main__":
    main()
