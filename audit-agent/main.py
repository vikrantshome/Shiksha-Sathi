import json
import sys
import argparse
import asyncio
from datetime import datetime
from pymongo import UpdateOne
from mongodb_utils import get_questions_collection, get_audit_logs_collection, get_audit_queue_collection, close_connection
from config import BATCH_SIZE, MAX_QUESTIONS, FIX_MODES
from ncert_verifier import verify_question_ncert, batch_verify_questions


def audit_question(question):
    issues = []
    fixes = []
    
    text = question.get("text", "")
    answer = question.get("answer", "")
    explanation = question.get("explanation", "")
    q_type = question.get("type", "")
    options = question.get("options", [])
    
    if not text or len(text.strip()) < 5:
        issues.append("empty_or_short_text")
    
    if answer in ["", None, "Not provided", "N/A", "TBD"]:
        issues.append("placeholder_answer")
        fixes.append({
            "field": "answer",
            "issue": "placeholder_answer",
            "suggestion": "Answer needs to be extracted from source material"
        })
    
    if explanation in ["", None, "Not provided"]:
        issues.append("empty_explanation")
        fixes.append({
            "field": "explanation",
            "issue": "empty_explanation",
            "suggestion": "Explanation needs to be added"
        })
    
    if q_type == "MCQ":
        if not options or len(options) < 2:
            issues.append("insufficient_options")
            fixes.append({
                "field": "options",
                "issue": "insufficient_options",
                "suggestion": f"Need at least 2 options, found {len(options)}"
            })
        elif len(options) != 4:
            issues.append("non_standard_option_count")
    
    if q_type == "TRUE_FALSE":
        if options and len(options) != 2:
            issues.append("true_false_invalid_options")
    
    corrupted_chars = ['\x00', '\x01', '\x02', '\x03', '\x04', '\x05']
    for char in corrupted_chars:
        if char in text or char in str(answer) or char in str(explanation):
            issues.append("corrupted_control_chars")
            fixes.append({
                "field": "text",
                "issue": "corrupted_control_chars",
                "suggestion": "Remove corrupted control characters"
            })
            break
    
    return {
        "question_id": str(question.get("_id")),
        "issues": issues,
        "fixes": fixes,
        "severity": "high" if len(issues) > 2 else "medium" if len(issues) > 0 else "low"
    }


def run_audit(mode="check", fix_mode=None, class_level=None, subject=None, limit=MAX_QUESTIONS, enable_ncert=False):
    questions_collection = get_questions_collection()
    audit_logs_collection = get_audit_logs_collection()
    audit_queue_collection = get_audit_queue_collection()

    query = {}
    if class_level:
        query["provenance.class"] = str(class_level)
    if subject:
        query["provenance.subject"] = subject

    total_count = questions_collection.count_documents(query)
    print(f"Found {total_count} questions to audit")

    if total_count == 0:
        print("No questions found matching criteria")
        return

    audit_results = []
    fixes_applied = 0
    queued_items = 0

    cursor = questions_collection.find(query).limit(min(limit, total_count))
    questions = list(cursor)

    if enable_ncert:
        print(f"Running NCERT verification on {len(questions)} questions...")
        ncert_results = asyncio.run(batch_verify_questions(questions))
        print(f"NCERT verification complete")
    else:
        ncert_results = [None] * len(questions)

    for idx, question in enumerate(questions):
        result = audit_question(question)

        ncert = ncert_results[idx] if enable_ncert and idx < len(ncert_results) else None
        if ncert:
            result["issues"].extend(ncert.issues)
            result["fixes"].extend(ncert.fixes)
            result["ncert_verified"] = ncert.verified
            result["ncert_confidence"] = ncert.confidence
            result["ncert_reasoning"] = ncert.reasoning

        if result["issues"]:
            audit_results.append(result)

            log_entry = {
                "question_id": result["question_id"],
                "issues": result["issues"],
                "fixes": result["fixes"],
                "severity": result["severity"],
                "created_at": datetime.utcnow(),
                "status": "pending_review"
            }
            if ncert:
                log_entry["ncert_verified"] = ncert.verified
                log_entry["ncert_confidence"] = ncert.confidence
                log_entry["ncert_reasoning"] = ncert.reasoning
            audit_logs_collection.insert_one(log_entry)

            if mode == "fix" and result["fixes"]:
                should_fix = True
                if fix_mode:
                    should_fix = any(f["issue"] == fix_mode for f in result["fixes"])

                if should_fix:
                    for fix in result["fixes"]:
                        if fix_mode and fix["issue"] != fix_mode:
                            continue

                        queue_entry = {
                            "question_id": result["question_id"],
                            "suggested_fix": fix["suggestion"],
                            "field": fix["field"],
                            "issue_type": fix["issue"],
                            "confidence": 0.8,
                            "status": "pending",
                            "created_at": datetime.utcnow()
                        }
                        if ncert:
                            queue_entry["ncert_verified"] = ncert.verified
                            queue_entry["ncert_confidence"] = ncert.confidence
                            queue_entry["ncert_reasoning"] = ncert.reasoning
                        audit_queue_collection.insert_one(queue_entry)
                        queued_items += 1

    summary = {
        "total_audited": len(questions),
        "issues_found": len(audit_results),
        "fixes_queued": queued_items,
        "mode": mode,
        "ncert_verification": enable_ncert,
        "criteria": {
            "class_level": class_level,
            "subject": subject,
            "limit": limit
        }
    }

    print(f"\nAudit Complete:")
    print(f"  Total questions audited: {summary['total_audited']}")
    print(f"  Issues found: {summary['issues_found']}")
    print(f"  Fixes queued: {summary['fixes_queued']}")
    if enable_ncert:
        ncert_verified_count = sum(1 for r in ncert_results if r and r.verified)
        print(f"  NCERT verified: {ncert_verified_count}/{len(questions)}")

    return summary


def main():
    parser = argparse.ArgumentParser(description="Audit questions for quality issues")
    parser.add_argument("--mode", choices=["check", "fix"], default="check",
                       help="Audit mode: check only or queue fixes")
    parser.add_argument("--fix-mode", choices=FIX_MODES,
                       help="Specific fix mode to apply")
    parser.add_argument("--class", dest="class_level", type=int,
                       help="Filter by class level (6-12)")
    parser.add_argument("--subject",
                       help="Filter by subject")
    parser.add_argument("--limit", type=int, default=MAX_QUESTIONS,
                       help="Maximum questions to audit")
    parser.add_argument("--ncert", action="store_true",
                       help="Enable NCERT external verification via crawl4ai")

    args = parser.parse_args()

    try:
        summary = run_audit(
            mode=args.mode,
            fix_mode=args.fix_mode,
            class_level=args.class_level,
            subject=args.subject,
            limit=args.limit,
            enable_ncert=args.ncert
        )
        
        print(json.dumps(summary, indent=2, default=str))
        
    except Exception as e:
        print(f"Error during audit: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        close_connection()


if __name__ == "__main__":
    main()
