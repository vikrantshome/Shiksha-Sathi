# scripts/qa_check.py
from pymongo import MongoClient
import random
import yaml
import os


def sample_answers(n: int = 20):
    """Randomly sample enriched answers for manual spot-check."""
    if not os.path.exists("scripts/config.yaml"):
        print("Config file not found")
        return

    with open("scripts/config.yaml") as f:
        config = yaml.safe_load(f)

    client = MongoClient(config["mongodb"]["uri"])
    db = client[config["mongodb"]["database"]]
    coll = db[config["mongodb"]["collection"]]

    # Get published exemplar answers
    query = {
        "source_kind": "EXEMPLAR",
        "review_status": "PUBLISHED",
        "answer_text": {"$exists": True},
    }

    total = coll.count_documents(query)
    print(f"Total enriched answers: {total}")

    if total == 0:
        print("No enriched answers found")
        client.close()
        return

    # Random sample
    cursor = coll.aggregate([{"$match": query}, {"$sample": {"size": min(n, total)}}])

    print(f"\nSampling {min(n, total)} answers for QA:")
    print("=" * 80)

    for i, doc in enumerate(cursor, 1):
        print(
            f"\n[{i}] Class {doc.get('class')} | {doc.get('subject')} | Q{doc.get('number')}"
        )
        print(f"Source: {doc.get('answer_source', 'N/A')}")
        print(f"Quality Score: {doc.get('quality_score', 0):.2f}")
        print("-" * 60)

        # Show first 300 chars of answer
        answer = doc.get("answer_text", "")
        if len(answer) > 300:
            print(f"{answer[:300]}...")
        else:
            print(answer)

        # Check for issues
        has_figure_ref = any(
            pattern in answer.lower() for pattern in ["figure", "diagram", "draw"]
        )
        is_too_short = len(answer) < 100

        if has_figure_ref:
            print("⚠ WARNING: Contains figure/diagram reference!")
        if is_too_short:
            print("⚠ WARNING: Answer is very short!")

        print("=" * 80)

    client.close()


def main():
    sample_answers(20)


if __name__ == "__main__":
    main()
