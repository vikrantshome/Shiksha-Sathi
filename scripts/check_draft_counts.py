#!/usr/bin/env python3
# scripts/check_draft_counts.py
import os

os.environ["MONGODB_URI"] = (
    "mongodb+srv://devteam2025:devteam2026@naviksha.g77okxs.mongodb.net/shikshasathi?appName=naviksha"
)

from pymongo import MongoClient
from bson import ObjectId


def main():
    client = MongoClient(os.environ["MONGODB_URI"])
    db = client.shikshasathi
    collection = db.questions

    print("=" * 60)
    print("DRAFT EXEMPLAR QUESTIONS BY CLASS")
    print("=" * 60)

    # Get counts by class from provenance
    pipeline = [
        {"$match": {"source_kind": "EXEMPLAR", "review_status": "DRAFT"}},
        {
            "$group": {
                "_id": "$provenance.class",
                "count": {"$sum": 1},
                "subjects": {"$addToSet": "$provenance.subject"},
            }
        },
        {"$sort": {"_id": 1}},
    ]

    total = 0
    for result in collection.aggregate(pipeline):
        class_num = result["_id"]
        count = result["count"]
        total += count
        subjects = ", ".join(result["subjects"])
        print(f"Class {class_num}: {count:4d} questions | Subjects: {subjects}")

    print(f"\nTOTAL DRAFT EXEMPLAR: {total}")

    # Show sample question structure
    print("\nSAMPLE DRAFT QUESTION:")
    sample = collection.find_one({"source_kind": "EXEMPLAR", "review_status": "DRAFT"})
    print(f"  _id: {sample['_id']}")
    print(f"  question_id: {sample.get('question_id')}")
    print(f"  text: {sample.get('text', '')[:80]}...")
    print(f"  provenance.class: {sample.get('provenance', {}).get('class')}")
    print(f"  provenance.subject: {sample.get('provenance', {}).get('subject')}")
    print(
        f"  provenance.chapterTitle: {sample.get('provenance', {}).get('chapterTitle')}"
    )
    print(f"  answer_text exists: {'answer_text' in sample}")

    client.close()


if __name__ == "__main__":
    main()
