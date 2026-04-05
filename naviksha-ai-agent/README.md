---
title: Naviksha AI Agent
emoji: 📝
colorFrom: blue
colorTo: indigo
sdk: docker
app_file: app.py
pinned: false
license: apache-2.0
---

# Naviksha AI Agent

Self-hosted AI agent using Qwen3.5-4B (GGUF Q4_K_M quantization) for conceptual evaluation of student answers.

## Endpoints

### POST /grade
Evaluates a student's answer against the expected answer.

**Request body:**
```json
{
  "question": "What is photosynthesis?",
  "expected_answer": "The process by which plants convert sunlight into energy",
  "student_answer": "Plants use sunlight to make food",
  "max_marks": 5
}
```

**Response:**
```json
{
  "marks_awarded": 4.0,
  "max_marks": 5,
  "is_correct": true,
  "reasoning": "The student correctly identifies that plants use sunlight to produce food/energy, capturing the core concept of photosynthesis.",
  "confidence": 0.92
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{"status": "ok", "model": "Qwen3.5-4B-Q4_K_M"}
```

## Model

- **Model:** Qwen3.5-4B by Alibaba/Qwen
- **Quantization:** Q4_K_M GGUF (2.87 GB)
- **Framework:** llama-cpp-python (CPU-optimized)
- **HF Space tier:** CPU Basic (2 vCPU, 16 GB RAM)

## Local Development

```bash
pip install -r requirements.txt
python app.py
```

Then visit `http://localhost:7860/docs` for the Swagger UI.
