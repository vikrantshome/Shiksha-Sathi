"""Audit Status API - View audit progress in real-time"""

import os
from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson import ObjectId
import json
from datetime import datetime

app = Flask(__name__)


# Custom JSON encoder for ObjectId
class CustomJSONProvider(app.json_provider_class):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)


app.json_provider_class = CustomJSONProvider


def fix_objectid(doc):
    """Convert ObjectId to string for JSON serialization"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [fix_objectid(d) for d in doc]
    if isinstance(doc, dict):
        result = {}
        for k, v in doc.items():
            if isinstance(v, ObjectId):
                result[k] = str(v)
            elif isinstance(v, dict):
                result[k] = fix_objectid(v)
            elif isinstance(v, list):
                result[k] = fix_objectid(v)
            else:
                result[k] = v
        return result
    return doc


MONGO_URI = "mongodb+srv://devteam2025:devteam2026@naviksha.g77okxs.mongodb.net/shikshasathi?appName=naviksha"
client = MongoClient(MONGO_URI)
db = client["shikshasathi"]


@app.route("/api/audit/status")
def audit_status():
    """Get overall audit status"""

    # Count by audit_status
    total = db.questions.count_documents({"provenance": {"$exists": True}})

    # Get audit status counts
    audited = db.questions.count_documents(
        {"audit_status": {"$exists": True, "$ne": None}}
    )
    pending = total - audited

    # Breakdown by audit_status
    # "fixed" = questions that were auto-fixed; "ok" = passed audit; "error" = failed
    status_breakdown = {
        "ok": db.questions.count_documents({"audit_status": "ok"}),
        "fixed": db.questions.count_documents({"audit_status": "fixed"}),
        "error": db.questions.count_documents({"audit_status": "error"}),
    }

    # Error breakdown by category (for error questions only)
    error_cursor = db.questions.find(
        {"audit_status": "error", "error_category": {"$exists": True}},
        {"error_category": 1},
    )
    error_breakdown = {}
    for doc in error_cursor:
        cat = doc.get("error_category", "unknown")
        error_breakdown[cat] = error_breakdown.get(cat, 0) + 1
    # Also include errors without category
    no_cat_count = db.questions.count_documents(
        {"audit_status": "error", "error_category": {"$exists": False}}
    )
    if no_cat_count:
        error_breakdown["unclassified"] = no_cat_count

    # Breakdown by class
    class_breakdown = {}
    for c in ["6", "7", "8", "9", "10", "11", "12"]:
        total_class = db.questions.count_documents({"provenance.class": c})
        audited_class = db.questions.count_documents(
            {"provenance.class": c, "audit_status": {"$exists": True, "$ne": None}}
        )
        class_breakdown[c] = {
            "total": total_class,
            "audited": audited_class,
            "pending": total_class - audited_class,
        }

    # Recent audits
    recent = list(
        db.questions.find(
            {"audit_timestamp": {"$exists": True}},
            {
                "_id": 0,  # Exclude _id
                "id": 1,
                "audit_status": 1,
                "audit_result": 1,
                "provenance.class": 1,
                "subject": 1,
            },
        )
        .sort("audit_timestamp", -1)
        .limit(20)
    )

    return jsonify(
        {
            "total_questions": total,
            "audited": audited,
            "pending": pending,
            "progress_percent": round(audited / total * 100, 1) if total > 0 else 0,
            "status_breakdown": status_breakdown,
            "error_breakdown": error_breakdown if error_breakdown else None,
            "class_breakdown": class_breakdown,
            "recent_audits": recent,
        }
    )


@app.route("/api/audit/question/<question_id>")
def question_status(question_id):
    """Get audit status for a specific question"""

    q = db.questions.find_one(
        {"id": question_id},
        {
            "_id": 0,
            "id": 1,
            "text": 1,
            "type": 1,
            "correctAnswer": 1,
            "audit_status": 1,
            "audit_result": 1,
            "audit_errors": 1,
            "audit_timestamp": 1,
            "provenance": 1,
        },
    )

    if not q:
        return jsonify({"error": "Question not found"}), 404

    # Mask sensitive data
    if "text" in q and q["text"]:
        q["text"] = (
            q["text"][:100] + "..." if len(q.get("", "")) > 100 else q.get("text", "")
        )

    return jsonify(fix_objectid(q))


@app.route("/api/audit/test", methods=["POST"])
def test_question():
    """Test audit on a specific question ID"""
    data = request.json
    question_id = data.get("question_id")

    if not question_id:
        return jsonify({"error": "question_id required"}), 400

    q = db.questions.find_one({"id": question_id}, {"_id": 0})
    if not q:
        return jsonify({"error": "Question not found"}), 404

    return jsonify(
        {
            "question_id": question_id,
            "current_status": q.get("audit_status", "not_audited"),
            "question_data": {
                "text": q.get("text", "")[:200],
                "type": q.get("type"),
                "correctAnswer": q.get("correctAnswer"),
                "options": q.get("options"),
                "explanation": q.get("explanation"),
                "class": q.get("provenance", {}).get("class"),
                "subject": q.get("provenance", {}).get("subject"),
            },
        }
    )


@app.route("/api/audit/fix/<question_id>", methods=["POST"])
def apply_fix(question_id):
    """Manually trigger fix for a question"""
    # This would call the audit agent
    return jsonify({"message": "Fix endpoint - connect to audit agent"})


@app.route("/api/audit/logs")
def audit_logs():
    """Get audit logs - shows all audit activity"""
    limit = request.args.get("limit", 50, type=int)

    logs = list(
        db.questions.find(
            {"audit_timestamp": {"$exists": True}},
            {
                "_id": 1,
                "audit_status": 1,
                "audit_result": 1,
                "audit_timestamp": 1,
                "audit_errors": 1,
                "provenance.class": 1,
                "subject": 1,
                "type": 1,
            },
        )
        .sort("audit_timestamp", -1)
        .limit(limit)
    )

    return jsonify({"logs": fix_objectid(logs), "count": len(logs)})


@app.route("/api/audit/logs/fixed")
def audit_logs_fixed():
    """Get only fixed questions with details"""
    limit = request.args.get("limit", 50, type=int)

    logs = list(
        db.questions.find(
            {"audit_status": "fixed"},
            {
                "_id": 1,
                "audit_result": 1,
                "audit_timestamp": 1,
                "provenance.class": 1,
                "subject": 1,
                "type": 1,
                "text": 1,
                "correctAnswer": 1,
                "explanation": 1,
            },
        )
        .sort("audit_timestamp", -1)
        .limit(limit)
    )

    return jsonify(
        {
            "fixed_count": db.questions.count_documents({"audit_status": "fixed"}),
            "logs": fix_objectid(logs),
        }
    )


@app.route("/api/audit/logs/errors")
def audit_logs_errors():
    """Get only error questions"""
    limit = request.args.get("limit", 50, type=int)

    logs = list(
        db.questions.find(
            {"audit_status": "error"},
            {
                "_id": 1,
                "audit_result": 1,
                "audit_errors": 1,
                "audit_timestamp": 1,
                "provenance.class": 1,
                "subject": 1,
                "type": 1,
            },
        )
        .sort("audit_timestamp", -1)
        .limit(limit)
    )

    return jsonify(
        {
            "error_count": db.questions.count_documents({"audit_status": "error"}),
            "logs": fix_objectid(logs),
        }
    )


@app.route("/api/audit/stats")
def audit_stats():
    """Get detailed statistics"""
    total = db.questions.count_documents({"provenance": {"$exists": True}})
    audited = db.questions.count_documents({"audit_status": {"$exists": True}})

    # By class
    by_class = {}
    for c in ["6", "7", "8", "9", "10", "11", "12"]:
        by_class[c] = {
            "total": db.questions.count_documents({"provenance.class": c}),
            "ok": db.questions.count_documents(
                {"provenance.class": c, "audit_status": "ok"}
            ),
            "fixed": db.questions.count_documents(
                {"provenance.class": c, "audit_status": "fixed"}
            ),
            "error": db.questions.count_documents(
                {"provenance.class": c, "audit_status": "error"}
            ),
            "pending": db.questions.count_documents(
                {"provenance.class": c, "audit_status": {"$exists": False}}
            ),
        }
        by_class[c]["audited"] = (
            by_class[c]["ok"] + by_class[c]["fixed"] + by_class[c]["error"]
        )
        by_class[c]["progress"] = (
            round(by_class[c]["audited"] / by_class[c]["total"] * 100, 1)
            if by_class[c]["total"] > 0
            else 0
        )

    # By type
    by_type = {}
    for t in db.questions.distinct("type"):
        by_type[t] = {
            "total": db.questions.count_documents({"type": t}),
            "ok": db.questions.count_documents({"type": t, "audit_status": "ok"}),
            "fixed": db.questions.count_documents({"type": t, "audit_status": "fixed"}),
            "error": db.questions.count_documents({"type": t, "audit_status": "error"}),
        }

    return jsonify(
        {
            "total": total,
            "audited": audited,
            "pending": total - audited,
            "by_class": by_class,
            "by_type": by_type,
            "status_breakdown": {
                "ok": db.questions.count_documents({"audit_status": "ok"}),
                "fixed": db.questions.count_documents({"audit_status": "fixed"}),
                "error": db.questions.count_documents({"audit_status": "error"}),
            },
        }
    )


if __name__ == "__main__":
    print("Starting Audit Status API on http://localhost:5001")
    print("Endpoints:")
    print("  /api/audit/status   - Overall status")
    print("  /api/audit/logs     - Recent audit logs")
    print("  /api/audit/logs/fixed - Fixed questions")
    print("  /api/audit/logs/errors - Error questions")
    print("  /api/audit/stats    - Detailed statistics")
    app.run(port=5001, debug=True)
