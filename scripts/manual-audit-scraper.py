#!/usr/bin/env python3
"""
Manual-Audit NCERT Exemplar Scraper
Processes DRAFT questions one-by-one, extracts answers via Google search, and applies expert evaluation.
"""

import os
import re
import time
import json
import logging
import urllib.parse
from typing import Optional, Tuple, Dict
from urllib.parse import quote
from datetime import datetime

from pymongo import MongoClient
from pymongo.errors import PyMongoError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("scrape-audit.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

# MongoDB
MONGO_URI = os.environ.get(
    "MONGO_URI",
    "mongodb+srv://devteam2025:devteam2026@naviksha.g77okxs.mongodb.net/shikshasathi?appName=naviksha",
)

# Rate limiting
RATE_LIMIT_DELAY = 2.0  # seconds between requests

# Trusted solution domains
TRUSTED_DOMAINS = [
    "cbsetuts.com",
    "learncbse.in",
    "mycbseguide.com",
    "jagranjosh.com",
    "vedantu.com",
    "shaalaa.com",
    "byjus.com",
]

# Skip patterns for figure-dependent questions (should have been filtered already)
SKIP_PATTERNS = [
    r"figure",
    r"diagram",
    r"draw the",
    r"construct",
    r"sketch the",
    r"visualise",
    r"visualize",
    r"observe the figure",
    r"shown in figure",
]

# Placeholder answer patterns that indicate incomplete scraping
PLACEHOLDER_PATTERNS = [
    r"see detailed solution",
    r"reason required",
    r"ans required",
    r"solution given below",
    r"follow text",
    r"see answer",
    r"not provided",
    r"to be filled",
]


def is_figure_dependent(text: str) -> bool:
    if not text:
        return False
    text_lower = text.lower()
    for pattern in SKIP_PATTERNS:
        if re.search(pattern, text_lower):
            return True
    return False


def is_placeholder_answer(text: str) -> bool:
    if not text:
        return True
    text_lower = text.lower()
    for pattern in PLACEHOLDER_PATTERNS:
        if re.search(pattern, text_lower):
            return True
    return False


def fetch_url(url: str, max_retries: int = 3) -> Optional[str]:
    """Fetch URL content using urllib with rate limiting"""
    for attempt in range(max_retries):
        try:
            time.sleep(RATE_LIMIT_DELAY)
            import urllib.request

            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                return response.read().decode("utf-8", errors="ignore")
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1} failed for {url}: {e}")
            if attempt < max_retries - 1:
                time.sleep(RATE_LIMIT_DELAY * 2)
    return None


