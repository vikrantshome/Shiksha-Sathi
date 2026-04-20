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

statuses = questions.distinct("review_status")
print("All distinct review_status values:", statuses)
for s in statuses:
    count = questions.count_documents({"review_status": s})
    print(f"  {s}: {count}")
