import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/shikshasathi")
DB_NAME = os.getenv("DB_NAME", "shikshasathi")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

BATCH_SIZE = int(os.getenv("AUDIT_BATCH_SIZE", "50"))
MAX_QUESTIONS = int(os.getenv("AUDIT_MAX_QUESTIONS", "1000"))
FIX_MODES = ["placeholder_answer", "corrupted_control_chars", "empty_explanation", "mcq_options"]