def google_search(query: str) -> Optional[str]:
    """Search DuckDuckGo and return best result URL from trusted non-blacklisted domain"""
    search_url = f"https://html.duckduckgo.com/html/?q={quote(query)}"
    html = fetch_url(search_url)
    if not html:
        return None

    # Extract all potential result links
    link_pattern = re.compile(r'<a[^>]+href="([^"]+)"[^>]*class="[^"]*result[^"]*"')
    links = link_pattern.findall(html)
    if not links:
        link_pattern2 = re.compile(r'<a[^>]+href="([^"]+)"')
        links = link_pattern2.findall(html)

    candidates = []
    for link in links:
        # Resolve DuckDuckGo redirects
        actual_url = link
        if "duckduckgo.com" in link and "uddg=" in link:
            m = re.search(r"uddg=([^&]+)", link)
            if m:
                actual_url = urllib.parse.unquote(m.group(1))
        elif link.startswith("//"):
            actual_url = "https:" + link

        # Validate domain
        for domain in TRUSTED_DOMAINS:
            if domain in actual_url:
                # Blacklist: skip cbsetuts (image-only solutions)
                if "cbsetuts.com" in domain:
                    continue
                # Skip PDFs (for now)
                if actual_url.lower().endswith(".pdf"):
                    continue
                # Prefer HTML pages containing chapter info
                if "/chapter-" in actual_url or "chapter" in actual_url.lower():
                    candidates.insert(0, actual_url)  # prioritize chapter-specific
                else:
                    candidates.append(actual_url)
                break

    return candidates[0] if candidates else None

    # Extract all result links: look for <a> tags with class containing 'result__a'
    link_pattern = re.compile(r'<a[^>]+class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"')
    links = link_pattern.findall(html)

    # If not found, look for any result link
    if not links:
        link_pattern2 = re.compile(
            r'<a[^>]+href="([^"]+)"[^>]*class="[^"]*result[^"]*"'
        )
        links = link_pattern2.findall(html)

    for link in links:
        # Handle DuckDuckGo redirect URLs: extract actual URL from uddg parameter
        if "duckduckgo.com" in link and "uddg=" in link:
            # Extract the uddg parameter which contains the actual URL
            m = re.search(r"uddg=([^&]+)", link)
            if m:
                actual_url = urllib.parse.unquote(m.group(1))
                # Validate it's from a trusted domain
                for domain in TRUSTED_DOMAINS:
                    if domain in actual_url:
                        return actual_url
                # If not trusted, continue searching
                continue
        # Handle protocol-relative URLs
        if link.startswith("//"):
            link = "https:" + link
        # Check if direct link to trusted domain
        for domain in TRUSTED_DOMAINS:
            if domain in link:
                return link

    # Fallback: look for any link containing trusted domain in raw HTML
    for domain in TRUSTED_DOMAINS:
        pattern = re.compile(r'https?://[^\s"\'<>]*' + re.escape(domain))
        match = pattern.search(html)
        if match:
            return match.group(0)

    return None


def extract_answers_from_page(html: str) -> Dict[int, str]:
    """Extract Q&A pairs from chapter page HTML"""
    qa_dict = {}

    # Pattern: **Question N:** ... **Solution:** ... (or **Answer:**)
    pattern = re.compile(
        r"\*\*Question\s+(\d+):\*\*(.+?)\*\*(?:Solution|Answer):\*\*(.+?)(?=\*\*Question|\*\*Note|\Z)",
        re.DOTALL | re.IGNORECASE,
    )

    for match in pattern.finditer(html):
        try:
            q_num = int(match.group(1))
            q_text = match.group(2).strip()
            sol_text = match.group(3).strip()

            # Clean solution: remove image markdown, formatting
            sol_text = re.sub(r"!\[[^\]]*\]\([^\)]+\)", "", sol_text)
            sol_text = re.sub(r"\*\*([^\*]+)\*\*", r"\1", sol_text)
            sol_text = re.sub(r"__([^_]+)__", r"\1", sol_text)
            sol_text = re.sub(r"\s+", " ", sol_text).strip()

            if sol_text and len(sol_text) > 2:
                qa_dict[q_num] = sol_text
        except:
            continue

    # Alternative pattern: numbered questions without bold
    if not qa_dict:
        pattern2 = re.compile(
            r"(?:^|\n)\s*(\d+)\.\s+(.+?)\n(?:Solution|Answer)[:\s]\s*(.+?)(?=\n\d+\.|\n\s*\d+\)|\Z)",
            re.DOTALL | re.IGNORECASE,
        )
        for match in pattern2.finditer(html):
            try:
                q_num = int(match.group(1))
                sol_text = match.group(3).strip()
                if sol_text and len(sol_text) > 2:
                    qa_dict[q_num] = sol_text
            except:
                continue

    return qa_dict


