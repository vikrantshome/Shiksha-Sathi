#!/usr/bin/env python3
"""
Convert questions with complex mathematical operators to MCQ format.

Questions that should be MCQ:
- Contains exponents (^, squared, cubed)
- Contains fractions
- Contains square roots, integrals, summations
- Contains subscripts
- Requires math notation for clear answer

Usage:
    python scripts/convert-to-mcq.py --dry-run
    python scripts/convert-to-mcq.py
"""

import os
import re
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("MONGO_DB", "shikshasathi")

# Patterns indicating complex math notation (should be MCQ)
COMPLEX_OPERATOR_PATTERNS = [
    r"\^",  # Exponent symbol
    r"squared",  # squared
    r"cubed",  # cubed
    r"√",  # square root symbol
    r"square root",  # square root text
    r"∫",  # integral
    r"integral",  # integral text
    r"∑",  # summation
    r"summation",  # summation text
    r"∆",  # delta
    r"delta",  # delta text
    r"π",  # pi
    r"frac",  # fraction
    r"/[a-zA-Z]",  # Variable in denominator like 1/x
    r"\([^)]*\)\s*2",  # (x+1)² type patterns
    r"\([^)]*\)\s*3",  # (x+1)³ type patterns
    r"\s+\d+\s*\)",  # Options like 1) 2) numbered
    r"subject\s+to",  # conditions/constraints
    r"if\s+and\s+only\s+if",  # logical conditions
]

# Patterns that indicate question should NOT be MCQ
SIMPLE_PATTERNS = [
    r"^What\s+is\s+",
    r"^Find\s+the\s+",
    r"^Calculate\s+",
    r"^Solve\s+",
]


def get_collection():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    return db.questions


def has_complex_operators(text):
    """Check if question has complex math notation."""
    if not text:
        return False

    for pattern in COMPLEX_OPERATOR_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True

    return False


def is_likely_short_answer(text):
    """Check if question is likely suitable for short answer."""
    if not text:
        return False

    for pattern in SIMPLE_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True

    return False


def find_questions_to_convert(collection):
    """Find SHORT_ANSWER questions that should be MCQ."""
    # Get all SHORT_ANSWER questions
    short_answer = list(
        collection.find({"type": {"$in": ["SHORT_ANSWER", "SHORT_ANSWER "]}})
    )

    to_convert = []
    for q in short_answer:
        text = q.get("text", "")

        # Check if has complex operators
        if has_complex_operators(text):
            # Check if it already has options
            if not q.get("options") or len(q.get("options", [])) == 0:
                to_convert.append(q)

    return to_convert


def generate_options_for_question(question):
    """
    Generate plausible MCQ options for a question.
    This is a placeholder - in production, you'd want to:
    1. Use AI to generate options based on the question
    2. Use a knowledge base of similar questions
    3. Generate mathematically plausible options
    """
    text = question.get("text", "")

    # Placeholder options - these need manual review
    # In production, this would call an LLM or use a template
    options = [
        "Option A - requires review",
        "Option B - requires review",
        "Option C - requires review",
        "Option D - requires review",
    ]

    return options


def convert_to_mcq(collection, question_id, options):
    """Convert a SHORT_ANSWER question to MCQ."""
    collection.update_one(
        {"_id": question_id},
        {
            "$set": {
                "type": "MCQ",
                "options": options,
                "convertedFrom": "SHORT_ANSWER",
                "needsReview": True,
            }
        },
    )


def mark_needs_review(collection, question_id):
    """Mark question as needing review."""
    collection.update_one({"_id": question_id}, {"$set": {"needsReview": True}})


def main(dry_run=True):
    collection = get_collection()

    print(f"Connected to MongoDB: {DB_NAME}")
    print(f"Dry run mode: {dry_run}")
    print()

    # Find questions to convert
    to_convert = find_questions_to_convert(collection)

    print(f"Found {len(to_convert)} SHORT_ANSWER questions with complex operators")
    print()

    if not to_convert:
        print("No questions need conversion.")
        return

    # Show sample
    print("Questions that would be converted to MCQ:")
    print("-" * 80)

    for q in to_convert[:10]:
        print(f"ID: {q.get('_id')}")
        print(f"Question: {q.get('text', '')[:100]}...")
        print(f"Type: {q.get('type')}")
        print()

    if len(to_convert) > 10:
        print(f"... and {len(to_convert) - 10} more questions")
        print()

    # Note: We cannot auto-generate good options without AI/LLM
    # So we'll mark these for manual review instead
    print("NOTE: Auto-generating MCQ options requires AI.")
    print("These questions will be marked for manual review.")
    print()

    if not dry_run:
        print("Marking questions as needing review...")

        for q in to_convert:
            mark_needs_review(collection, q["_id"])

        print(f"Marked {len(to_convert)} questions for manual review")
    else:
        print("Run without --dry-run to mark questions for review")


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv or "-d" in sys.argv
    main(dry_run=dry_run)
