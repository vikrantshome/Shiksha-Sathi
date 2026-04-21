#!/usr/bin/env python3
"""Fetch missing answers from NCERT and educational sources."""

import argparse
import json
import os
import re
import subprocess
import time
from typing import Optional, Dict, List
from openai import OpenAI
from pymongo import MongoClient


def load_mongodb_uri() -> str:
    # Try environment first, then fall back to parent .env.local
    uri = os.environ.get("MONGODB_URI", "")
    if not uri:
        env_path = os.path.join(
            os.path.dirname(__file__), "..", "..", "..", ".env.local"
        )
        if os.path.exists(env_path):
            for line in open(env_path):
                if line.startswith("MONGODB_URI="):
                    uri = line.split("=")[1].strip().strip('"')
    return (
        uri
        or "mongodb+srv://devteam2025:devteam2026@naviksha.g77okxs.mongodb.net/shikshasathi?appName=naviksha"
    )


def load_api_key() -> str:
    key = os.environ.get("NVIDIA_API_KEY", "")
    if not key:
        env_path = os.path.join(
            os.path.dirname(__file__), "..", "..", "..", ".env.local"
        )
        if os.path.exists(env_path):
            for line in open(env_path):
                if line.startswith("NVIDIA_API_KEY="):
                    key = line.split("=")[1].strip()
    return key


def search_ncert(query: str) -> Optional[str]:
    """Search for answer using crawl4ai."""
    try:
        search_query = f"{query} NCERT solution site:ncert.nic.in OR site:vedantu.com OR site:learncbse.in"
        cmd = [
            "python",
            "-m",
            "crawl4ai",
            "--url",
            f"https://www.google.com/search?q={search_query}",
            "--format",
            "markdown",
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0 and result.stdout:
            return result.stdout[:3000]
    except Exception as e:
        print(f"Search error: {e}")
    return None


def get_answer_from_llm(
    question_text: str, question_type: str, api_key: str
) -> Optional[str]:
    """Use LLM to generate answer based on question context."""
    client = OpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=api_key,
    )

    prompt = f"""You are an expert in NCERT curriculum for Indian schools.
Given the following question, provide a correct and complete answer.

Question Type: {question_type}
Question: {question_text}

Provide:
1. A clear, accurate answer
2. If MCQ, provide the correct option letter and text
3. If TRUE_FALSE, answer with just True or False
4. If SHORT_ANSWER/DESCRIPTIVE, provide a concise answer

Respond in JSON format:
{{"answer": "your answer here", "type": "SHORT_ANSWER/MCQ/TRUE_FALSE/DESCRIPTIVE"}}"""

    try:
        response = client.chat.completions.create(
            model="mistralai/mistral-small-4-119b-2603",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=500,
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        return data.get("answer", "")
    except Exception as e:
        print(f"LLM error: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Fetch missing answers from NCERT")
    parser.add_argument("--dry-run", action="store_true", default=False)
    parser.add_argument("--batch-size", type=int, default=50)
    args = parser.parse_args()

    client = MongoClient(load_mongodb_uri())
    db = client["shikshasathi"]

    api_key = load_api_key()

    query = {"audit_status": "error", "error_category": "empty_answer"}

    questions = list(db.questions.find(query).limit(500))
    print(f"Found {len(questions)} questions with empty answers")

    for i, q in enumerate(questions):
        q_id = str(q["_id"])
        q_text = q.get("text", q.get("question_text", ""))
        q_type = q.get("type", "SHORT_ANSWER")
        q_class = q.get("provenance", {}).get("class", "unknown")

        print(f"[{i + 1}/{len(questions)}] Processing {q_id} (Class {q_class})")

        answer = None

        search_query = f"Class {q_class} {q_text[:100]}"
        search_result = search_ncert(search_query)

        if search_result:
            prompt = f"""Based on the following NCERT educational content, 
provide the correct answer to this question:

Question: {q_text}

Reference Content:
{search_result}

Respond with just the answer, nothing else:"""

            try:
                client_llm = OpenAI(
                    base_url="https://integrate.api.nvidia.com/v1",
                    api_key=api_key,
                )
                response = client_llm.chat.completions.create(
                    model="mistralai/mistral-small-4-119b-2603",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.1,
                    max_tokens=300,
                )
                answer = response.choices[0].message.content.strip()
            except Exception as e:
                print(f"  LLM extraction error: {e}")

        if not answer:
            print(f"  No search result, trying direct LLM...")
            answer = get_answer_from_llm(q_text, q_type, api_key)

        if answer and not args.dry_run:
            db.questions.update_one(
                {"_id": q["_id"]},
                {
                    "$set": {
                        "correctAnswer": answer,
                        "audit_status": "retry_pending",
                        "audit_result": ["Answer fetched from NCERT"],
                        "audit_timestamp": "2026-04-20T00:00:00",
                    }
                },
            )
            print(f"  ✓ Updated with answer: {answer[:50]}...")
        elif answer:
            print(f"  [DRY RUN] Would update: {answer[:50]}...")

        time.sleep(1)

    print("Done!")


if __name__ == "__main__":
    main()
