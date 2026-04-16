#!/usr/bin/env python3
"""
Fix MCQ questions with corrupted/gibberish options.

Problems to fix:
- Options containing explanations ("Hide Explanation", "Correct Answer", etc.)
- Options containing question text from other questions
- Options containing metadata ("Weightage", "1 Point", "Avg. Time")
- Options that are too long or contain garbage

Usage:
    python scripts/fix-mcq-options.py --dry-run
    python scripts/fix-mcq-options.py
"""

import os
import re
import sys
from pymongo import MongoClient
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(".env.local"))

MONGO_URI = os.getenv(
    "MONGODB_URI", os.getenv("MONGO_URI", "mongodb://localhost:27017/")
)
DB_NAME = "shikshasathi"

# Patterns indicating corrupted options
CORRUPTION_PATTERNS = [
    r"Hide\s+Explanation",
    r"Correct\s+Answer",
    r"Detailed\s+Explanation",
    r"Weighitage",
    r"Avg\.\s*Time",
    r"Point$",
    r"^\d+\s+Point",
    r"SEC$",
    r"Min$",
    r"A\s+magic\s+square",
    r"arranged\s+so\s+that",
    r"use\s+the\s+numbers",
    r"to\s+make\s+a\s+magic",
]

# Metadata patterns to remove from options
METADATA_CLEANUP = [
    r"\s*Hide\s+Explanation.*$",
    r"\s*Correct\s+Answer.*$",
    r"\s*Detailed\s+Explanation.*$",
    r"\s*Weighitage\s*.*$",
    r"\s*1\s+Point.*$",
    r"\s*Avg\.\s*Time.*$",
    r"\s*30\s+Sec.*$",
]


def get_collection():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    return db.questions


def is_corrupted_option(option):
    """Check if an option appears to be corrupted."""
    if not option or len(option) > 200:
        return True

    option_lower = option.lower()

    for pattern in CORRUPTION_PATTERNS:
        if re.search(pattern, option_lower, re.IGNORECASE):
            return True

    return False


def clean_option(option):
    """Clean a single option."""
    if not option:
        return option

    cleaned = option

    # Remove metadata patterns
    for pattern in METADATA_CLEANUP:
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)

    # Clean up multiple spaces
    cleaned = re.sub(r"\s+", " ", cleaned)

    return cleaned.strip()


def find_mcq_with_corrupted_options(collection):
    """Find MCQ questions that have corrupted options."""
    # Find all MCQ questions
    mcq_questions = list(
        collection.find({"type": "MCQ", "options": {"$exists": True, "$ne": []}})
    )

    corrupted = []
    for q in mcq_questions:
        options = q.get("options", [])
        has_corrupted = any(is_corrupted_option(opt) for opt in options)

        if has_corrupted:
            corrupted.append(q)

    return corrupted


def mark_as_draft(collection, question_id, reason):
    """Mark a question as draft with reason."""
    collection.update_one(
        {"_id": question_id}, {"$set": {"status": "DRAFT", "draftReason": reason}}
    )


def main(dry_run=True):
    collection = get_collection()

    print(f"Connected to MongoDB: {DB_NAME}")
    print(f"Dry run mode: {dry_run}")
    print()

    # Find corrupted MCQs
    corrupted = find_mcq_with_corrupted_options(collection)

    print(f"Found {len(corrupted)} MCQ questions with potentially corrupted options")
    print()

    if not corrupted:
        print("No corrupted MCQ options found.")
        return

    # Show sample
    print("Sample corrupted questions:")
    print("-" * 80)

    for q in corrupted[:5]:
        print(f"ID: {q.get('_id')}")
        print(f"Question: {q.get('text', '')[:80]}...")

        options = q.get("options", [])
        for i, opt in enumerate(options):
            if is_corrupted_option(opt):
                print(f"  Option {chr(65 + i)}: {opt[:100]}...")
        print()

    if len(corrupted) > 5:
        print(f"... and {len(corrupted) - 5} more questions")
        print()

    # Option 1: Clean options (remove metadata)
    # Option 2: Mark as DRAFT for manual review
    #
    # For now, we'll mark as DRAFT for manual review
    if not dry_run:
        print("Marking corrupted questions as DRAFT for manual review...")

        marked_count = 0
        for q in corrupted:
            reason = "Corrupted MCQ options - needs manual review"
            mark_as_draft(collection, q["_id"], reason)
            marked_count += 1

        print(f"Marked {marked_count} questions as DRAFT")
    else:
        print("Run without --dry-run to mark questions as DRAFT")


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv or "-d" in sys.argv
    main(dry_run=dry_run)
