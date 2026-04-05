from llama_cpp import Llama
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import re
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Naviksha AI Agent")

logger.info("Loading Qwen3.5-4B GGUF Q4_K_M model...")
llm = Llama.from_pretrained(
    repo_id="bartowski/Qwen_Qwen3.5-4B-GGUF",
    filename="*Q4_K_M.gguf",
    n_ctx=4096,
    verbose=False,
    n_threads=2,
)
logger.info("Model loaded successfully.")


class GradingRequest(BaseModel):
    question: str
    expected_answer: str
    student_answer: str
    max_marks: int


def build_prompt(req):
    sa = req.student_answer.strip() if req.student_answer else ""
    display = sa if sa else "(blank)"
    lb = chr(123)
    rb = chr(125)
    json_schema = lb + '"marks_awarded": N, "max_marks": N, "is_correct": BOOL, "reasoning": "S", "confidence": F' + rb
    parts = []
    parts.append("You are an expert teacher grading student answers.")
    parts.append("Grade based on conceptual correctness, not keyword matching.")
    parts.append("")
    parts.append("Question: " + req.question)
    parts.append("Expected Answer: " + req.expected_answer)
    parts.append("Student Answer: " + display)
    parts.append("Maximum Marks: " + str(req.max_marks))
    parts.append("")
    parts.append("Grading Rules:")
    parts.append("- Full marks: conceptually correct (exact wording not required)")
    parts.append("- Partial marks: mentions relevant concepts or partial understanding")
    parts.append("- Zero marks: irrelevant, incorrect, or blank")
    parts.append("- Accept synonyms, paraphrases, equivalent expressions")
    parts.append("- Be generous with minor spelling errors if concept is clear")
    parts.append("- If student answer is blank, award 0 marks")
    parts.append("")
    parts.append("Respond ONLY with valid JSON:")
    parts.append(json_schema)
    return chr(10).join(parts)


def parse_json_response(text):
    text = text.strip()
    m = re.search(r'```json\s*([\s\S]*?)```', text)
    if m:
        text = m.group(1).strip()
    start = text.find('{')
    end = text.rfind('}')
    if start >= 0 and end > start:
        text = text[start:end+1]
    return json.loads(text)


@app.post("/grade")
def grade(req: GradingRequest):
    try:
        prompt = build_prompt(req)
        result = llm(prompt, max_tokens=256, temperature=0.1)
        raw = result["choices"][0]["text"]
        parsed = parse_json_response(raw)
        return parsed
    except Exception as e:
        logger.exception("Grading error")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return dict(status="ok", model="Qwen3.5-4B-Q4_K_M")
