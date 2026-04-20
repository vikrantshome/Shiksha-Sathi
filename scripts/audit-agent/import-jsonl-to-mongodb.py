#!/usr/bin/env python3
"""
Import legacy audit JSONL files into MongoDB.
The JSON lines have the same shape as the audit results already inserted by
`audit-agent.py`. This script reads one or more JSONL files and inserts each entry
into the `audit_results` collection using the same field mapping as
`save_audit_result_to_mongodb`.

Usage:
    python import-jsonl-to-mongodb.py <path/to/file1.jsonl> [<path/to/file2.jsonl> ...]

If no files are provided, it will import all three class audit JSONL files
found in the `scripts/audit-agent` directory.
"""

import os
import sys
import json
import glob
from datetime import datetime
from typing import List, Dict

from pymongo import MongoClient


# Re‑use the connection logic from audit-agent.py (compatible with the project's .env)
def load_mongodb_uri() -> str:
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.strip().startswith("MONGODB_URI="):
                    return line.split("=", 1)[1].strip().strip('"')
    return os.environ.get("MONGODB_URI", "mongodb://localhost:27017/")


def get_db() -> "MongoClient":
    uri = load_mongodb_uri()
    client = MongoClient(uri)
    # Database name is part of the URI (e.g. .../shikshasathi?) – if not, default to "shikshasathi"
    db_name = uri.rsplit("/", 1)[-1].split("?", 1)[0] or "shikshasathi"
    return client[db_name]


def map_line_to_doc(line: Dict) -> Dict:
    """Map a raw JSON line to the AuditResult document structure.
    Uses camelCase to match the MongoDB collection format.
    """
    # Handle both status formats: "fixed" (new) or "needs_fix" (legacy)
    status = line.get("status", "unknown")
    if status == "needs_fix":
        audit_status = "needs_fix"
    elif status == "ok" or status == "approved":
        audit_status = "ok"
    elif status == "fixed":
        audit_status = "fixed"
    else:
        audit_status = status

    # Map auto_fixes keys to camelCase
    auto_fixes = line.get("auto_fixes", {})
    mapped_fixes = {}
    for k, v in auto_fixes.items():
        # Convert snake_case keys to camelCase
        if k == "question":
            mapped_fixes["question"] = v
        elif k == "correct_answer":
            mapped_fixes["correctAnswer"] = v
        elif k == "question_type":
            mapped_fixes["type"] = v
        elif k == "question_options":
            mapped_fixes["options"] = v
        elif k == "explanation":
            mapped_fixes["explanation"] = v
        else:
            mapped_fixes[k] = v

    audit_doc = {
        "questionId": line.get("question_id"),
        "classLevel": int(line.get("class", 0)) if line.get("class") else None,
        "chapter": line.get("chapter", ""),
        "subject": line.get("subject", ""),
        "auditStatus": audit_status,
        "issues": line.get("issues", []),
        "autoFixes": mapped_fixes,
        "recommendation": line.get("recommendation", "unknown"),
        "dbStatus": line.get("status_db", ""),
        "questionText": line.get("question_text", ""),
        "questionType": line.get("type", ""),
        "correctAnswer": line.get("correctAnswer", ""),
        "questionOptions": line.get("options", []),
        "explanation": line.get("explanation", ""),
        "auditedAt": datetime.utcnow(),
        "appliedAt": None,
        "appliedBy": None,
        "auditRunId": line.get("audit_run_id", "legacy_import"),
    }
    return audit_doc


def import_file(db, path: str) -> int:
    count = 0
    with open(path, "r", encoding="utf-8") as f:
        for raw in f:
            raw = raw.strip()
            if not raw:
                continue
            try:
                line = json.loads(raw)
                doc = map_line_to_doc(line)
                db.audit_results.insert_one(doc)
                count += 1
            except Exception as e:
                print(f"[WARN] Failed to import line in {path}: {e}", file=sys.stderr)
    return count


def main(argv: List[str] = None):
    if argv is None:
        argv = sys.argv[1:]

    # Determine which files to import.
    if not argv:
        # No explicit files – import the three class files.
        default_dir = os.path.join(os.path.dirname(__file__))
        patterns = [
            "audit-class8.jsonl",
            "audit-class9.jsonl",
            "audit-class10.jsonl",
            "audit-class11.jsonl",
        ]
        files = [os.path.join(default_dir, p) for p in patterns]
    else:
        files = argv

    db = get_db()
    total_imported = 0
    for file_path in files:
        if not os.path.isfile(file_path):
            print(f"[ERROR] File not found: {file_path}", file=sys.stderr)
            continue
        print(f"Importing {file_path} ...")
        imported = import_file(db, file_path)
        print(f"  Imported {imported} records from {os.path.basename(file_path)}")
        total_imported += imported
    print(f"Finished. Total records imported: {total_imported}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
