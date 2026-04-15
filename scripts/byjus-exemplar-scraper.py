#!/usr/bin/env python3
"""
BYJUS NCERT Exemplar Solutions Scraper with Auto-Update
Targets BYJUS chapter pages as primary source; fallback to Google search for other sources.
"""

import os
import re
import time
import json
import logging
import urllib.parse
from datetime import datetime
from typing import Optional, Dict, Tuple

from pymongo import MongoClient

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("byjus-scrape.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

# MongoDB
MONGO_URI = os.environ.get(
    "MONGO_URI",
    "mongodb+srv://devteam2025:devteam2026@naviksha.g77okxs.mongodb.net/shikshasathi?appName=naviksha",
)

# Rate limiting
RATE_LIMIT_DELAY = 2.0

# Skip figure-dependent questions
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
    for p in SKIP_PATTERNS:
        if re.search(p, text_lower):
            return True
    return False


def is_placeholder(text: str) -> bool:
    if not text:
        return True
    text_lower = text.lower()
    for p in PLACEHOLDER_PATTERNS:
        if re.search(p, text_lower):
            return True
    return False


def fetch_url(url: str, max_retries: int = 3) -> Optional[str]:
    for attempt in range(max_retries):
        try:
            time.sleep(RATE_LIMIT_DELAY)
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                return resp.read().decode("utf-8", errors="ignore")
        except Exception as e:
            logger.warning(f"Fetch attempt {attempt + 1} failed: {url} - {e}")
            if attempt < max_retries - 1:
                time.sleep(RATE_LIMIT_DELAY * 2)
    return None


def slugify(text: str) -> str:
    """Convert chapter title to URL slug"""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text.strip())
    return text


def build_byjus_url(
    class_num: str, subject: str, chapter: str, chapter_title: str
) -> str:
    """Construct BYJUS exemplar chapter URL"""
    subject_slug = subject.lower()
    if subject_slug == "mathematics":
        subject_slug = "maths"
    class_str = str(class_num)
    chap_num = str(chapter)
    title_slug = slugify(chapter_title)
    if title_slug:
        return f"https://byjus.com/ncert-exemplar-class-{class_str}-{subject_slug}-chapter-{chap_num}-{title_slug}/"
    else:
        return f"https://byjus.com/ncert-exemplar-class-{class_str}-{subject_slug}-chapter-{chap_num}/"


def extract_qa_byjus(html: str) -> Dict[int, str]:
    """Extract question-answer pairs from BYJUS chapter page"""
    qa = {}
    # Pattern for BYJUS: **<num>. ...** ... **Solution:** ... until next **<num>.**
    pattern = re.compile(
        r"\*\*(\d+)\.(.*?)\*\*Solution:\*\*(.*?)(?=\*\*\d+\.|\*\*Question|\Z)",
        re.DOTALL | re.IGNORECASE,
    )
    for m in pattern.finditer(html):
        try:
            q_num = int(m.group(1))
            sol_raw = m.group(3).strip()
            # Clean solution: remove image markdown, extra formatting, LaTeX fragments
            sol_clean = re.sub(r"!\[[^\]]*\]\([^\)]+\)", "", sol_raw)
            sol_clean = re.sub(r"\*\*([^\*]+)\*\*", r"\1", sol_clean)
            sol_clean = re.sub(r"\\\([^\\]*\\\)", "", sol_clean)  # Remove LaTeX inline
            sol_clean = re.sub(r"\s+", " ", sol_clean).strip()
            if sol_clean and len(sol_clean) >= 5:
                qa[q_num] = sol_clean
        except:
            continue
    return qa


def evaluate_answer(q_text: str, ans_text: str, q_type: str) -> Tuple[bool, str]:
    if not ans_text or len(ans_text.strip()) < 5:
        return False, "Too short"
    if is_placeholder(ans_text):
        return False, "Placeholder"
    # For MCQ, answer should indicate option (A-D) or contain it
    if q_type == "MCQ":
        if re.search(r"\b[A-D]\b", ans_text) or re.search(
            r"Option\s+[A-D]", ans_text, re.I
        ):
            return True, "MCQ option present"
        return False, "MCQ missing option"
    # For TRUE_FALSE, must be True/False
    if q_type == "TRUE_FALSE":
        if re.match(r"^(True|False)$", ans_text.strip(), re.I):
            return True, "True/False clear"
        return False, "True/False not clear"
    # Others (SHORT_ANSWER, LONG_ANSWER, FILL_IN_BLANKS)
    if len(ans_text.strip()) >= 20:
        return True, "Sufficient length"
    return False, "Too short for descriptive"


