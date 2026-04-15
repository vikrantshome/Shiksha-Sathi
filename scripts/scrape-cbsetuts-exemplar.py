#!/usr/bin/env python3
"""
NCERT Exemplar Scraper using cbsetuts.com chapter pages
Resolves DRAFT questions by scraping answers and marking them PUBLISHED.
"""

import json
import os
import re
import time
import logging
from urllib.parse import quote
import urllib.request
import urllib.error

from pymongo import MongoClient

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(f"logs/cbsetuts-scrape-{time.strftime('%Y%m%d')}.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)

MONGO_URI = os.environ.get(
    "MONGO_URI",
    "mongodb+srv://devteam2025:devteam2026@naviksha.g77okxs.mongodb.net/shikshasathi?appName=naviksha",
)

# Rate limiting - respect the site
RATE_LIMIT_DELAY = 2.0

# Subject name to slug mapping for cbsetuts URLs
SUBJECT_SLUGS = {
    "Mathematics": "maths",
    "Maths": "maths",
    "Science": "science",
    "Physics": "physics",
    "Chemistry": "chemistry",
    "Biology": "biology",
}

# Skip figure-dependent questions
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
    r"Fig\.",
    r"Figure",
]


def should_skip_question(text):
    """Determine if question requires figures/diagrams and should be skipped."""
    text_lower = text.lower() if text else ""
    for pattern in SKIP_PATTERNS:
        if re.search(pattern, text_lower, re.IGNORECASE):
            return True
    return False


def fetch_url(url, max_retries=3):
    """Fetch URL with rate limiting and retries"""
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
                time.sleep(RATE_LIMIT_DELAY * 3)
            else:
                print(f"HTTP error {e.code}: {url}")
                return None
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None
    return None


def get_chapter_slug_mapping(class_num, subject):
    """Fetch cbsetuts index page and extract chapter number -> slug mapping"""
    subject_slug = SUBJECT_SLUGS.get(subject, subject.lower())
    index_url = f"https://www.cbsetuts.com/ncert-exemplar-problems-class-{class_num}-{subject_slug}/"
    html = fetch_url(index_url)
    if not html:
        logger.error(f"Failed to fetch index: {index_url}")
        return {}

    # Parse HTML <a> tags to find chapter links
    # Pattern: <a href="https://www.cbsetuts.com/ncert-exemplar-problems-class-10-maths-real-numbers/">Chapter 1</a>
    mapping = {}

    # Find all href URLs that contain the class/subject path
    url_pattern = re.compile(
        r'href="(https://www\.cbsetuts\.com/ncert-exemplar-problems-class-{class_num}-{subject_slug}-[^"]+)"'.format(
            class_num=class_num, subject_slug=subject_slug
        )
    )
    urls = url_pattern.findall(html)

    for url in urls:
        # Extract slug from URL
        slug = url.rstrip("/").split("/")[-1]

        # Extract chapter number from the URL or nearby text
        # The slug often contains chapter topic, not number. We need to find the link text.
        # Look for the <a> tag with this href and capture its text
        link_pattern = re.compile(
            r'<a[^>]*href="' + re.escape(url) + r'"[^>]*>([^<]+)</a>'
        )
        text_match = link_pattern.search(html)
        if text_match:
            link_text = text_match.group(1).strip()
            # Look for "Chapter X" in the link text
            m = re.search(r"Chapter\s+(\d+)", link_text, re.IGNORECASE)
            if m:
                chap_num = int(m.group(1))
                mapping[chap_num] = slug
                continue

        # Fallback: Try to extract chapter number from slug itself (if numbered)
        m = re.search(r"chapter-(\d+)", slug, re.IGNORECASE)
        if m:
            chap_num = int(m.group(1))
            mapping[chap_num] = slug

    return mapping


def parse_chapter_page(html):
    """Parse chapter page HTML/markdown and return dict: question_number -> answer text"""
    qa_dict = {}

    # Try multiple patterns for robustness
    patterns = [
        # Pattern 1: **Question X:** ... **Solution:** ...
        r"\*\*Question\s+(\d+):\*\*(.+?)\*\*Solution:\*\*(.+?)(?=\*\*Question|\*\*Note|\Z)",
        # Pattern 2: Question X. ... Solution. ...
        r"Question\s+(\d+)\.(.+?)Solution\.(.+?)(?=Question|\Z)",
        # Pattern 3: **Q{number}:** ... **Ans:** ...
        r"\*\*Q(\d+):\*\*(.+?)\*\*Ans:\*\*(.+?)(?=\*\*Q|\*\*Note|\Z)",
    ]

    for pattern_str in patterns:
        pattern = re.compile(pattern_str, re.DOTALL | re.IGNORECASE)
        matches = list(pattern.finditer(html))
        if matches:
            logger.debug(f"Pattern matched {len(matches)} questions")
            for match in matches:
                q_num = int(match.group(1))
                # q_text = match.group(2).strip()  # not needed
                sol_text = match.group(3).strip()

                # Clean solution: remove markdown images, formatting
                sol_text = re.sub(r"!\[[^\]]*\]\([^\)]+\)", "", sol_text)
                sol_text = re.sub(r"\*\*([^\*]+)\*\*", r"\1", sol_text)
                sol_text = re.sub(r"__([^_]+)__", r"\1", sol_text)
                sol_text = re.sub(r"_([^_]+)_", r"\1", sol_text)
                sol_text = sol_text.replace("\n", " ").strip()

                # Skip very short answers (< 20 chars) - likely not real solutions
                if len(sol_text) < 20:
                    continue

                qa_dict[q_num] = sol_text
            break  # Use first pattern that matches

    return qa_dict


