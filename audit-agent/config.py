import os
from pathlib import Path
from dotenv import load_dotenv

project_root = Path(__file__).resolve().parent.parent
load_dotenv(project_root / ".env")
load_dotenv(project_root / ".env.local", override=True)

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/shikshasathi")
DB_NAME = os.getenv("DB_NAME", "shikshasathi")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

BATCH_SIZE = int(os.getenv("AUDIT_BATCH_SIZE", "50"))
MAX_QUESTIONS = int(os.getenv("AUDIT_MAX_QUESTIONS", "1000"))
FIX_MODES = [
    "placeholder_answer",
    "corrupted_control_chars",
    "empty_explanation",
    "mcq_options",
    "ncert_source_missing",
    "answer_verification_failed",
    "ncert_low_confidence_match",
]

LLM_PROVIDER = os.getenv("AUDIT_LLM_PROVIDER", "minimax/minimax-m2.5:free")
LLM_API_KEY = os.getenv("OPENROUTER_API_KEY") or os.getenv("AUDIT_LLM_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
LLM_TEMPERATURE = float(os.getenv("AUDIT_LLM_TEMPERATURE", "0.1"))

NCERT_REQUEST_DELAY = float(os.getenv("NCERT_REQUEST_DELAY", "2.0"))
NCERT_MAX_RETRIES = int(os.getenv("NCERT_MAX_RETRIES", "3"))

ENABLE_NCERT_VERIFICATION = os.getenv("ENABLE_NCERT_VERIFICATION", "true").lower() == "true"
