#!/usr/bin/env python3
"""
NCERT Exemplar Solutions Web Scraper
  Scrapes answers from multiple solution sites and applies to MongoDB
"""

import json
import os
import re
import time
import difflib
from urllib.parse import quote, urljoin
import urllib.request
import urllib.error

MONGO_URI = os.environ.get(
    "MONGO_URI",
    "mongodb+srv://devteam2025:devteam2026@naviksha.g77okxs.mongodb.net/shikshasathi?appName=naviksha",
)

SOLUTION_SOURCES = [
    {
        "name": "mycbseguide",
        "base_url": "https://mycbseguide.com/",
        "search_pattern": "https://mycbseguide.com/products/ncert-exemplar-solutions-{class}-{subject}-chapter-{chapter}-exercise-{exercise}",
    },
    {
        "name": "jagranjosh",
        "base_url": "https://www.jagranjosh.com/articles/ncert-exemplar-solutions-",
        "search_pattern": "https://www.jagranjosh.com/ncert-exemplar-{subject}-class-{class}-chapter-{chapter}",
    },
    {
        "name": "vedantu",
        "base_url": "https://www.vedantu.com/",
        "search_pattern": "https://www.vedantu.com/ncert-solutions/{subject}-class-{class}-chapter-{chapter}",
    },
    {
        "name": "learncbse",
        "base_url": "https://www.learncbse.in/",
        "search_pattern": "https://www.learncbse.in/ncert-exemplar-{subject}-class-{class}-chapter-{chapter}",
    },
    {
        "name": "cbsetuts",
        "base_url": "https://www.cbsetuts.com/",
        "search_pattern": "https://www.cbsetuts.com/ncert-exemplar-problems-{subject}-class-{class}-chapter-{chapter}",
    },
]

HTML_ANSWER_PATTERN = re.compile(
    r'(?:answer|solution|ans)[:\s]*[A-D]["\s:]*([^<\n]+)', re.IGNORECASE
)
MCQ_ANSWER_PATTERN = re.compile(r"\b([A-D])\)[.\s]*([^\n(]+)", re.IGNORECASE)

RATE_LIMIT_DELAY = 1.5

SUBJECT_MAP = {
    "Mathematics": "mathematics",
    "Maths": "mathematics",
    "Science": "science",
    "Physics": "physics",
    "Chemistry": "chemistry",
    "Biology": "biology",
}

SKIP_PATTERNS = [
    r"figure",
    r"diagram",
    r"draw the",
    r"construct",
    r"sketch the",
    r"visualise",
    r"visualize",
    r"observe the figure",
    r"shown in figure",
]


def should_skip_question(text):
    """Check if question needs figure/sketch - should remain DRAFT"""
    text_lower = text.lower() if text else ""
    for pattern in SKIP_PATTERNS:
        if re.search(pattern, text_lower):
            return True
    return False


def clean_text(text):
    """Clean question text for matching"""
    if not text:
        return ""
    text = re.sub(r"[\uE000-\uF8FF]", "", text)
    text = re.sub(r"\s+", " ", text)
    text = text.strip()[:200]
    return text


def fetch_url(url, max_retries=3):
    """Fetch URL with rate limiting"""
    for attempt in range(max_retries):
        try:
            time.sleep(RATE_LIMIT_DELAY)
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                return response.read().decode("utf-8", errors="ignore")
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print(f"Rate limited, waiting {RATE_LIMIT_DELAY * 3}s...")
                time.sleep(RATE_LIMIT_DELAY * 3)
            else:
                print(f"HTTP error {e.code}: {url}")
                break
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            break
    return None


def extract_answer_from_html(html, q_text):
    """Extract answer from HTML using pattern matching"""
    if not html:
        return None

    q_clean = clean_text(q_text)
    if not q_clean:
        return None

    answers = []

    for match in MCQ_ANSWER_PATTERN.finditer(html):
        answers.append({"option": match.group(1), "text": match.group(2).strip()[:100]})

    if answers:
        return answers[0] if answers else None

    text_snippets = re.findall(r"<p[^>]*>([^<]+)</p>", html, re.I)
    for snippet in text_snippets[:20]:
        if len(snippet) > 3 and len(snippet) < 50:
            similarity = difflib.SequenceMatcher(
                None, q_clean[:50], snippet[:50]
            ).ratio()
            if similarity > 0.6:
                return snippet

    return None


