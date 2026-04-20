import os
from pymongo import MongoClient

env_path = os.path.join(os.path.dirname(__file__), "scripts", "audit-agent", ".env")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            if line.strip().startswith("MONGODB_URI="):
                uri = line.split("=", 1)[1].strip().strip('"')
                break
else:
    uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/")

client = MongoClient(uri)
db = client["shikshasathi"]
questions = db["questions"]

# Get totals by provenance.class
result = questions.aggregate(
    [
        {
            "$group": {
                "_id": "$provenance.class",
                "total": {"$sum": 1},
                "audited": {
                    "$sum": {"$cond": [{"$ne": ["$audit_status", None]}, 1, 0]}
                },
            }
        }
    ]
)
print("Class | Total | Audited")
print("-----------------------")
for r in result:
    print(f"{r['_id']} | {r['total']} | {r['audited']}")

# Check distinct review_status for class 10 pending?
print("\nDistinct review_status for Class 10:")
class10_statuses = questions.distinct("review_status", {"provenance.class": "10"})
for s in class10_statuses:
    count = questions.count_documents({"provenance.class": "10", "review_status": s})
    print(f"  {s}: {count}")

# Count pending (audit_status null) for class 10
pending10 = questions.count_documents({"provenance.class": "10", "audit_status": None})
print(f"\nPending (audit_status null) for Class 10: {pending10}")
