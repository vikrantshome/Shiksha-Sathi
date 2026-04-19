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

total = questions.count_documents({"provenance": {"$exists": True}})
print("Total questions (with provenance):", total)

with_status = questions.count_documents({"review_status": {"$exists": True}})
print("Questions with review_status field:", with_status)

without_status = total - with_status
print("Questions missing review_status field:", without_status)

# Show distinct statuses again
statuses = questions.distinct("review_status")
print("Distinct statuses:", statuses)
sum_by_status = {}
for s in statuses:
    count = questions.count_documents({"review_status": s})
    sum_by_status[s] = count
    print(f"  {s}: {count}")
print("Sum of counts by status:", sum(sum_by_status.values()))