def process_combo(
    class_num: str, subject: str, chapter: str, dry_run: bool = False
) -> dict:
    """Process all DRAFT questions for a specific class/subject/chapter"""
    try:
        client = MongoClient(MONGO_URI)
        db = client.get_default_database()
        questions_coll = db.questions
    except Exception as e:
        logger.error(f"MongoDB error: {e}")
        return {"error": str(e)}

    # Find all DRAFT questions for this combo
    query = {
        "source_kind": "EXEMPLAR",
        "review_status": "DRAFT",
        "provenance.class": class_num,
        "provenance.subject": subject,
        "provenance.chapterNumber": chapter,
    }
    q_docs = list(questions_coll.find(query))
    if not q_docs:
        logger.info(f"No DRAFT questions for Class {class_num} {subject} Ch{chapter}")
        return {"processed": 0}

    # Build BYJUS URL; we need a sample chapter title from any document
    sample = q_docs[0]
    chapter_title = sample.get("provenance", {}).get("chapterTitle", "")
    byjus_url = build_byjus_url(class_num, subject, chapter, chapter_title)
    logger.info(f"BYJUS URL: {byjus_url}")

    html = fetch_url(byjus_url)
    if not html:
        logger.warning(f"Failed to fetch BYJUS page; skipping combo")
        return {"processed": 0, "skipped": len(q_docs), "reason": "BYJUS fetch failed"}

    qa_dict = extract_qa_byjus(html)
    logger.info(f"Extracted {len(qa_dict)} Q&A pairs from BYJUS page")

    processed = 0
    updated = 0
    skipped = 0
    errors = 0

    for q_doc in q_docs:
        q_id = q_doc.get("question_id")
        q_text = q_doc.get("text", "")
        q_type = q_doc.get("type", "")

        if is_figure_dependent(q_text):
            skipped += 1
            continue

        # Extract question number from ID
        m = re.search(r"Q(\d+)$", q_id, re.IGNORECASE)
        if not m:
            skipped += 1
            continue
        q_num = int(m.group(1))

        if q_num not in qa_dict:
            skipped += 1
            logger.debug(f"  {q_id}: No answer found in BYJUS page")
            continue

        answer = qa_dict[q_num]

        # Evaluate answer
        is_ok, reason = evaluate_answer(q_text, answer, q_type)
        if not is_ok:
            skipped += 1
            logger.info(f"  {q_id}: Low quality - {reason}")
            # Mark for manual review?
            if not dry_run:
                questions_coll.update_one(
                    {"_id": q_doc["_id"]}, {"$push": {"qa_flags": "byjus_low_quality"}}
                )
            continue

        if dry_run:
            logger.info(f"  {q_id}: OK (dry-run) - {answer[:50]}")
            processed += 1
            continue

        # Update DB
        try:
            questions_coll.update_one(
                {"_id": q_doc["_id"]},
                {
                    "$set": {
                        "correct_answer": answer,
                        "explanation": f"Answer extracted from BYJUS exemplar solutions",
                        "review_status": "PUBLISHED",
                    },
                    "$unset": {"qa_flags.needs_manual_lookup": ""},
                },
            )
            updated += 1
            processed += 1
            logger.info(f"  {q_id}: UPDATED - {answer[:50]}")
        except Exception as e:
            errors += 1
            logger.error(f"  {q_id}: DB error - {e}")

    logger.info(
        f"Combo Class{class_num} {subject} Ch{chapter}: Processed {processed}, Updated {updated}, Skipped {skipped}, Errors {errors}"
    )
    return {
        "processed": processed,
        "updated": updated,
        "skipped": skipped,
        "errors": errors,
    }


def main():
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--dry-run", action="store_true", help="Evaluate without updating DB"
    )
    parser.add_argument("--class", type=str, dest="class_num", help="Filter by class")
    parser.add_argument("--subject", type=str, help="Filter by subject")
    parser.add_argument(
        "--limit-classes", type=int, help="Limit number of classes to process"
    )
    parser.add_argument("--limit-chapters", type=int, help="Limit chapters per class")
    args = parser.parse_args()

    try:
        client = MongoClient(MONGO_URI)
        db = client.get_default_database()
        questions = db.questions
    except Exception as e:
        logger.error(f"Cannot connect to MongoDB: {e}")
        return

    # Base query: DRAFT exemplar questions
    base_query = {
        "source_kind": "EXEMPLAR",
        "review_status": "DRAFT",
        "provenance.class": {"$exists": True},
    }
    if args.class_num:
        base_query["provenance.class"] = str(args.class_num)
    if args.subject:
        base_query["provenance.subject"] = args.subject

    # Get distinct class/subject/chapter combos
    pipeline = [
        {"$match": base_query},
        {
            "$group": {
                "_id": {
                    "class": "$provenance.class",
                    "subject": "$provenance.subject",
                    "chapter": "$provenance.chapterNumber",
                    "chapterTitle": "$provenance.chapterTitle",
                },
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id.class": 1, "_id.subject": 1, "_id.chapter": 1}},
    ]
    combos = list(questions.aggregate(pipeline))
    logger.info(f"Found {len(combos)} class/subject/chapter combos to process")

    total_processed = 0
    total_updated = 0
    total_skipped = 0

    # Group processing
    classes_processed = 0
    for combo in combos:
        class_num = str(combo["_id"]["class"])
        subject = combo["_id"]["subject"]
        chapter = combo["_id"]["chapter"]
        chapter_title = combo["_id"].get("chapterTitle", "")

        logger.info(
            f"\n=== Processing Class {class_num} {subject} Chapter {chapter}: {chapter_title} (count={combo['count']}) ==="
        )

        result = process_combo(class_num, subject, chapter, dry_run=args.dry_run)
        total_processed += result.get("processed", 0)
        total_updated += result.get("updated", 0)
        total_skipped += result.get("skipped", 0)

        classes_processed += 1
        if args.limit_classes and classes_processed >= args.limit_classes:
            logger.info(f"Reached limit of {args.limit_classes} classes")
            break
        # No per-chapter limit implemented; could add later if needed

    logger.info(f"\n=== FINAL SUMMARY ===")
    logger.info(f"Combos processed: {classes_processed}")
    logger.info(f"Total questions processed: {total_processed}")
    logger.info(f"Total updated: {total_updated}")
    logger.info(f"Total skipped/failed: {total_skipped}")
    if args.dry_run:
        logger.info("DRY RUN - no changes made")


if __name__ == "__main__":
    main()
