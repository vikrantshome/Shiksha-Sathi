from llama_cpp import Llama
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json, re, ast, logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Naviksha AI Agent")

NO_ATTEMPT_PATTERNS = [
    r'^i\s+don\x27?t\s+know',
    r'^i\s+have\s+no\s+idea',
    r'^no\s+answer',
    r'^skip(ped)?\s+',
    r'^not\s+sure',
    r'^idk',
    r'^cannot\s+answer',
    r'^no\s+response',
]

logger.info("Loading Qwen3.5-2B GGUF Q4_K_M...")
llm = Llama.from_pretrained(
    repo_id="bartowski/Qwen_Qwen3.5-2B-GGUF",
    filename="*Q4_K_M.gguf",
    n_ctx=8192, n_threads=2, mlock=True, n_batch=512, verbose=False,
)
logger.info("Model loaded successfully.")


class GradingRequest(BaseModel):
    question: str
    expected_answer: str
    student_answer: str
    max_marks: int


def is_blank(a):
    return not a or not a.strip()


def is_no_attempt(a):
    if not a or not a.strip(): return False
    t = a.strip().lower()
    for p in NO_ATTEMPT_PATTERNS:
        if re.match(p, t): return True
    return False


def build_messages(req):
    sa = req.student_answer.strip()
    display = sa if sa else "(blank)"
    max_m = req.max_marks
    system_msg = (
        "You are a STRICT expert teacher grading student answers. "
        "Grade based on conceptual correctness, not keyword matching. "
        "Be strict with factual accuracy."
    )
    user_msg = (
        "Question: " + req.question + "\n"
        "Expected Answer: " + req.expected_answer + "\n"
        "Student's Answer: " + display + "\n"
        "Maximum Marks: " + str(max_m) + "\n\n"
        "STRICT GRADING RULES (follow exactly):\n"
        "1. If the student's answer is BLANK, award 0 marks.\n"
        "2. If the student's answer CONTRADICTS or is FACTUALLY INCORRECT compared to the expected answer, award EXACTLY 0 marks. DO NOT give partial credit for wrong answers.\n"
        "3. If the student's answer is CONCEPTUALLY CORRECT but uses different words, award full marks.\n"
        "4. If the student's answer shows PARTIAL UNDERSTANDING (mentions relevant concepts but incomplete), award partial marks (between 1 and max_marks-1).\n"
        "5. Accept synonyms, paraphrases, and equivalent expressions.\n"
        "6. If the answer has MINOR SPELLING ERRORS but the concept is clearly correct (e.g., Jupitar for Jupiter), award full marks. Do not penalize phonetic misspellings of correct answers.\n"
        "7. If the student gives a WRONG answer with correct-sounding reasoning, still award 0 marks.\n\n"
        "IMPORTANT: The is_correct field must be TRUE only if marks_awarded is more than half of max_marks. Otherwise it must be FALSE.\n\n"
        "Respond with ONLY a valid JSON object, nothing else:\n"
        "{\n"
        "  \"marks_awarded\": <number 0-" + str(max_m) + ">,\n"
        "  \"max_marks\": " + str(max_m) + ",\n"
        "  \"is_correct\": <true if marks > half of " + str(max_m) + " else false>,\n"
        "  \"reasoning\": \"<one sentence explaining why this grade was given>\",\n"
        "  \"confidence\": <number between 0.0 and 1.0>\n"
        "}"
    )
    return [
        {"role": "system", "content": system_msg},
        {"role": "user", "content": user_msg},
    ]

def parse_json_response(text):
    text = text.strip()
    # Strip everything before the LAST occurrence of any JSON-like content
    # Qwen3.5 outputs CoT thinking then the actual JSON response
    # The actual response JSON is the LAST { ... } block in the output
    # Find ALL potential JSON objects and try them in reverse order
    candidates = []
    depth = 0
    start = -1
    in_str = False
    esc = False
    for i, ch in enumerate(text):
        if esc:
            esc = False
            continue
        if ch == chr(92):
            esc = True
            continue
        if ch == chr(34):
            in_str = not in_str
            continue
        if in_str:
            continue
        if ch == chr(123):
            if depth == 0:
                start = i
            depth += 1
        elif ch == chr(125):
            depth -= 1
            if depth == 0 and start >= 0:
                candidates.append(text[start:i+1])
    # Try candidates in reverse order (last one is most likely the actual response)
    for cand in reversed(candidates):
        try:
            return json.loads(cand)
        except json.JSONDecodeError:
            pass
        try:
            result = ast.literal_eval(cand)
            if isinstance(result, dict):
                return result
        except (ValueError, SyntaxError):
            pass
        try:
            return json.loads(cand.replace(chr(39), chr(34)))
        except json.JSONDecodeError:
            pass
    raise ValueError('Could not parse response: ' + text[:200])


@app.post('/grade')
def grade(req: GradingRequest):
    req_log = {
        'question': req.question,
        'expected_answer': req.expected_answer,
        'student_answer': req.student_answer if req.student_answer and req.student_answer.strip() else '(blank)',
        'max_marks': req.max_marks,
    }
    logger.info('=== INCOMING REQUEST ===')
    logger.info('Question: %s', req.question)
    logger.info('Expected: %s', req.expected_answer)
    logger.info('Student: %s', req_log['student_answer'])
    logger.info('Max marks: %d', req.max_marks)

    if is_blank(req.student_answer):
        result = {'marks_awarded': 0, 'max_marks': req.max_marks, 'is_correct': False, 'reasoning': 'No answer provided', 'confidence': 1.0}
        logger.info('=== INSTANT GUARD: blank answer ===')
        logger.info('Result: %s', json.dumps(result))
        return result
    if is_no_attempt(req.student_answer):
        result = {'marks_awarded': 0, 'max_marks': req.max_marks, 'is_correct': False, 'reasoning': 'Student indicated they do not know', 'confidence': 1.0}
        logger.info('=== INSTANT GUARD: no attempt ===')
        logger.info('Result: %s', json.dumps(result))
        return result

    messages = build_messages(req)
    result = llm.create_chat_completion(
        messages=messages,
        max_tokens=1536,
        temperature=0.1,
    )
    raw = result['choices'][0]['message']['content']
    logger.info('=== MODEL RAW RESPONSE (first 1000 chars) ===')
    logger.info(raw[:1000])
    if not raw.strip():
        logger.error('Model returned empty response')
        raise ValueError('Model returned empty response')

    parsed = parse_json_response(raw)
    logger.info('=== PARSED JSON RESPONSE ===')
    logger.info('marks_awarded: %s', parsed.get('marks_awarded'))
    logger.info('max_marks: %s', parsed.get('max_marks'))
    logger.info('is_correct: %s', parsed.get('is_correct'))
    logger.info('confidence: %s', parsed.get('confidence'))
    logger.info('reasoning: %s', parsed.get('reasoning'))
    logger.info('============================')
    return parsed


@app.get('/health')
def health():
    return {'status': 'ok', 'model': 'qwen3.5-2b'}
