#!/usr/bin/env python3
# scripts/run_full.py
import sys
from auto_enrich_exemplars import AutoEnricher


def main():
    """Run full enrichment across all classes."""
    print("""
    ╔══════════════════════════════════════════════╗
    ║  NCERT EXEMPLAR FULL ENRICHMENT             ║
    ║  Mode: Automated with Expert QA            ║
    ║  No manual intervention required           ║
    ╚══════════════════════════════════════════════╝
    """)

    # Optional: Accept class override
    classes = None
    if len(sys.argv) > 1:
        classes = [int(arg) for arg in sys.argv[1:]]
        print(f"Processing classes: {classes}")
    else:
        print("Processing all classes in configured order")

    enricher = AutoEnricher()

    if classes:
        for class_num in classes:
            print(f"\n{'=' * 60}")
            print(f"CLASS {class_num}")
            print(f"{'=' * 60}")
            enricher.run_batch(class_num)
    else:
        enricher.run_all_classes()

    print("\n" + "=" * 60)
    print("FULL ENRICHMENT COMPLETE")
    print("=" * 60)
    print("\nRun 'python scripts/monitor.py' to view results")

    enricher.mongo_client.close()


if __name__ == "__main__":
    main()
