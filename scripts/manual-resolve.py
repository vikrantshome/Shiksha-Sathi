#!/usr/bin/env python3
"""
Quick and dirty: Manual resolution using Google search + crawl4ai.
No SERPAPI. Just direct Google search and find working URLs.
"""

import os
import re
import asyncio
from datetime import datetime
from pymongo import MongoClient
from crawl4ai import AsyncWebCrawler
import urllib.parse

MONGO_URI = os.environ.get(
    "MONGO_URI",
    "mongodb+srv://devteam2025:devteam2026@naviksha.g77okxs.mongodb.net/shikshasathi?appName=naviksha",
)

# Rate limiting between requests
RATE_DELAY = 2.0

# Sites we trust for solutions
TRUSTED_DOMAINS = [
    "cbsetuts.com",
    "byjus.com",
    "shaalaa.com",
    "learncbse.in",
    "topper.com",
]


class SimpleResolver:
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client.shikshasathi
        self.coll = self.db.questions

        # Statistics
        self.total = 0
        self.success = 0
        self.failed = 0
        self.skipped = 0

    def close(self):
        self.client.close()

    def get_draft_questions(self, class_num=None, batch_size=50):
        """Get DRAFT EXEMPLAR questions, optionally filtered by class."""
        query = {
            "source_kind": "EXEMPLAR",
            "review_status": "DRAFT",
            "type": {"$ne": "LONG_ANSWER"},
        }
        if class_num:
            query["provenance.class"] = str(class_num)

        # Exclude figure questions
        questions = list(self.coll.find(query).limit(batch_size))

        filtered = []
        for q in questions:
            text = str(q.get("text", "")).lower()
            if any(
                pattern in text
                for pattern in ["figure", "diagram", "draw", "construct", "sketch"]
            ):
                self.skipped += 1
                continue
            filtered.append(q)

        return filtered

    def extract_question_metadata(self, question):
        """Extract class, subject, chapter, q_num from question."""
        provenance = question.get("provenance", {})
        class_num = provenance.get("class", "")
        subject = provenance.get("subject", "")
        chapter = provenance.get("chapterNumber", "")
        chapter_title = provenance.get("chapterTitle", "")

        # Extract question number from question_id
        q_id = question.get("question_id", "")
        match = re.search(r"Q(\d+)$", q_id)
        q_num = match.group(1) if match else ""

        return {
            "class": class_num,
            "subject": subject,
            "chapter": chapter,
            "chapter_title": chapter_title,
            "number": q_num,
            "question_id": q_id,
            "text": question.get("text", ""),
        }

    async def google_search_and_resolve(self, metadata):
        """Search Google, find solution URL, extract answer."""
        # Build search query
        class_num = metadata["class"]
        subject = metadata["subject"]
        chapter = metadata["chapter"]
        q_num = metadata["number"]

        # Try multiple query formulations
        queries = [
            f"NCERT Exemplar Class {class_num} {subject} Chapter {chapter} Question {q_num} solution",
            f"NCERT Exemplar Class {class_num} {subject} Q{q_num} answer",
            f"byjus exemplar class {class_num} {subject} chapter {chapter} q{q_num}",
        ]

        for query in queries:
            google_url = f"https://www.google.com/search?q={urllib.parse.quote(query)}"

            try:
                async with AsyncWebCrawler() as crawler:
                    # Get Google results
                    result = await crawler.arun(url=google_url, timeout=15)
                    if not result.success:
                        continue

                    # Extract all links
                    links = re.findall(r'href="(https?://[^"]+)"', result.html)

                    # Filter for trusted domains
                    solution_urls = [
                        l
                        for l in links
                        if any(domain in l for domain in TRUSTED_DOMAINS)
                    ]

                    if not solution_urls:
                        continue

                    # Try first few URLs
                    for url in solution_urls[:3]:
                        # Clean up URL (remove tracking params)
                        url = url.split("?")[0].split("#")[0]

                        # Crawl solution page
                        sol_result = await crawler.arun(url=url, timeout=20)
                        if not sol_result.success:
                            continue

                        markdown = sol_result.markdown

                        # Extract answer using patterns
                        answer = self.extract_answer_from_text(markdown, metadata)

                        if answer and len(answer) > 100:
                            return {
                                "answer": answer,
                                "source_url": url,
                                "quality_score": 0.8,  # Assume decent if we got substantial text
                            }
            except Exception as e:
                print(f"  Search error: {e}")
                continue

        return None

    def extract_answer_from_text(self, markdown: str, metadata: dict) -> str:
        """Extract likely answer from page content."""
        # Remove the question text to avoid confusion
        question_text = metadata["text"]
        if question_text and len(question_text) > 20:
            clean_q = re.sub(r"[^\w\s]", "", question_text[:100]).lower()
            markdown = markdown.lower().replace(clean_q, "")

        # Try solution patterns
        patterns = [
            r"Solution[:\s]*([\s\S]*?)(?=\n\n\*\*|\n\n\s*\d+\.|$)",
            r"Answer[:\s]*([\s\S]*?)(?=\n\n\*\*|\n\n\s*\d+\.|$)",
            r"###\s*Solution\s*###\s*([\s\S]*?)(?=###|$)",
            r"<div[^>]*solution[^>]*>([\s\S]*?)</div>",
        ]

        for pattern in patterns:
            matches = re.findall(pattern, markdown, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                text = match.strip()
                if len(text) > 100 and self.looks_like_answer(text):
                    return text

        # Fallback: find substantial paragraphs
        paragraphs = [p.strip() for p in markdown.split("\n\n") if len(p.strip()) > 150]
        if paragraphs:
            # Return the longest substantial paragraph
            return max(paragraphs, key=len)

        return None

    def looks_like_answer(self, text: str) -> bool:
        """Quick heuristics to judge if text is an answer."""
        lower = text.lower()

        # Should have some solution indicators
        has_solution_word = any(
            kw in lower
            for kw in ["solution", "answer", "therefore", "hence", "ans", "step", "∴"]
        )

        # Math indicators
        has_math = any(x in text for x in ["=", "≈", "∈", "±", "×", "÷", "∫", "∑"])

        # Should not be just navigation/footer
        if any(
            x in lower
            for x in ["copyright", "privacy", "terms", "subscribe", "advertisement"]
        ):
            return False

        return has_solution_word or has_math or len(text) > 300

    async def resolve_question(self, question):
        """Resolve a single question."""
        q_id = str(question["_id"])
        metadata = self.extract_question_metadata(question)

        print(f"\n[{self.total + 1}] Processing: {metadata['question_id']}")
        print(
            f"  Class {metadata['class']} {metadata['subject']} Ch{metadata['chapter']} Q{metadata['number']}"
        )
        print(f"  Text: {metadata['text'][:60]}...")

        try:
            result = await self.google_search_and_resolve(metadata)

            if result:
                # Update MongoDB
                self.coll.update_one(
                    {"_id": question["_id"]},
                    {
                        "$set": {
                            "answer_text": result["answer"],
                            "answer_source": result["source_url"],
                            "review_status": "PUBLISHED",
                            "reviewed_by": "google-manual",
                            "reviewed_at": datetime.utcnow(),
                            "quality_score": result["quality_score"],
                        }
                    },
                )
                self.success += 1
                print(f"  ✓✓ RESOLVED! Source: {result['source_url']}")
                print(f"     Answer length: {len(result['answer'])} chars")
            else:
                self.failed += 1
                print(f"  ✗ No answer found")

        except Exception as e:
            self.failed += 1
            print(f"  ✗ Error: {e}")

        finally:
            self.total += 1
            await asyncio.sleep(RATE_DELAY)

    async def resolve_batch(self, class_num=None, batch_size=20):
        """Resolve a batch of questions."""
        print("=" * 60)
        print(f"STARTING RESOLUTION BATCH")
        if class_num:
            print(f"Class: {class_num}")
        print(f"Batch size: {batch_size}")
        print("=" * 60)

        questions = self.get_draft_questions(class_num, batch_size)
        print(f"Loaded {len(questions)} questions to resolve")

        if not questions:
            print("No questions to process")
            return

        for q in questions:
            await self.resolve_question(q)

        self.print_summary()

    def print_summary(self):
        print("\n" + "=" * 60)
        print("BATCH SUMMARY")
        print("=" * 60)
        print(f"Total processed: {self.total}")
        print(f"Successfully resolved: {self.success}")
        print(f"Failed: {self.failed}")
        print(f"Skipped (figures): {self.skipped}")
        if self.total > 0:
            print(f"Success rate: {self.success / self.total * 100:.1f}%")

        # Show current DB state
        total_draft = self.coll.count_documents(
            {"source_kind": "EXEMPLAR", "review_status": "DRAFT"}
        )
        total_pub = self.coll.count_documents(
            {"source_kind": "EXEMPLAR", "review_status": "PUBLISHED"}
        )
        print(f"\nDB state after this run:")
        print(f"  Still DRAFT: {total_draft}")
        print(f"  PUBLISHED: {total_pub}")


async def main():
    resolver = SimpleResolver()

    # Test with Class 10 first (small batch)
    print("\n>>> Starting with Class 10 Mathematics (pilot)")
    await resolver.resolve_batch(class_num=10, batch_size=5)  # Just 5 for pilot

    # If pilot successful, continue with more
    if resolver.success > 0:
        print("\n>>> Pilot successful! Continue with more Class 10?")
        more = input("Process remaining Class 10 questions? (y/n): ").strip().lower()
        if more == "y":
            await resolver.resolve_batch(class_num=10, batch_size=20)

    resolver.close()


if __name__ == "__main__":
    asyncio.run(main())
