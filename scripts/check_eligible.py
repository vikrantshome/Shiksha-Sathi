#!/usr/bin/env python3
# scripts/check_eligible.py
import os

os.environ["MONGODB_URI"] = (
    "mongodb+srv://devteam2025:devteam2026@naviksha.g77okxs.mongodb.net/shikshasathi?appName=naviksha"
)

from pymongo import MongoClient


def main():
    client = MongoClient(os.environ["MONGODB_URI"])
    db = client.shikshasathi
    collection = db.questions

    print("=" * 60)
    print("ELIGIBILITY ANALYSIS FOR AUTOMATED ENRICHMENT")
    print("=" * 60)

    figure_patterns = [
        "figure",
        "diagram",
        "draw",
        "construct",
        "sketch",
        "image",
        "picture",
    ]

    # Total DRAFT EXEMPLAR
    total_draft = collection.count_documents(
        {"source_kind": "EXEMPLAR", "review_status": "DRAFT"}
    )
    print(f"\n1. Total DRAFT EXEMPLAR questions: {total_draft}")

    # Exclude LONG_ANSWER
    exclude_long_answer = collection.count_documents(
        {"source_kind": "EXEMPLAR", "review_status": "DRAFT", "type": "LONG_ANSWER"}
    )
    print(f"   - LONG_ANSWER type: {exclude_long_answer}")

    after_long = total_draft - exclude_long_answer
    print(f"   → After excluding LONG_ANSWER: {after_long}")

    # Exclude those with existing answer_text
    with_answer = collection.count_documents(
        {
            "source_kind": "EXEMPLAR",
            "review_status": "DRAFT",
            "answer_text": {"$exists": True},
        }
    )
    print(f"\n2. Already have answer_text: {with_answer}")
    after_answers = after_long - with_answer
    print(f"   → After removing answered: {after_answers}")

    # Estimate figure/diagram questions (sample-based check)
    # Let's check a sample of 100 to estimate the figure exclusion rate
    sample = list(
        collection.find(
            {
                "source_kind": "EXEMPLAR",
                "review_status": "DRAFT",
                "type": {"$ne": "LONG_ANSWER"},
                "answer_text": {"$exists": False},
            }
        ).limit(100)
    )

    figure_count = 0
    for q in sample:
        text = str(q.get("text", "")).lower()
        if any(pat in text for pat in figure_patterns):
            figure_count += 1

    figure_rate = figure_count / len(sample) if sample else 0
    estimated_figures = int(after_answers * figure_rate)

    print(f"\n3. Figure/diagram questions (sample):")
    print(f"   - Sampled: {len(sample)} questions")
    print(f"   - With figure references: {figure_count} ({figure_rate * 100:.1f}%)")
    print(f"   - Estimated total to exclude: ~{estimated_figures}")

    eligible = after_answers - estimated_figures
    print(f"\n4. ESTIMATED ELIGIBLE QUESTIONS: {eligible}")

    # Breakdown by class for eligible questions (approximation)
    print("\n5. Approximate eligible by class:")
    pipeline = [
        {
            "$match": {
                "source_kind": "EXEMPLAR",
                "review_status": "DRAFT",
                "type": {"$ne": "LONG_ANSWER"},
                "answer_text": {"$exists": False},
            }
        },
        {"$group": {"_id": "$provenance.class", "total": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]

    for result in collection.aggregate(pipeline):
        class_num = result["_id"]
        total = result["total"]
        # Apply same figure rate
        eligible_count = int(total * (1 - figure_rate))
        print(f"   Class {class_num}: ~{eligible_count} eligible")

    client.close()


if __name__ == "__main__":
    main()
