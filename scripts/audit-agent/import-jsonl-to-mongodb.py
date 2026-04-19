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
    The source line uses snake_case keys that match the fields expected by the
    Java `AuditResult` entity, which are stored in MongoDB using the @Field names.
    This function now produces keys that align with those Mongo field names.
    """
    # Basic required fields – provide sensible defaults if missing.
    audit_doc = {
        "question_id": line.get("question_id"),
        "class_level": int(line.get("class", 0)) if line.get("class") else None,
        "chapter": line.get("chapter", ""),
        "subject": line.get("subject", ""),
        "audit_status": line.get("status", "unknown"),
        "issues": line.get("issues", []),
        "auto_fixes": line.get("auto_fixes", {}),
        "recommendation": line.get("recommendation", "unknown"),
        "db_status": line.get("status_db", ""),
        "question_text": line.get("question_text", ""),
        "question_type": line.get("type", ""),
        "correct_answer": line.get("correctAnswer", ""),
        "question_options": line.get("options", []),
        "explanation": line.get("explanation", ""),
        "audited_at": datetime.utcnow(),
        "applied_at": None,
        "applied_by": None,
        "audit_run_id": line.get("audit_run_id", "legacy_import"),
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
        patterns = ["audit-class9.jsonl", "audit-class10.jsonl", "audit-class11.jsonl"]
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
