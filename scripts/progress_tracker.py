# scripts/progress_tracker.py
import csv
import logging
from datetime import datetime
from dataclasses import dataclass, asdict
from typing import List, Dict
import json

logger = logging.getLogger(__name__)


@dataclass
class QuestionResult:
    id: str
    class_num: int
    subject: str
    question_number: str
    status: str  # 'success', 'failed', 'skipped'
    quality_score: float = 0.0
    issues: List[str] = None
    source_url: str = ""
    error: str = ""
    timestamp: str = ""

    def __post_init__(self):
        if self.timestamp == "":
            self.timestamp = datetime.now().isoformat()
        if self.issues is None:
            self.issues = []


class ProgressTracker:
    def __init__(self, config: dict):
        self.config = config
        self.results: List[QuestionResult] = []
        self.start_time = datetime.now()

    def add_success(
        self, question_id: str, q_data: dict, quality_score: float, source_url: str
    ):
        result = QuestionResult(
            id=question_id,
            class_num=q_data["class"],
            subject=q_data["subject"],
            question_number=q_data["number"],
            status="success",
            quality_score=quality_score,
            source_url=source_url,
        )
        self.results.append(result)
        logger.info(f"✓ Q{q_data['number']} enriched (score: {quality_score:.2f})")

    def add_failure(self, question_id: str, q_data: dict, reason: str, error: str = ""):
        result = QuestionResult(
            id=question_id,
            class_num=q_data["class"],
            subject=q_data["subject"],
            question_number=q_data["number"],
            status="failed",
            issues=[reason],
            error=error,
        )
        self.results.append(result)
        logger.warning(f"✗ Q{q_data['number']} failed: {reason}")

    def add_skipped(self, question_id: str, q_data: dict, reason: str):
        result = QuestionResult(
            id=question_id,
            class_num=q_data["class"],
            subject=q_data["subject"],
            question_number=q_data["number"],
            status="skipped",
            issues=[reason],
        )
        self.results.append(result)
        logger.info(f"⊘ Q{q_data['number']} skipped: {reason}")

    def save_results(self):
        """Save results to CSV and JSON logs."""
        date_str = datetime.now().strftime("%Y%m%d")

        # CSV for easy viewing
        csv_path = self.config["logging"]["success_csv"].format(date=date_str)
        with open(csv_path, "w", newline="") as f:
            writer = csv.DictWriter(
                f,
                fieldnames=[
                    "id",
                    "class_num",
                    "subject",
                    "question_number",
                    "status",
                    "quality_score",
                    "source_url",
                    "error",
                    "timestamp",
                ],
            )
            writer.writeheader()
            for r in self.results:
                row = asdict(r)
                row["issues"] = "; ".join(row["issues"])
                writer.writerow(row)

        # JSON for detailed analysis
        json_path = f"logs/detailed_results_{date_str}.json"
        with open(json_path, "w") as f:
            json.dump([asdict(r) for r in self.results], f, indent=2)

        # Summary
        total = len(self.results)
        successes = sum(1 for r in self.results if r.status == "success")
        failures = sum(1 for r in self.results if r.status == "failed")
        skipped = sum(1 for r in self.results if r.status == "skipped")

        logger.info(f"""
        ────────────────────────────────────────
        Processing Complete
        Total: {total} | Success: {successes} | Failed: {failures} | Skipped: {skipped}
        Success Rate: {successes / total * 100:.1f}% (if total > 0)
        Duration: {datetime.now() - self.start_time}
        ────────────────────────────────────────
        """)
