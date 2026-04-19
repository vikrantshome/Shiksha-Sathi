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

# Count questions with provenance but missing review_status
missing_review = questions.count_documents(
    {"provenance": {"$exists": True}, "review_status": {"$exists": False}}
)
print("Questions with provenance but missing review_status:", missing_review)

# Check if any such exist
if missing_review > 0:
    sample = questions.find_one(
        {"provenance": {"$exists": True}, "review_status": {"$exists": False}}
    )
    print(
        "Sample:",
        sample.get("_id"),
        sample.get("provenance"),
        sample.get("review_status"),
    )
