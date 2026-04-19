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

# Find the 24 pending (audit_status null)
pending = questions.find({"audit_status": None, "provenance": {"$exists": True}})
print("Pending questions (audit_status null) with provenance:")
count = 0
for q in pending:
    count += 1
    class_val = q.get("provenance", {}).get("class", "N/A")
    review = q.get("review_status", "N/A")
    print(f"ID: {q['_id']}, Class: {class_val}, Review: {review}")
print(f"Total pending: {count}")
