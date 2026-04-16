#!/usr/bin/env python3
"""
Apply fixes from audit-results.jsonl to MongoDB
Reads the audit results and applies auto_fixes to the database
"""

import argparse
import json
import logging
import os
import sys
from datetime import datetime

from pymongo import MongoClient

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s,%(msecs)03d [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def load_mongodb_uri() -> str:
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.strip().startswith("MONGODB_URI="):
                    return line.split("=", 1)[1].strip().strip('"')
    return os.environ.get("MONGODB_URI", "mongodb://localhost:27017/")


def get_mongodb_connection() -> MongoClient:
    uri = load_mongodb_uri()
    client = MongoClient(uri)
    return client["shikshasathi"]


def apply_fixes_from_results(results_file: str, db, dry_run: bool = True) -> dict:
    """Apply fixes from audit results to MongoDB"""

    stats = {"total": 0, "fixed": 0, "skipped": 0, "errors": 0}

    if not os.path.exists(results_file):
        logger.error(f"Results file not found: {results_file}")
        return stats

    with open(results_file, "r", encoding="utf-8") as f:
        for line in f:
            try:
                result = json.loads(line)
                stats["total"] += 1

                question_id = result.get("question_id")
                status = result.get("status")
                auto_fixes = result.get("auto_fixes", {})

                if status != "needs_fix" or not auto_fixes:
                    stats["skipped"] += 1
                    continue

                # Build update dict
                updates = {}
                if "type" in auto_fixes:
                    updates["type"] = auto_fixes["type"]
                if "explanation" in auto_fixes:
                    updates["explanation"] = auto_fixes["explanation"]
                if "answer" in auto_fixes:
                    updates["correctAnswer"] = auto_fixes["answer"]
                if "text" in auto_fixes:
                    updates["text"] = auto_fixes["text"]
                if "superscript" in auto_fixes:
                    # If superscript fix is provided, apply it to the question text
                    if "text" not in updates and result.get("question_text"):
                        original_text = result["question_text"]
                        # Simple replacement for common cases
                        fixed_text = original_text.replace("x2", "x²").replace(
                            "y2", "y²"
                        )
                        fixed_text = fixed_text.replace("a2b", "a²b")
                        updates["text"] = fixed_text

                if not updates:
                    stats["skipped"] += 1
                    continue

                if dry_run:
                    logger.info(
                        f"[DRY-RUN] Would fix {question_id}: {list(updates.keys())}"
                    )
                    stats["fixed"] += 1
                else:
                    from bson import ObjectId

                    try:
                        obj_id = ObjectId(question_id)
                        db.questions.update_one({"_id": obj_id}, {"$set": updates})
                        logger.info(f"Fixed {question_id}: {list(updates.keys())}")
                        stats["fixed"] += 1
                    except Exception as e:
                        logger.error(f"Error fixing {question_id}: {e}")
                        stats["errors"] += 1

            except json.JSONDecodeError as e:
                logger.warning(f"JSON decode error: {e}")
                stats["errors"] += 1
            except Exception as e:
                logger.error(f"Error processing line: {e}")
                stats["errors"] += 1

    return stats


def main():
    parser = argparse.ArgumentParser(description="Apply audit fixes to MongoDB")
    parser.add_argument(
        "--results-file",
        default="audit-results.jsonl",
        help="Audit results file",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        default=False,
        help="Dry run mode (no changes)",
    )
    args = parser.parse_args()

    logger.info(f"Results file: {args.results_file}")
    logger.info(f"Dry run: {args.dry_run}")

    try:
        db = get_mongodb_connection()
        logger.info("Connected to MongoDB")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        return 1

    stats = apply_fixes_from_results(args.results_file, db, args.dry_run)

    logger.info("=== SUMMARY ===")
    logger.info(f"Total processed: {stats['total']}")
    logger.info(f"Fixed: {stats['fixed']}")
    logger.info(f"Skipped: {stats['skipped']}")
    logger.info(f"Errors: {stats['errors']}")

    if args.dry_run:
        logger.info("(dry-run - no changes made)")

    return 0


if __name__ == "__main__":
    sys.exit(main())
