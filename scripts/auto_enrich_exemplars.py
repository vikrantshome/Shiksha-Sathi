#!/usr/bin/env python3
# scripts/auto_enrich_exemplars.py
import asyncio
import logging
import sys
import os
import yaml
from datetime import datetime
from typing import List, Dict
from pymongo import MongoClient
from pymongo.errors import PyMongoError

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from search_discovery import SolutionURLDiscoverer
from answer_extractor import AnswerExtractor
from progress_tracker import ProgressTracker
from retry_handler import ResilientCrawler

logger = None


class AutoEnricher:
    def __init__(self, config_path: str = "scripts/config.yaml"):
        with open(config_path) as f:
            self.config = yaml.safe_load(f)

        # Use MONGODB_URI from environment if available, else config
        mongodb_uri = os.environ.get("MONGODB_URI", self.config["mongodb"]["uri"])
        if not mongodb_uri:
            raise ValueError("MONGODB_URI must be set in environment or config")

        self.setup_logging()
        self.mongo_client = MongoClient(mongodb_uri)
        self.db = self.mongo_client[self.config["mongodb"]["database"]]
        self.collection = self.db[self.config["mongodb"]["collection"]]

        self.discoverer = SolutionURLDiscoverer(config_path)
        self.extractor = AnswerExtractor(config_path)
        self.tracker = ProgressTracker(self.config)
        self.resilient = ResilientCrawler(max_attempts=3)

        logger.info("Auto Enricher initialized")

    def setup_logging(self):
        logging.basicConfig(
            level=getattr(logging, self.config["logging"]["level"]),
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            handlers=[
                logging.FileHandler(
                    f"logs/auto-enrich-{datetime.now().strftime('%Y%m%d')}.log"
                ),
                logging.StreamHandler(),
            ],
        )
        global logger
        logger = logging.getLogger(__name__)

    def load_questions_batch(
        self, class_num: int = None, batch_size: int = None
    ) -> List[Dict]:
        """Load batch of DRAFT EXEMPLAR questions for processing.

        Args:
            class_num: Optional specific class to load (if None, loads all classes in order)
            batch_size: Max number of questions to load
        """
        if batch_size is None:
            batch_size = self.config["batch"]["batch_size"]

        # Build query - using provenance.class (stored as string)
        query = {"source_kind": "EXEMPLAR", "review_status": "DRAFT"}

        if class_num is not None:
            query["provenance.class"] = str(class_num)

        # Exclude LONG_ANSWER type questions
        query["type"] = {"$ne": "LONG_ANSWER"}

        # Get questions and filter out figure/diagram questions
        questions = list(self.collection.find(query).limit(batch_size))
        filtered = []
        figure_patterns = [
            "figure",
            "diagram",
            "draw",
            "construct",
            "sketch",
            "image",
            "picture",
        ]

        for q in questions:
            # Check question text for figure references
            text = str(q.get("text", "")).lower()
            if any(pattern in text for pattern in figure_patterns):
                logger.info(f"Skipping Q{q.get('_id')} - contains figure reference")
                continue

            # Also check question_html if present
            if "question_html" in q:
                html_text = str(q["question_html"]).lower()
                if any(pattern in html_text for pattern in figure_patterns):
                    logger.info(
                        f"Skipping Q{q.get('_id')} - contains figure reference in HTML"
                    )
                    continue

            filtered.append(q)

        logger.info(
            f"Loaded {len(filtered)} questions for processing"
            + (f" (Class {class_num})" if class_num else "")
            + f" (filtered from {len(questions)})"
        )
        return filtered

    def extract_question_metadata(self, question: Dict) -> Dict:
        """Extract searchable metadata from question document."""
        # Parse question_id
        question_id = question.get("question_id", "")
        parse_result = self.discoverer.parse_question_id(question_id)

        if not parse_result:
            # Fallback: extract from provenance directly
            provenance = question.get("provenance", {})
            parse_result = {
                "class": provenance.get("class", ""),
                "subject": provenance.get("subject", ""),
                "chapter": provenance.get("chapterNumber", ""),
                "number": "",  # Will be extracted from question_id or set to empty
                "chapter_title": provenance.get("chapterTitle", ""),
            }

        # If we still don't have a question number, try to extract from question_id
        if not parse_result.get("number"):
            # Try pattern: Q followed by digits
            match = re.search(r"Q(\d+)", question_id)
            if match:
                parse_result["number"] = match.group(1)

        # Add question text
        parse_result["text"] = question.get("text", "")
        parse_result["question_id"] = question_id

        return parse_result

    async def process_question(self, question: Dict) -> None:
        """Process a single question through full pipeline."""
        q_id = str(question["_id"])
        q_metadata = self.extract_question_metadata(question)
        q_num = q_metadata.get("number", "N/A")
        q_class = q_metadata.get("class", "N/A")

        try:
            # Step 1: Skip if answer already exists
            if question.get("answer_text"):
                self.tracker.add_skipped(q_id, question, "Answer already exists")
                return

            # Step 2: Discover solution URL (synchronous)
            try:
                url = self.discoverer.search_solution_url(q_metadata)
            except Exception as e:
                self.tracker.add_failure(q_id, question, "URL discovery failed", str(e))
                return

            if not url:
                self.tracker.add_failure(q_id, question, "No solution URL found")
                return

            # Step 3: Extract answer (with retry for async crawl4ai)
            try:
                extraction = await self.resilient.retryable((Exception,))(
                    self.extractor.extract_answer
                )(url, q_metadata)
            except Exception as e:
                self.tracker.add_failure(
                    q_id, question, "Answer extraction failed after retries", str(e)
                )
                return

            if not extraction:
                self.tracker.add_failure(q_id, question, "Answer extraction failed", "")
                return

            if not extraction["is_acceptable"]:
                self.tracker.add_failure(
                    q_id,
                    question,
                    f"Quality check failed: {'; '.join(extraction['issues'])}",
                    f"Score: {extraction['quality_score']:.2f}",
                )
                return

            # Step 4: Subject expert evaluation - auto-approve if quality >= 0.7
            if extraction["quality_score"] >= 0.7:
                logger.info(
                    f"Expert approval: Class {q_class} Q{q_num} (score: {extraction['quality_score']:.2f})"
                )
                self.update_mongodb(question, extraction)
                self.tracker.add_success(
                    q_id, question, extraction["quality_score"], url
                )
            else:
                self.tracker.add_failure(
                    q_id,
                    question,
                    f"Below quality threshold: {extraction['quality_score']:.2f}",
                    f"Issues: {'; '.join(extraction['issues'])}",
                )

        except Exception as e:
            logger.error(
                f"Error processing Q{q_id} (Class {q_class}): {e}", exc_info=True
            )
            self.tracker.add_failure(q_id, question, "Processing exception", str(e))

        finally:
            # Rate limiting
            await asyncio.sleep(self.config["scraping"]["rate_limit_delay"])

    def update_mongodb(self, question: Dict, extraction: dict):
        """Update MongoDB with answer and mark as PUBLISHED."""
        update_data = {
            "answer_text": extraction["answer_text"],
            "answer_source": extraction["source_url"],
            "review_status": "PUBLISHED",
            "reviewed_by": "auto-enricher",
            "reviewed_at": datetime.utcnow(),
            "quality_score": extraction["quality_score"],
        }

        try:
            result = self.collection.update_one(
                {"_id": question["_id"]}, {"$set": update_data}
            )

            if result.modified_count == 1:
                logger.debug(
                    f"Updated MongoDB for question {question.get('question_id')}"
                )
            else:
                logger.warning(
                    f"MongoDB update had no effect for {question.get('_id')}"
                )

        except PyMongoError as e:
            logger.error(f"MongoDB error for {question.get('_id')}: {e}")
            raise

    async def run_batch(self, class_num: int = None, batch_size: int = None):
        """Process a batch of questions.

        Args:
            class_num: Specific class to process (if None, uses configured class_order)
            batch_size: Number of questions to process
        """
        if batch_size is None:
            batch_size = self.config["batch"]["batch_size"]

        questions = self.load_questions_batch(class_num, batch_size)

        if not questions:
            logger.info(
                f"No DRAFT questions found"
                + (f" for Class {class_num}" if class_num else "")
            )
            return

        logger.info(
            f"Starting batch: {len(questions)} questions"
            + (f" (Class {class_num})" if class_num else "")
        )

        try:
            from tqdm import tqdm

            pbar = tqdm(
                total=len(questions),
                desc=f"Class {class_num}" if class_num else "Batch",
            )
        except ImportError:
            pbar = None

        # Process serially with rate limiting
        for i, question in enumerate(questions):
            await self.process_question(question)
            if pbar:
                pbar.update(1)
                pbar.set_postfix(
                    {
                        "success": sum(
                            1 for r in self.tracker.results if r.status == "success"
                        ),
                        "failed": sum(
                            1 for r in self.tracker.results if r.status == "failed"
                        ),
                    }
                )

        if pbar:
            pbar.close()

        self.tracker.save_results()

    def run_all_classes(self):
        """Process all classes in configured order."""
        class_order = self.config["batch"]["class_order"]

        for class_num in class_order:
            logger.info(f"Processing Class {class_num}")
            try:
                asyncio.run(self.run_batch(class_num))
            except Exception as e:
                logger.error(f"Batch failed for Class {class_num}: {e}")
                continue

        self.mongo_client.close()
        logger.info("All batches completed")


def main():
    import sys

    class_nums = None
    if len(sys.argv) > 1:
        class_nums = [int(arg) for arg in sys.argv[1:]]

    enricher = AutoEnricher()

    if class_nums:
        for class_num in class_nums:
            enricher.run_batch(class_num)
    else:
        enricher.run_all_classes()


if __name__ == "__main__":
    main()
