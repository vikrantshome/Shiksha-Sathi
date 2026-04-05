from llama_cpp import Llama
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import re
import ast
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Naviksha AI Agent")

logger.info("Loading Qwen2.5-3B-Instruct GGUF Q4_K_M model...")
llm = Llama.from_pretrained(
    repo_id="bartowski/Qwen2.5-3B-Instruct-GGUF",
    filename="*Q4_K_M.gguf",
    n_ctx=4096,
    verbose=False,
    n_threads=2,
)
logger.info("Model loaded successfully.")

NO_ATTEMPT_PATTERNS = [
    r'^i\s+don\'?t\s+know',
    r'^i\s+have\s+no\s+idea',
    r'^no\s+answer',
    r'^skip(ped)?\s+',
    r'^not\s+sure',
    r'^idk',
    r'^cannot\s+answer',
    r'^no\s+response',
]


class GradingRequest(BaseModel):
    question: str
    expected_answer: str
    student_answer: str
    max_marks: int


def is_blank(answer):
    return not answer or not answer.strip()


def is_no_attempt(answer):
    if not answer or not answer.strip():
        return False
    text = answer.strip().lower()
    for pattern in NO_ATTEMPT_PATTERNS:
        if re.match(pattern, text):
            return True
    return False


def build_messages(req):
    sa = req.student_answer.strip()
    system_msg = (
        "You are an expert teacher grading student answers. "
        "Grade based on conceptual correctness, not keyword matching. "
        "Grade ONLY what the student wrote, not the reference answer."
    )
    json_format = (
        '{"marks_awarded": NUMBER, "max_marks": ' + str(req.max_marks) +
        ', "is_correct": BOOLEAN, "reasoning": "STRING", "confidence": NUMBER}'
    )
    user_msg = "\n".join([
        "Question: " + req.question,
        "Reference Answer: " + req.expected_answer,
        "Student's Answer: " + sa,
        "Maximum Marks: " + str(req.max_marks),
        "",
        "Instructions:",
        "- Compare the student's answer to the reference for conceptual understanding.",
        "- Do NOT grade based on keyword matching or exact wording.",
        "- Grade ONLY what the student wrote.",
        "- Full marks: student demonstrates conceptual understanding.",
        "- Partial marks: student mentions relevant concepts but lacks completeness.",
        "- Zero marks: student's answer is irrelevant, incorrect, contradictory, or shows misunderstanding.",
        "- Accept synonyms, paraphrases, and equivalent expressions.",
        "- Be generous with minor spelling errors if the concept is clear.",
        "",
        "Respond ONLY with a JSON object, nothing else:",
        "Format: " + json_format,
    ])
    return [
        {"role": "system", "content": system_msg},
        {"role": "user", "content": user_msg},
    ]


def extract_first_json_object(text):
    """Find the first complete JSON object in text, handling trailing garbage."""
    text = text.strip()
    m = re.search(r'```json\s*([\s\S]*?)```', text)
    if m:
        text = m.group(1).strip()
    start = text.find('{')
    if start < 0:
        raise ValueError(f"No JSON object found in: {text[:200]}")
    depth = 0
    in_string = False
    escape_next = False
    for i in range(start, len(text)):
        ch = text[i]
        if escape_next:
            escape_next = False
            continue
        if ch == '\\':
            escape_next = True
            continue
        if ch == '"' and not escape_next:
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return text[start:i + 1]
    raise ValueError(f"Incomplete JSON object in: {text[:200]}")


def parse_json_response(text):
    """Parse JSON with multiple fallback strategies."""
    json_str = extract_first_json_object(text)
    # Strategy 1: standard JSON
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        pass
    # Strategy 2: Python dict literal (handles single quotes)
    try:
        result = ast.literal_eval(json_str)
        if isinstance(result, dict):
            return result
    except (ValueError, SyntaxError):
        pass
    # Strategy 3: Replace single quotes with double quotes
    try:
        fixed = json_str.replace("'", '"')
        return json.loads(fixed)
    except json.JSONDecodeError:
        raise ValueError(f"Could not parse AI response as JSON: {json_str[:300]}")


@app.post("/grade")
def grade(req: GradingRequest):
    try:
        # Guard: blank answers get 0 marks immediately (no model call)
        if is_blank(req.student_answer):
            return {
                "marks_awarded": 0,
                "max_marks": req.max_marks,
                "is_correct": False,
                "reasoning": "No answer provided",
                "confidence": 1.0,
            }

        # Guard: "I don't know" type answers get 0 marks
        if is_no_attempt(req.student_answer):
            return {
                "marks_awarded": 0,
                "max_marks": req.max_marks,
                "is_correct": False,
                "reasoning": "Student indicated they do not know the answer",
                "confidence": 1.0,
            }

        messages = build_messages(req)
        result = llm.create_chat_completion(
            messages=messages,
            max_tokens=256,
            temperature=0.1,
        )
        raw = result["choices"][0]["message"]["content"]
        logger.info("Raw AI response: %s", raw[:300])
        parsed = parse_json_response(raw)
        return parsed
    except Exception as e:
        logger.exception("Grading error")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok", "model": "Qwen2.5-3B-Instruct-Q4_K_M"}
