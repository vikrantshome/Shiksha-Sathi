#!/usr/bin/env python3
"""
Clean PDF extraction artifacts from questions in MongoDB.

Artifacts to remove:
- "AA BE 12/04/18", "AEAC", "EEA BE 12/04/18"
- Date patterns at end of text
- Common PDF extraction garbage

Usage:
    python scripts/clean-pdf-artifacts.py --dry-run
    python scripts/clean-pdf-artifacts.py
"""

import os
import re
import sys
from pathlib import Path
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env.local for MongoDB URI
load_dotenv(dotenv_path=Path(".env.local"))

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = "shikshasathi"

# Patterns to identify PDF artifacts
ARTIFACT_PATTERNS = [
    r"\s+AA\s+BE\s+\d{2}/\d{2}/\d{2}\s*$",
    r"\s+AEAC\s*$",
    r"\s+EEA\s+BE\s+\d{2}/\d{2}/\d{2}\s*$",
    r"\s+BE\s+\d{2}/\d{2}/\d{2}\s*$",
    r"\s+AE\s*$",
    r"\s+EEA\s*$",
    r"\s+A\s*$",
    r"\s+B\s*$",
    r"\s+AA\s*$",
    r"\s+\d{2}/\d{2}/\d{2}\s*$",
    r"\s+12/04/18\s*$",
]

# Additional cleanup patterns
CLEANUP_PATTERNS = [
    (r"\s+1\s+MARKS\s*$", " 1 MARKS"),
    (r"\s+2\s+MARKS\s*$", " 2 MARKS"),
    (r"\s+4\s+MARKS\s*$", " 4 MARKS"),
    (r"\s+1\s+marks\s*$", " 1 MARKS"),
]


def get_collection():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    return db.questions


def clean_text(text):
    """Clean PDF artifacts from text."""
    if not text:
        return text

    cleaned = text

    # Apply artifact patterns
    for pattern in ARTIFACT_PATTERNS:
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)

    # Apply cleanup patterns
    for pattern, replacement in CLEANUP_PATTERNS:
        cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)

    # Clean up multiple spaces
    cleaned = re.sub(r"\s+", " ", cleaned)

    return cleaned.strip()


def find_questions_with_artifacts(collection):
    """Find questions containing PDF artifacts."""
    artifact_regexes = [
        r"AA\s+BE",
        r"AEAC",
        r"EEA\s+BE",
        r"\d{2}/\d{2}/\d{2}",
    ]

    queries = []
    for regex in artifact_regexes:
        queries.append({"text": {"$regex": regex, "$options": "i"}})

    return list(collection.find({"$or": queries}))


def main(dry_run=True):
    collection = get_collection()

    print(f"Connected to MongoDB: {DB_NAME}")
    print(f"Dry run mode: {dry_run}")
    print()

    # Find questions with artifacts
    questions = find_questions_with_artifacts(collection)

    print(f"Found {len(questions)} questions with potential artifacts")
    print()

    if not questions:
        print("No questions with artifacts found.")
        return

    # Show sample of questions that would be cleaned
    print("Sample questions to clean:")
    print("-" * 80)

    for q in questions[:10]:
        original_text = q.get("text", "")[:100]
        cleaned_text = clean_text(original_text)

        if original_text != cleaned_text:
            print(f"ID: {q.get('_id')}")
            print(f"Original: ...{original_text[-50:]}")
            print(f"Cleaned:  ...{cleaned_text[-50:]}")
            print()

    if len(questions) > 10:
        print(f"... and {len(questions) - 10} more questions")
        print()

    # Apply cleaning if not dry run
    if not dry_run:
        print("Applying cleaning...")

        cleaned_count = 0
        for q in questions:
            original_text = q.get("text", "")
            cleaned_text = clean_text(original_text)

            if original_text != cleaned_text:
                collection.update_one(
                    {"_id": q["_id"]}, {"$set": {"text": cleaned_text}}
                )
                cleaned_count += 1

        print(f"Cleaned {cleaned_count} questions")
    else:
        print("Run without --dry-run to apply changes")


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv or "-d" in sys.argv
    main(dry_run=dry_run)
