from pymongo import MongoClient
from config import MONGODB_URI, DB_NAME

_client = None
_db = None

def get_db():
    global _client, _db
    if _db is None:
        _client = MongoClient(MONGODB_URI)
        _db = _client[DB_NAME]
    return _db

def get_questions_collection():
    return get_db()["questions"]

def get_audit_logs_collection():
    return get_db()["audit_logs"]

def get_audit_queue_collection():
    return get_db()["audit_queue_items"]

def close_connection():
    global _client
    if _client:
        _client.close()
        _client = None
