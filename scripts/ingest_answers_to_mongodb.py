#!/usr/bin/env python3
"""
Ingest answered questions from eligible_questions.json to MongoDB.
Matches questions by class_level, subject, chapter_number, and question_text.
"""

import json
import os
import sys
import yaml
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import PyMongoError

CONFIG_PATH = "scripts/config.yaml"
ELIGIBLE_JSON = "eligible_questions.json"


def load_config(config_path: str = CONFIG_PATH) -> dict:
    with open(config_path) as f:
        return yaml.safe_load(f)


def load_eligible_questions(json_path: str = ELIGIBLE_JSON) -> list:
    with open(json_path) as f:
        return json.load(f)


def escape_regex(s: str) -> str:
    """Escape regex special characters in a string."""
    if not s:
        return ""
    special_chars = r"\.*+?^${}|()[]"
    for char in special_chars:
        s = s.replace(char, "\\" + char)
    return s


def find_matching_question(db_collection, question: dict) -> dict:
    """Find matching question in MongoDB using multiple criteria."""
    class_level = question.get("class_level")
    subject = question.get("subject")
    chapter_number = question.get("chapter_number")
    question_text = question.get("question_text", "")
    provenance_excerpt = question.get("provenance_excerpt", "")
    question_id = question.get("question_id", "")

    # First try exact question_id match if available
    if question_id:
        exact = db_collection.find_one({"question_id": question_id})
        if exact:
            return exact

    # Try class/subject/chapter with text match
    query = {
        "provenance.class": str(class_level) if class_level else None,
        "provenance.subject": subject,
        "provenance.chapterNumber": chapter_number,
    }

    query = {k: v for k, v in query.items() if v is not None}

    if provenance_excerpt:
        escaped = escape_regex(provenance_excerpt[:80])
        if escaped:
            query["$or"] = [
                {"text": {"$regex": f"^{escaped}", "$options": "i"}},
                {"provenance_excerpt": {"$regex": f"^{escaped}", "$options": "i"}},
            ]
    elif question_text:
        escaped = escape_regex(question_text[:80])
        if escaped:
            query["$or"] = [
                {"text": {"$regex": f"^{escaped}", "$options": "i"}},
                {"provenance_excerpt": {"$regex": f"^{escaped}", "$options": "i"}},
            ]

    if not query.get("$or"):
        return None

    try:
        result = db_collection.find_one(query)
        if result:
            return result

        # Fallback: try without chapter number
        fallback_query = {
            k: v for k, v in query.items() if k != "provenance.chapterNumber"
        }
        return db_collection.find_one(fallback_query)
    except PyMongoError as e:
        print(f"Query error: {e}")
        return None


def update_question(db_collection, mongo_question: dict, json_question: dict) -> bool:
    """Update MongoDB question with answer from JSON."""
    answer_key = json_question.get("answer_key", "")
    answer_explanation = json_question.get("answer_explanation", "")

    if not answer_key and not answer_explanation:
        return False

    update_data = {
        "answer_text": answer_key,
        "answer_explanation": answer_explanation,
        "answer_source": "manual-enrichment",
        "reviewed_by": "ingestion-script",
        "reviewed_at": datetime.utcnow(),
    }

    if json_question.get("review_state") == "approved":
        update_data["review_status"] = "PUBLISHED"

    try:
        result = db_collection.update_one(
            {"_id": mongo_question["_id"]}, {"$set": update_data}
        )
        return result.modified_count >= 1
    except PyMongoError as e:
        print(f"Update error: {e}")
        return False


def main():
    print("=" * 60)
    print("Ingesting answers from eligible_questions.json to MongoDB")
    print("=" * 60)

    config = load_config()
    mongodb_uri = os.environ.get("MONGODB_URI", config["mongodb"]["uri"])

    if not mongodb_uri:
        print("ERROR: MONGODB_URI not set. Set it via environment or config.")
        sys.exit(1)

    print(f"\nConnecting to MongoDB...")
    client = MongoClient(mongodb_uri)
    db = client[config["mongodb"]["database"]]
    collection = db[config["mongodb"]["collection"]]
    print("Connected!")

    print(f"\nLoading {ELIGIBLE_JSON}...")
    questions = load_eligible_questions()
    total = len(questions)
    print(f"Loaded {total} questions from JSON")

    stats = {
        "total": total,
        "matched": 0,
        "updated": 0,
        "skipped_no_answer": 0,
        "errors": 0,
    }

    print(f"\nProcessing questions...")
    for i, q in enumerate(questions):
        if (i + 1) % 100 == 0:
            print(f"  Progress: {i + 1}/{total} ({stats['updated']} updated)")

        answer_key = q.get("answer_key", "").strip()
        if not answer_key:
            stats["skipped_no_answer"] += 1
            continue

        mongo_q = find_matching_question(collection, q)
        if not mongo_q:
            stats["errors"] += 1
            continue

        stats["matched"] += 1

        if update_question(collection, mongo_q, q):
            stats["updated"] += 1
        else:
            stats["errors"] += 1

    client.close()

    print("\n" + "=" * 60)
    print("INGESTION COMPLETE")
    print("=" * 60)
    print(f"Total questions in JSON:     {stats['total']}")
    print(f"Matched in MongoDB:          {stats['matched']}")
    print(f"Successfully updated:        {stats['updated']}")
    print(f"Skipped (no answer):         {stats['skipped_no_answer']}")
    print(f"Errors/not found:            {stats['errors']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
