# scripts/search_discovery.py
import logging
import re
from typing import List, Optional
from serpapi import GoogleSearch
import yaml

logger = logging.getLogger(__name__)


class SolutionURLDiscoverer:
    def __init__(self, config_path: str = "scripts/config.yaml"):
        with open(config_path) as f:
            self.config = yaml.safe_load(f)

        # Site priorities based on previous testing
        self.working_sites = {
            "10": ["maths", "mathematics"],
            "9": ["maths", "science"],
            "7": ["maths", "science"],
            "6": ["maths"],
        }

    def generate_search_queries(self, question_data: dict) -> List[str]:
        """Generate multiple search queries for a question."""
        class_num = str(question_data.get("class", ""))
        subject = question_data.get("subject", "").lower()
        chapter = question_data.get("chapter", "").lower()
        q_num = question_data.get("number", "")
        q_text = question_data.get("question_text", "")[:100]

        queries = []

        # Priority 1: Site-specific with chapter and question number
        if class_num in self.working_sites:
            for site_match in self.working_sites[class_num]:
                queries.append(
                    f"site:cbsetuts.com {class_num} {subject} exemplar {chapter} question {q_num} solution"
                )

        # Priority 2: Broader search with NCERT keywords
        queries.extend(
            [
                f"NCERT Exemplar Class {class_num} {subject} Chapter {chapter} Q{q_num} solution",
                f"NCERT Exemplar solutions Class {class_num} {subject} {q_num}",
                f"cbsetuts exemplar class {class_num} {subject} {q_num} answer",
            ]
        )

        # Fallback: Just question number + subject
        if q_text:
            clean_text = re.sub(r"[^\w\s]", "", q_text)[:50]
            queries.append(
                f"NCERT exemplar {class_num} {subject} {clean_text} solution"
            )

        return queries

    def search_solution_url(self, question_data: dict) -> Optional[str]:
        """Find working solution URL via Google search."""
        queries = self.generate_search_queries(question_data)

        for query in queries:
            try:
                logger.info(f"Searching: {query}")

                # Try SERPAPI if configured
                serpapi_key = self.config.get("serpapi_key")
                if serpapi_key:
                    params = {
                        "engine": "google",
                        "q": query,
                        "num": 10,
                        "api_key": serpapi_key,
                    }
                    search = GoogleSearch(params)
                    results = search.get_dict()
                else:
                    # Fallback: return None (would need requests implementation)
                    logger.warning("No SERPAPI_KEY configured, skipping search")
                    continue

                if "organic_results" in results:
                    for result in results["organic_results"][:5]:
                        url = result.get("link", "")
                        # Quick pre-filter: must contain class/subject indicators
                        if self._is_promising_url(url, question_data):
                            logger.info(f"Found promising URL: {url}")
                            return url

            except Exception as e:
                logger.warning(f"Search failed for query '{query}': {e}")
                continue

        logger.warning(f"No solution URL found for Q{question_data.get('number')}")
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
