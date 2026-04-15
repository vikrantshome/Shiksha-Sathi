# scripts/progress_tracker.py
import csv
import logging
from datetime import datetime
from dataclasses import dataclass, asdict
from typing import List, Dict
import json
import re

logger = logging.getLogger(__name__)


@dataclass
class QuestionResult:
    id: str
    class_num: str
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

    def _extract_metadata(self, question: Dict) -> tuple:
        """Extract class, subject, question_number from question document."""
        # Get from provenance
        provenance = question.get("provenance", {})
        class_num = provenance.get("class", "")
        subject = provenance.get("subject", "")

        # Parse question number from question_id
        question_id = question.get("question_id", "")
        match = re.search(r"Q(\d+)", question_id)
        question_number = match.group(1) if match else ""

        return str(class_num), subject, question_number

    def add_success(
        self, question_id: str, q_data: Dict, quality_score: float, source_url: str
    ):
        class_num, subject, q_num = self._extract_metadata(q_data)

        result = QuestionResult(
            id=question_id,
            class_num=class_num,
            subject=subject,
            question_number=q_num,
            status="success",
            quality_score=quality_score,
            source_url=source_url,
        )
        self.results.append(result)
        logger.info(
            f"✓ Class {class_num} Q{q_num} enriched (score: {quality_score:.2f})"
        )

    def add_failure(self, question_id: str, q_data: Dict, reason: str, error: str = ""):
        class_num, subject, q_num = self._extract_metadata(q_data)

        result = QuestionResult(
            id=question_id,
            class_num=class_num,
            subject=subject,
            question_number=q_num,
            status="failed",
            issues=[reason],
            error=error,
        )
        self.results.append(result)
        logger.warning(f"✗ Class {class_num} Q{q_num} failed: {reason}")

    def add_skipped(self, question_id: str, q_data: Dict, reason: str):
        class_num, subject, q_num = self._extract_metadata(q_data)

        result = QuestionResult(
            id=question_id,
            class_num=class_num,
            subject=subject,
            question_number=q_num,
            status="skipped",
            issues=[reason],
        )
        self.results.append(result)
        logger.info(f"⊘ Class {class_num} Q{q_num} skipped: {reason}")

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
                    "issues",
                    "error",
                    "timestamp",
                ],
            )
            writer.writeheader()
            for r in self.results:
                row = asdict(r)
                row["issues"] = "; ".join(row["issues"]) if row["issues"] else ""
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
