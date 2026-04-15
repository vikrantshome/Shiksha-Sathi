# scripts/search_discovery.py
import logging
import re
from typing import List, Optional
from serpapi import GoogleSearch
import yaml
import os

logger = logging.getLogger(__name__)


class SolutionURLDiscoverer:
    def __init__(self, config_path: str = "scripts/config.yaml"):
        with open(config_path) as f:
            self.config = yaml.safe_load(f)

        # Allow SERPAPI_KEY from environment as fallback
        if not self.config.get("serpapi_key"):
            self.config["serpapi_key"] = os.environ.get("SERPAPI_KEY", "")

        # Site priorities based on previous testing
        self.working_sites = {
            "10": ["maths", "mathematics"],
            "9": ["maths", "science"],
            "7": ["maths", "science"],
            "6": ["maths"],
        }

    def parse_question_id(self, question_id: str) -> dict:
        """Parse question_id like 'NCERT-EXEMPLAR-M10-CH3-Q6' into components."""
        # Pattern: NCERT-EXEMPLAR-{subject}{class}-CH{chapter}-Q{number}
        pattern = r"NCERT-EXEMPLAR-([A-Z]+)(\d+)-CH(\d+)-Q(\d+)"
        match = re.match(pattern, question_id)
        if match:
            subject_code, class_num, chapter_num, q_num = match.groups()
            subject_map = {
                "M": "Mathematics",
                "S": "Science",
                "P": "Physics",
                "C": "Chemistry",
                "B": "Biology",
            }
            return {
                "subject": subject_map.get(subject_code, subject_code),
                "class": class_num,
                "chapter": chapter_num,
                "number": q_num,
            }
        # Fallback: return None if parsing fails
        logger.warning(f"Could not parse question_id: {question_id}")
        return None

    def generate_search_queries(self, question_data: dict) -> List[str]:
        """Generate multiple search queries for a question."""
        class_num = question_data.get("class", "")
        subject = question_data.get("subject", "").lower()
        chapter = question_data.get("chapter", "")
        q_num = question_data.get("number", "")

        # Also get chapter title if available
        chapter_title = question_data.get("chapter_title", "").lower()

        queries = []

        # Priority 1: Site-specific with chapter number and question number
        if class_num in self.working_sites:
            for site_match in self.working_sites[class_num]:
                queries.append(
                    f"site:cbsetuts.com {class_num} {subject} exemplar chapter {chapter} question {q_num} solution"
                )

        # Priority 2: Broader search with NCERT keywords
        queries.extend(
            [
                f"NCERT Exemplar Class {class_num} {subject} Chapter {chapter} Q{q_num} solution",
                f"NCERT Exemplar solutions Class {class_num} {subject} Question {q_num}",
                f"cbsetuts exemplar class {class_num} {subject} ch{chapter} q{q_num} answer",
            ]
        )

        # If we have chapter title, include it
        if chapter_title and len(chapter_title) > 3:
            clean_title = re.sub(r"[^\w\s]", "", chapter_title)[:30]
            queries.append(
                f"NCERT Exemplar Class {class_num} {subject} {clean_title} Q{q_num} solution"
            )

        return queries

    def search_solution_url(self, question_data: dict) -> Optional[str]:
        """Find working solution URL via Google search."""
        # First, try direct cbsetuts URL construction (fast, no API cost)
        direct_url = self._try_direct_url(question_data)
        if direct_url:
            logger.info(f"Direct URL works: {direct_url}")
            return direct_url

        # If direct fails, try Google search if SERPAPI_KEY configured
        queries = self.generate_search_queries(question_data)
        serpapi_key = self.config.get("serpapi_key")

        if not serpapi_key:
            logger.warning("No SERPAPI_KEY configured, cannot search for solutions")
            return None

        for query in queries:
            try:
                logger.info(f"Searching: {query}")
                params = {
                    "engine": "google",
                    "q": query,
                    "num": 10,
                    "api_key": serpapi_key,
                }
                search = GoogleSearch(params)
                results = search.get_dict()

                if "organic_results" in results:
                    for result in results["organic_results"][:5]:
                        url = result.get("link", "")
                        if self._is_promising_url(url, question_data):
                            logger.info(f"Found promising URL: {url}")
                            return url
            except Exception as e:
                logger.warning(f"Search failed for query '{query}': {e}")
                continue

        logger.warning(f"No solution URL found for Q{question_data.get('number')}")
        return None

    def _try_direct_url(self, question_data: dict) -> Optional[str]:
        """Try constructing direct cbsetuts URL based on known patterns."""
        class_num = question_data.get("class", "")
        subject = question_data.get("subject", "").lower()
        chapter = question_data.get("chapter", "")
        q_num = question_data.get("number", "")

        # Only attempt for classes/subjects we know work on cbsetuts
        if class_num not in self.working_sites:
            return None

        # Check if subject matches working sites
        if not any(
            subject_pattern in subject
            for subject_pattern in self.working_sites[class_num]
        ):
            return None

        # Construct URL patterns that were known to work (based on previous discoveries)
        # Pattern: https://cbsetuts.com/class-10-maths-exemplar-chapter-3-question-6-solution/
        subject_slug = "maths" if "math" in subject else "science"
        url = f"https://cbsetuts.com/class-{class_num}-{subject_slug}-exemplar-chapter-{chapter}-question-{q_num}-solution/"

        # Could also try alternative patterns
        # For now, return None to skip direct attempts (since we know many 404)
        # This is a placeholder if we want to test direct URL approach
        return None

    def _is_promising_url(self, url: str, question_data: dict) -> bool:
        """Quick URL validation without crawling."""
        class_num = str(question_data.get("class", ""))
        subject = question_data.get("subject", "").lower()

        url_lower = url.lower()

        # Must have class number
        if class_num and class_num not in url_lower:
            return False

        # Must have subject indicator
        if subject and not any(
            s in url_lower for s in [subject, "exemplar", "solution"]
        ):
            return False

        # Must not be generic index
        if any(x in url_lower for x in ["/index", "category", "tag", "page"]):
            return False

        return True
