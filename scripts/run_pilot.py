#!/usr/bin/env python3
# scripts/run_pilot.py
import asyncio
import logging
from datetime import datetime
from auto_enrich_exemplars import AutoEnricher


async def main():
    """Run Class 10 Mathematics pilot."""
    print("""
    ╔══════════════════════════════════════════════╗
    ║     NCERT EXEMPLAR PILOT - CLASS 10 MATHS   ║
    ║     Automated Solution Enrichment           ║
    ║     Subject Expert: Automated QA System    ║
    ╚══════════════════════════════════════════════╝
    """)

    enricher = AutoEnricher()

    # Load just Class 10 Maths questions
    query = {
        "source_kind": "EXEMPLAR",
        "review_status": "DRAFT",
        "class": 10,
        "subject": {"$regex": "math|Mathematics", "$options": "i"},
        "type": {"$ne": "LONG_ANSWER"},
    }

    # Manual filter for figures
    questions = list(enricher.collection.find(query).limit(21))
    filtered = []
    figure_patterns = [
        "figure",
        "diagram",
        "draw",
        "construct",
        "sketch",
        "image",
        "picture",
    ]

    for q in questions:
        has_figure = False
        for field in ["question_text", "question_html", "question"]:
            if field in q:
                text = str(q[field]).lower()
                if any(p in text for p in figure_patterns):
                    has_figure = True
                    break
        if not has_figure:
            filtered.append(q)

    print(f"Found {len(filtered)} eligible questions (excluded figures)")
    print("Starting automated enrichment...\n")

    # Process each question
    for i, question in enumerate(filtered, 1):
        q_num = question.get("number", i)
        print(f"[{i}/{len(filtered)}] Processing Q{q_num}...")

        try:
            await enricher.process_question(question)
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            enricher.tracker.add_failure(
                str(question["_id"]), question, "Pilot exception", str(e)
            )

    enricher.tracker.save_results()
    enricher.mongo_client.close()

    # Show summary
    print("\n" + "=" * 60)
    print("PILOT COMPLETE")
    print("=" * 60)

    total = len(enricher.tracker.results)
    success = sum(1 for r in enricher.tracker.results if r.status == "success")

    print(f"Total processed: {total}")
    print(f"Successful: {success}")
    print(f"Success rate: {success / total * 100:.1f}%" if total > 0 else "N/A")
    print("\nCheck logs/ for detailed results")


if __name__ == "__main__":
    asyncio.run(main())