def find_answer_in_sources(q_text, class_num, subject, chapter):
    """Try to find answer from all sources using defined search patterns"""
    subject_key = SUBJECT_MAP.get(subject, subject.lower())

    for source in SOLUTION_SOURCES:
        pattern = source.get("search_pattern")
        if not pattern:
            continue

        # Skip patterns requiring {exercise} which we don't have
        if "{exercise}" in pattern:
            continue

        try:
            # Use pattern with available placeholders; 'class' is a keyword so use dict unpacking
            search_url = pattern.format(
                **{"class": class_num, "subject": subject_key, "chapter": chapter}
            )
        except (KeyError, ValueError):
            # Skip pattern if formatting fails due to missing placeholders
            continue

        html = fetch_url(search_url)
        if html:
            answer = extract_answer_from_html(html, q_text)
            if answer:
                return answer, source["name"]

    return None, None


def process_draft_questions(class_filter=None, subject_filter=None, limit=50):
    """Process DRAFT questions and find answers"""
    print(
        f"Processing DRAFT questions: class={class_filter}, subject={subject_filter}, limit={limit}"
    )

    try:
        from pymongo import MongoClient

        client = MongoClient(MONGO_URI)
        db = client.get_default_database()
        questions = db.questions
    except:
        print("MongoDB not available, running in dry-run mode")
        db = None

    query = {
        "source_kind": "EXEMPLAR",
        "review_status": "DRAFT",
        "provenance.class": {"$exists": True},
    }

    if class_filter:
        query["provenance.class"] = class_filter
    if subject_filter:
        query["provenance.subject"] = subject_filter

    if db is None:
        print("MongoDB unavailable, showing query only")
        print(f"Query: {json.dumps(query, indent=2)}")
        return 0

    cursor = list(questions.find(query).limit(limit))
    processed = 0
    found = 0
    skipped = 0

    for q in cursor:
        q_id = q.get("question_id", "unknown")
        q_text = q.get("text", "")

        if should_skip_question(q_text):
            skipped += 1
            continue

        class_num = q.get("provenance", {}).get("class")
        subject = q.get("provenance", {}).get("subject")
        chapter = q.get("provenance", {}).get("chapterNumber")

        if not class_num or not subject:
            continue

        answer, source = find_answer_in_sources(q_text, class_num, subject, chapter)

        if answer:
            questions.update_one(
                {"_id": q["_id"]},
                {
                    "$set": {
                        "correct_answer": answer
                        if isinstance(answer, str)
                        else answer.get("text", "Answer found"),
                        "explanation": f"Answer from {source}",
                        "review_status": "PUBLISHED",
                    }
                },
            )
            found += 1
            answer_display = (
                answer
                if isinstance(answer, str)
                else answer.get("text", "Answer found")
            )
            print(f"✓ {q_id}: {answer_display[:30]} from {source}")
        else:
            questions.update_one(
                {"_id": q["_id"]}, {"$set": {"qa_flags": ["needs_manual_lookup"]}}
            )

        processed += 1

        if processed % 10 == 0:
            print(
                f"Progress: {processed}/{len(cursor)}, found: {found}, skipped: {skipped}"
            )

    print(f"\n=== Summary ===")
    print(f"Processed: {processed}")
    print(f"Found answers: {found}")
    print(f"Skipped (figure): {skipped}")
    print(f"Not found: {processed - found - skipped}")

    return found


if __name__ == "__main__":
    import sys

    class_filter = None
    subject_filter = None
    limit = 50

    for arg in sys.argv[1:]:
        if arg.startswith("--class="):
            class_filter = arg.split("=")[1]
        elif arg.startswith("--subject="):
            subject_filter = arg.split("=")[1]
        elif arg.isdigit():
            limit = int(arg)

    process_draft_questions(class_filter, subject_filter, limit)
