# scripts/answer_extractor.py
import logging
import re
from typing import Optional, Tuple
from crawl4ai import AsyncWebCrawler
import yaml

logger = logging.getLogger(__name__)


class AnswerExtractor:
    def __init__(self, config_path: str = "scripts/config.yaml"):
        with open(config_path) as f:
            self.config = yaml.safe_load(f)
        self.quality_config = self.config["quality"]

    async def extract_answer(self, url: str, question_data: dict) -> Optional[dict]:
        """Crawl URL and extract answer with quality evaluation."""
        try:
            async with AsyncWebCrawler() as crawler:
                result = await crawler.arun(
                    url=url, timeout=self.config["scraping"]["timeout"]
                )

                if not result.success:
                    logger.error(f"Crawl failed: {result.error}")
                    return None

                answer_text = self._extract_from_html(result.markdown, question_data)

                if not answer_text:
                    logger.warning(f"No answer extracted from {url}")
                    return None

                # Evaluate quality
                quality_score, issues = self._evaluate_quality(
                    answer_text, question_data
                )

                return {
                    "answer_text": answer_text,
                    "source_url": url,
                    "quality_score": quality_score,
                    "issues": issues,
                    "is_acceptable": quality_score >= 0.7 and len(issues) == 0,
                }

        except Exception as e:
            logger.error(f"Extraction error for {url}: {e}")
            return None

    def _extract_from_html(self, markdown: str, question_data: dict) -> Optional[str]:
        """Extract answer from crawled markdown."""
        text = markdown.lower()

        # Remove the original question text to avoid confusion
        question_clean = re.sub(
            r"[^\w\s]", "", question_data.get("text", "")[:100]
        ).lower()
        text = self._remove_question(text, question_clean)

        # Try structured extraction methods
        patterns = [
            r"solution[:\s]*([\s\S]*?)(?=\n\s*\d+\.|$)",
            r"answer[:\s]*([\s\S]*?)(?=\n\s*\d+\.|$)",
            r"∴\s*(.*?)(?=\n\n|$)",
            r"ans[.:]\s*(.*?)(?=\n\n|$)",
            r"step\s*\d+[:\s]*([\s\S]*?)(?=step\s*\d+|$)",
        ]

        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
            if matches:
                candidate = max(matches, key=len).strip()
                if self._is_valid_answer_fragment(candidate):
                    return self._clean_answer(candidate)

        # Fallback: Find largest paragraph after question number
        return self._fallback_extraction(text, question_data)

    def _remove_question(self, text: str, question_clean: str) -> str:
        """Remove the question text from the content."""
        if question_clean and len(question_clean) > 20:
            text = text.replace(question_clean, "")
        return text

    def _is_valid_answer_fragment(self, text: str) -> bool:
        """Check if extracted fragment looks like a real answer."""
        if len(text) < self.quality_config["min_answer_length"]:
            return False
        if len(text) > self.quality_config["max_answer_length"]:
            return False

        # Should contain at least one solution indicator
        has_solution_word = any(
            kw in text.lower() for kw in self.quality_config["required_keywords"]
        )
        has_math = any(x in text for x in ["=", "≈", "∈", "∝", "±", "×", "÷", "∫", "∑"])

        return has_solution_word or has_math or text.count("\n") >= 2

    def _clean_answer(self, text: str) -> str:
        """Clean and format the extracted answer."""
        # Remove excess whitespace
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r"[ \t]+", " ", text)
        return text.strip()

    def _fallback_extraction(self, text: str, question_data: dict) -> Optional[str]:
        """Fallback: Find substantial paragraphs that look like solutions."""
        paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 50]

        for para in paragraphs:
            para_lower = para.lower()
            # Skip if it contains forbidden patterns
            if any(
                pattern in para_lower
                for pattern in self.quality_config["forbidden_patterns"]
            ):
                continue
            # Skip if it's just "Answer:" or "Solution:"
            if len(para) < 100 and para_lower in ["answer", "solution", "ans", "∴"]:
                continue
            # Accept substantial paragraphs
            if len(para) > 200:
                return para

        return None

    def _evaluate_quality(
        self, answer_text: str, question_data: dict
    ) -> Tuple[float, list]:
        """Evaluate answer quality as subject expert."""
        issues = []
        score = 1.0

        # Check length
        if len(answer_text) < 30:
            issues.append("Answer too short")
            score -= 0.5

        # Check for figure/diagram references
        for pattern in self.quality_config["forbidden_patterns"]:
            if pattern in answer_text.lower():
                issues.append(f"Contains forbidden pattern: {pattern}")
                score -= 0.8

        # Check for solution indicators
        has_indicator = any(
            kw in answer_text.lower() for kw in self.quality_config["required_keywords"]
        )
        if not has_indicator:
            issues.append("Missing solution keywords")
            score -= 0.3

        # Subject-specific checks
        subject = question_data.get("subject", "").lower()
        if "math" in subject:
            # Math answers should have mathematical notation
            has_math = any(
                x in answer_text for x in ["=", "≈", "∈", "∝", "±", "×", "÷"]
            )
            if not has_math and len(answer_text) > 200:
                issues.append("Missing mathematical notation")
                score -= 0.2

        # Check for step-by-step structure
        if "\n\n" in answer_text and re.search(
            r"(?:step|i+\.|1+\.)", answer_text, re.IGNORECASE
        ):
            score += 0.1  # Bonus for structured steps

        # Should end with a conclusion
        if answer_text.strip()[-1] not in [".", "!", "?"]:
            issues.append("Answer doesn't end with proper punctuation")
            score -= 0.1

        return max(0.0, score), issues