def evaluate_answer(
    question_text: str, answer_text: str, question_type: str
) -> Tuple[bool, str]:
    """
    Evaluate if extracted answer is acceptable.
    Returns (is_acceptable, reason)
    """
    if not answer_text or len(answer_text.strip()) < 10:
        return False, "Answer too short or empty"

    if is_placeholder_answer(answer_text):
        return False, "Placeholder text detected"

    # Check question type specific criteria
    q_lower = question_text.lower() if question_text else ""

    if question_type == "MCQ":
        # Should be single letter (A-D) optionally with brief explanation
        if re.match(r"^[A-D]$", answer_text.strip()):
            return True, "MCQ single letter"
        # Or "Option A" or "A)" etc.
        if re.match(r"^[A-D][\).]?", answer_text.strip()):
            return True, "MCQ option format"
        # If long, should contain the option letter
        if re.search(r"\b[A-D]\s*\)", answer_text):
            return True, "MCQ contains option"
        return False, "MCQ answer doesn't match expected format"

    elif question_type == "TRUE_FALSE":
        if re.match(r"^(True|False)$", answer_text.strip(), re.IGNORECASE):
            return True, "True/False clear"
        return False, "True/False answer not clear"

    elif question_type == "FILL_IN_BLANKS":
        # Should be short phrase (1-10 words)
        words = answer_text.strip().split()
        if 1 <= len(words) <= 15:
            return True, "Fill in blanks appropriate length"
        return False, f"Fill in blanks too long ({len(words)} words)"

    else:  # SHORT_ANSWER, LONG_ANSWER, etc.
        # Should be at least 20 chars and end with proper punctuation or be a complete thought
        if len(answer_text.strip()) >= 20:
            return True, "Adequate length for descriptive answer"
        return False, "Too short for descriptive answer"


def process_question(question_doc: dict, dry_run: bool = False) -> dict:
    """Process a single question: search, extract, evaluate, update"""
    result = {
        "question_id": question_doc.get("question_id"),
        "status": "skipped",
        "reason": "",
        "answer": None,
        "source_url": None,
    }

    q_id = question_doc.get("question_id")
    q_text = question_doc.get("text", "")
    q_class = question_doc.get("provenance", {}).get("class")
    q_subject = question_doc.get("provenance", {}).get("subject")
    q_chapter = question_doc.get("provenance", {}).get("chapterNumber")
    q_type = question_doc.get("type", "")

    logger.info(
        f"Processing {q_id}: Class {q_class} {q_subject} Ch{q_chapter} Type:{q_type}"
    )

    # Skip if figure dependent (should already be filtered, but double-check)
    if is_figure_dependent(q_text):
        result["reason"] = "Figure-dependent question"
        return result

    # Build search query
    query = f"NCERT Exemplar Class {q_class} {q_subject} Chapter {q_chapter} solutions"
    logger.info(f"  Searching: {query}")

    # Search for solution page
    solution_url = google_search(query)
    if not solution_url:
        result["reason"] = "No solution URL found"
        return result

    logger.info(f"  Found URL: {solution_url}")

    # Crawl chapter page
    html = fetch_url(solution_url)
    if not html:
        result["reason"] = "Failed to fetch solution page"
        return result

    # Extract all Q&A from page
    qa_dict = extract_answers_from_page(html)
    if not qa_dict:
        result["reason"] = "No Q&A pairs found on page"
        return result

    logger.info(f"  Extracted {len(qa_dict)} Q&A pairs from page")

    # Match question number from question_id (e.g., NCERT-EXEMPLAR-M10-CH13-Q7 -> 7)
    m = re.search(r"Q(\d+)$", q_id, re.IGNORECASE)
    if not m:
        result["reason"] = "Could not extract question number from ID"
        return result
    q_num = int(m.group(1))

    # Get answer for this question
    if q_num not in qa_dict:
        result["reason"] = f"Question number {q_num} not found in extracted answers"
        return result

    answer = qa_dict[q_num]
    result["answer"] = answer
    result["source_url"] = solution_url

    # Evaluate answer quality
    is_acceptable, eval_reason = evaluate_answer(q_text, answer, q_type)
    if not is_acceptable:
        result["reason"] = f"Low quality: {eval_reason}"
        result["answer"] = answer  # keep for review
        return result

    # If dry run, don't update DB
    if dry_run:
        result["status"] = "evaluated_ok"
        result["reason"] = f"Acceptable: {eval_reason}"
        return result

    # Update MongoDB
    try:
        from pymongo import MongoClient

        client = MongoClient(MONGO_URI)
        db = client.get_default_database()
        questions = db.questions

        update_doc = {
            "correct_answer": answer,
            "explanation": f"Answer scraped from {solution_url}",
            "review_status": "PUBLISHED",
        }
        # Remove needs_manual_lookup flag if present
        questions.update_one(
            {"_id": question_doc["_id"]},
            {"$set": update_doc, "$unset": {"qa_flags.needs_manual_lookup": ""}},
        )
        result["status"] = "updated"
        result["reason"] = f"Updated: {eval_reason}"
        logger.info(f"  ✓ Updated {q_id}")
    except Exception as e:
        result["status"] = "error"
        result["reason"] = f"MongoDB error: {str(e)}"
        logger.error(f"  MongoDB error for {q_id}: {e}")

    return result


