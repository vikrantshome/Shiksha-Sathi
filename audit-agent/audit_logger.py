import json
from datetime import datetime
from mongodb_utils import get_audit_logs_collection

def log_audit_action(action, details):
    collection = get_audit_logs_collection()
    collection.insert_one({
        "action": action,
        "details": details,
        "timestamp": datetime.utcnow()
    })
