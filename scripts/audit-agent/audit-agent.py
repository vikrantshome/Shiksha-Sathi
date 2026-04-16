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
from typing import Any, Dict, List, Optional, Set

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

## Response Format
[{"question_id": "id", "status": "ok"|"needs_fix"|"error", "issues": [], "auto_fixes": {}, "recommendation": "approve"|"needs_review"}]

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
10. **Embedded Options Detection**: If options field contains concatenated options like "7 (b) 8 (c) 9 (d) 10" - this is malformed. Extract properly: options=["7", "8", "9", "10"], answer="8" (the letter to text mapping)
11. **True/False Detection**: If answer is "True.", "False.", "true", "false", "Yes", "No" (without explanation), the type should be TRUE_FALSE not SHORT_ANSWER. Also if question text is a statement like "Diagonals of a rectangle are perpendicular to each other." or "is a simple closed curve." - these are True/False statements

## MATH NOTATION VALIDATION (CRITICAL)
Check for suspicious empty spaces where math operators should be:
- Pattern "X (X Y)" where X is variable and Y is number - likely means "X (X ± Y)" or similar
- Look at the ANSWER and OPTIONS to deduce the correct operator
- For "n (n 1)" - check if answer is "n(n-1)" or "n(n+1)" or "n(n×1)" from options
- Use THINKING REASONING: analyze the options to determine what operator makes sense
- If question has garbled math with empty spaces where operators should be:
  1. Look at the correct answer to determine operator
  2. Look at options for clues
  3. Provide corrected "question" field in auto_fixes with proper notation

Example reasoning: If question shows "n (n 1)" and correct answer is "n(n-1)/2", 
then the missing operator is "-". Fix should replace "n (n 1)" with "n(n-1)".

## Analysis Guidelines
- For MATH: Check formula correctness, proper notation (use ², ³, √, π)
- For SCIENCE: Verify scientific accuracy, proper terminology
- For LANGUAGE: Check grammar, proper word usage, spelling
- Use the provided authoritative source content to verify factual accuracy when available

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
        try:
            start_idx = content.find("[")
            if start_idx == -1:
                start_idx = content.find("{")

            if start_idx != -1:
                json_str = content[start_idx:]
                json_str = re.sub(
                    r"<thinking>.*?</thinking>", "", json_str, flags=re.DOTALL
                )
                json_str = re.sub(r"```json", "", json_str)
                json_str = re.sub(r"```", "", json_str)
                data = json.loads(json_str)
                if isinstance(data, list):
                    results.extend(data)
                elif isinstance(data, dict):
                    results.append(data)
        except json.JSONDecodeError as e:
            logger.warning(f"JSON parse error: {e}")

        while len(results) < len(questions):
            results.append({"status": "error", "issues": ["Parse error"]})

        return results[: len(questions)]


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

        with open(results_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(result) + "\n")

        if result.get("status") == "ok":
            stats["skipped"] += 1
            logger.info(
                f"  {question_id}: OK - {result.get('recommendation', 'approve')}"
            )
        elif result.get("status") == "needs_fix":
            stats["fixed"] += 1
            issues = result.get("issues", [])
            logger.info(f"  {question_id}: FIXED - {', '.join(issues[:2])}")

            if not dry_run and result.get("auto_fixes"):
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

                if updates:
                    db.questions.update_one(
                        {"_id": question["_id"]},
                        {"$set": updates},
                    )
                    logger.info(f"    Applied fixes: {list(updates.keys())}")
        else:
            stats["errors"] += 1
            logger.warning(
                f"  {question_id}: ERROR - {result.get('issues', ['Unknown'])}"
            )

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
        default="moonshotai/kimi-k2-thinking",
        help="Model to use",
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