def main():
    import sys

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--dry-run", action="store_true", help="Evaluate without updating DB"
    )
    parser.add_argument(
        "--limit", type=int, default=50, help="Max questions to process"
    )
    parser.add_argument("--class", type=int, dest="class_num", help="Filter by class")
    parser.add_argument("--subject", type=str, help="Filter by subject")
    parser.add_argument(
        "--resume", action="store_true", help="Resume from last processed (TODO)"
    )
    args = parser.parse_args()

    # Connect to MongoDB
    try:
        client = MongoClient(MONGO_URI)
        db = client.get_default_database()
        questions = db.questions
        logger.info("Connected to MongoDB")
    except Exception as e:
        logger.error(f"Cannot connect to MongoDB: {e}")
        return

    # Build query for DRAFT questions (exclude figure-dependent)
    query = {
        "source_kind": "EXEMPLAR",
        "review_status": "DRAFT",
        "provenance.class": {"$exists": True},
    }
    if args.class_num:
        query["provenance.class"] = str(args.class_num)
    if args.subject:
        query["provenance.subject"] = args.subject

    # Exclude already flagged as needing manual lookup? No, include everything.

    # Fetch questions
    cursor = (
        questions.find(query)
        .sort([("provenance.class", 1), ("provenance.subject", 1), ("_id", 1)])
        .limit(args.limit)
    )
    total = questions.count_documents(query)
    logger.info(f"Found {total} DRAFT questions to process (limit={args.limit})")

    processed = 0
    updated = 0
    skipped = 0
    errors = 0

    for q_doc in cursor:
        processed += 1
        result = process_question(q_doc, dry_run=args.dry_run)

        status = result["status"]
        q_id = result["question_id"]

        if status == "updated":
            updated += 1
            logger.info(f"  {q_id}: UPDATED - {result['reason']}")
        elif status == "evaluated_ok":
            updated += 1  # would be updated if not dry-run
            logger.info(f"  {q_id}: OK (dry-run) - {result['reason']}")
        elif status == "skipped":
            skipped += 1
            logger.info(f"  {q_id}: SKIPPED - {result['reason']}")
        else:
            errors += 1
            logger.error(f"  {q_id}: ERROR - {result['reason']}")

        # Save result to audit file
        with open("audit-results.jsonl", "a", encoding="utf-8") as f:
            f.write(
                json.dumps(
                    {
                        "question_id": q_id,
                        "status": status,
                        "reason": result["reason"],
                        "answer_preview": (
                            result["answer"][:100] if result["answer"] else None
                        ),
                        "source_url": result.get("source_url"),
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                )
                + "\n"
            )

        # Progress log every 10
        if processed % 10 == 0:
            logger.info(
                f"Progress: {processed} processed, {updated} updated, {skipped} skipped, {errors} errors"
            )

    logger.info(f"\n=== FINAL SUMMARY ===")
    logger.info(f"Processed: {processed}")
    logger.info(f"Updated: {updated}")
    logger.info(f"Skipped: {skipped}")
    logger.info(f"Errors: {errors}")
    if args.dry_run:
        logger.info("(dry-run mode - no changes made)")


if __name__ == "__main__":
    import argparse

    main()