def main():
    client = MongoClient(MONGO_URI)
    db = client.get_default_database()
    questions = db.questions

    # Query all DRAFT EXEMPLAR questions
    # We'll filter later for LONG_ANSWER and figure questions
    query = {
        "source_kind": "EXEMPLAR",
        "review_status": "DRAFT",
        "provenance.class": {"$exists": True},
    }

    # Group by class and subject to see workload
    pipeline = [
        {"$match": query},
        {
            "$group": {
                "_id": {"class": "$provenance.class", "subject": "$provenance.subject"},
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id.class": 1, "_id.subject": 1}},
    ]
    combos = list(questions.aggregate(pipeline))

    logger.info(f"Found {len(combos)} class/subject combinations")
    for combo in combos:
        c = combo["_id"]["class"]
        s = combo["_id"]["subject"]
        logger.info(f"  Class {c}, Subject {s}: {combo['count']} questions")

    total_updated = 0
    total_skipped = 0
    total_failed = 0

    # Process each class/subject combo
    for combo in combos:
        class_num = combo["_id"]["class"]
        subject = combo["_id"]["subject"]
        subject_slug = SUBJECT_SLUGS.get(subject, subject.lower())

        logger.info(f"\n{'=' * 60}")
        logger.info(f"Processing Class {class_num} {subject}")
        logger.info(f"{'=' * 60}")

        # Get chapter mapping from cbsetuts index
        chapter_map = get_chapter_slug_mapping(class_num, subject)
        if not chapter_map:
            logger.warning(
                f"  No index mapping found - cbsetuts may not support this combo"
            )
            continue
        logger.info(f"  Found {len(chapter_map)} chapters in index")

        # Get distinct chapters with DRAFT questions for this combo
        chap_cursor = questions.distinct("provenance.chapterNumber", query)
        logger.info(f"  DRAFT chapters: {chap_cursor}")

        for chap in chap_cursor:
            if chap not in chapter_map:
                logger.warning(f"    Chapter {chap} not in index mapping - skipping")
                continue

            slug = chapter_map[chap]
            chapter_url = f"https://www.cbsetuts.com/ncert-exemplar-problems-class-{class_num}-{subject_slug}-{slug}/"
            logger.info(f"    Fetching chapter {chap}: {chapter_url}")

            html = fetch_url(chapter_url)
            if not html:
                logger.error(f"    Failed to fetch chapter page")
                total_failed += 1
                continue

            qa_dict = parse_chapter_page(html)
            logger.info(f"    Extracted {len(qa_dict)} Q&A pairs from chapter page")

            if not qa_dict:
                logger.warning(f"    No Q&A pairs extracted")
                continue

            # Get DRAFT questions for this specific class/subject/chapter
            q_query = {
                **query,
                "provenance.class": class_num,
                "provenance.subject": subject,
                "provenance.chapterNumber": chap,
                "type": {"$ne": "LONG_ANSWER"},  # Skip LONG_ANSWER
            }

            q_cursor = questions.find(q_query)
            chapter_updated = 0
            chapter_skipped = 0

            for q in q_cursor:
                q_id = q.get("question_id", "")
                q_text = q.get("text", "")

                # Skip if question requires figures
                if should_skip_question(q_text):
                    total_skipped += 1
                    chapter_skipped += 1
                    continue

                # Extract question number from ID
                m = re.search(r"Q(\d+)$", q_id, re.IGNORECASE)
                if not m:
                    logger.debug(f"    Could not parse question number from {q_id}")
                    continue
                q_num = int(m.group(1))

                if q_num in qa_dict:
                    answer = qa_dict[q_num]

                    # Additional quality check: answer should be substantial
                    if len(answer) < 30:
                        logger.debug(
                            f"    Q{q_num}: answer too short ({len(answer)} chars), skipping"
                        )
                        continue

                    # Update with answer_text field (new schema) and mark PUBLISHED
                    try:
                        questions.update_one(
                            {"_id": q["_id"]},
                            {
                                "$set": {
                                    "answer_text": answer,
                                    "answer_source": "cbsetuts.com",
                                    "review_status": "PUBLISHED",
                                    "reviewed_by": "cbsetuts-scraper",
                                    "reviewed_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
                                }
                            },
                        )
                        updated_count += 1
                        total_updated += 1
                        logger.info(f"    ✓ {q_id}: {answer[:60]}...")
                    except Exception as e:
                        logger.error(f"    Error updating {q_id}: {e}")
                        total_failed += 1
                else:
                    # No answer found for this question number
                    logger.debug(f"    Q{q_num}: no answer in scraped data")

            logger.info(
                f"    Chapter summary: {chapter_updated} updated, {chapter_skipped} skipped (figures)"
            )
            total_found += len(qa_dict)

    logger.info(f"\n{'=' * 60}")
    logger.info("FINAL SUMMARY")
    logger.info(f"{'=' * 60}")
    logger.info(f"Total class/subject combos processed: {len(combos)}")
    logger.info(f"Total answer pairs scraped: {total_found}")
    logger.info(f"Total questions updated: {total_updated}")
    logger.info(f"Total skipped (figure/diagram): {total_skipped}")
    logger.info(f"Total failed: {total_failed}")

    # Show current state
    still_draft = questions.count_documents(
        {"source_kind": "EXEMPLAR", "review_status": "DRAFT"}
    )
    now_published = questions.count_documents(
        {"source_kind": "EXEMPLAR", "review_status": "PUBLISHED"}
    )
    logger.info(f"\nAfter this run:")
    logger.info(f"  Still DRAFT: {still_draft}")
    logger.info(f"  PUBLISHED: {now_published}")

    client.close()


if __name__ == "__main__":
    main()
