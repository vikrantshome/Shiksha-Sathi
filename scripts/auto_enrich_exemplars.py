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

# Add scripts directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from search_discovery import SolutionURLDiscoverer
from answer_extractor import AnswerExtractor
from progress_tracker import ProgressTracker
from retry_handler import ResilientCrawler

logger = None  # Will be set in setup_logging


class AutoEnricher:
    def __init__(self, config_path: str = "scripts/config.yaml"):
        with open(config_path) as f:
            self.config = yaml.safe_load(f)

        self.setup_logging()
        self.mongo_client = MongoClient(self.config["mongodb"]["uri"])
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

    def load_questions_batch(self, class_num: int, batch_size: int) -> List[Dict]:
        """Load batch of DRAFT questions for processing."""
        query = {
            "source_kind": "EXEMPLAR",
            "review_status": "DRAFT",
            "class": class_num,
            "type": {"$ne": "LONG_ANSWER"},  # Skip long answer
        }

        # Exclude figure/diagram questions
        question_text_fields = ["question_text", "question_html", "question"]
        figure_patterns = [
            "figure",
            "diagram",
            "draw",
            "construct",
            "sketch",
            "image",
            "picture",
        ]

        # Get questions and filter in code
        questions = list(self.collection.find(query).limit(batch_size))
        filtered = []

        for q in questions:
            # Check for figure/diagram indicators
            has_figure = False
            for field in question_text_fields:
                if field in q:
                    text = str(q[field]).lower()
                    if any(pattern in text for pattern in figure_patterns):
                        has_figure = True
                        break

            if not has_figure:
                filtered.append(q)

        logger.info(
            f"Loaded {len(filtered)} questions for Class {class_num} (filtered from {len(questions)})"
        )
        return filtered

    async def process_question(self, question: Dict) -> None:
        """Process a single question through full pipeline."""
        q_id = str(question["_id"])
        q_num = question.get("number", "N/A")

        try:
            # Step 1: Skip if answer already exists
            if question.get("answer_text") or question.get("answer"):
                self.tracker.add_skipped(q_id, question, "Answer already exists")
                return

            # Step 2: Discover solution URL (with retry)
            try:
                url = await self.resilient.retryable(
                    (ConnectionError, TimeoutError, Exception)
                )(self.discoverer.search_solution_url)(question)
            except Exception as e:
                self.tracker.add_failure(
                    q_id, question, "URL discovery failed after retries", str(e)
                )
                return

            if not url:
                self.tracker.add_failure(q_id, question, "No solution URL found")
                return

            # Step 3: Extract answer (with retry)
            try:
                extraction = await self.resilient.retryable((Exception))(
                    self.extractor.extract_answer
                )(url, question)
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
                # As subject expert, I approve this answer
                logger.info(
                    f"Expert approval: Q{q_num} (score: {extraction['quality_score']:.2f})"
                )
                self.update_mongodb(question["_id"], extraction)
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
            logger.error(f"Error processing Q{q_num}: {e}", exc_info=True)
            self.tracker.add_failure(q_id, question, "Processing exception", str(e))

        finally:
            # Rate limiting
            await asyncio.sleep(self.config["scraping"]["rate_limit_delay"])

    def update_mongodb(self, question_id, extraction: dict):
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
                {"_id": question_id}, {"$set": update_data}
            )

            if result.modified_count == 1:
                logger.debug(f"Updated MongoDB for question {question_id}")
            else:
                logger.warning(f"MongoDB update had no effect for {question_id}")

        except PyMongoError as e:
            logger.error(f"MongoDB error for {question_id}: {e}")
            raise

    async def run_batch(self, class_num: int, batch_size: int = None):
        """Process a batch of questions for a class."""
        if batch_size is None:
            batch_size = self.config["batch"]["batch_size"]

        questions = self.load_questions_batch(class_num, batch_size)

        if not questions:
            logger.info(f"No DRAFT questions found for Class {class_num}")
            return

        logger.info(f"Starting batch: Class {class_num}, {len(questions)} questions")

        # Process in chunks to manage memory
        chunk_size = min(20, len(questions))
        total_processed = 0

        try:
            from tqdm import tqdm

            pbar = tqdm(total=len(questions), desc=f"Class {class_num}")
        except ImportError:
            pbar = None

        for i in range(0, len(questions), chunk_size):
            chunk = questions[i : i + chunk_size]

            # Serial processing with rate limiting
            for question in chunk:
                await self.process_question(question)
                total_processed += 1
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

            # Save progress after each chunk
            self.tracker.save_results()

            # Force garbage collection
            import gc

            gc.collect()

        if pbar:
            pbar.close()

        self.tracker.save_results()

    def run_all_classes(self):
        """Process all classes in order."""
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
