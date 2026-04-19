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

# Class 10 totals
total = questions.count_documents({"provenance.class": "10"})
print("Total Class 10 questions:", total)

audited = questions.count_documents(
    {"provenance.class": "10", "audit_status": {"$exists": True, "$ne": None}}
)
print("Audited (audit_status exists and not null):", audited)

pending = questions.count_documents({"provenance.class": "10", "audit_status": None})
print("Pending (audit_status null):", pending)

# Check if any document missing audit_status field entirely
missing_field = questions.count_documents(
    {"provenance.class": "10", "audit_status": {"$exists": False}}
)
print("Missing audit_status field entirely:", missing_field)

# Check how many have audit_status: None explicitly?
explicit_null = questions.count_documents(
    {"provenance.class": "10", "audit_status": None}
)
# Note: explicit_null includes both null and missing. To differentiate, we need $exists.
