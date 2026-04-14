# tests/test_search_discovery.py
import pytest
from scripts.search_discovery import SolutionURLDiscoverer


def test_generate_search_queries():
    discoverer = SolutionURLDiscoverer()
    question = {
        "class": 10,
        "subject": "Mathematics",
        "chapter": "Quadratic Equations",
        "number": "3",
        "question_text": "Solve the equation...",
    }
    queries = discoverer.generate_search_queries(question)

    assert len(queries) >= 3
    assert any("cbsetuts.com" in q for q in queries)
    assert any("exemplar" in q.lower() for q in queries)


def test_is_promising_url():
    discoverer = SolutionURLDiscoverer()
    question = {"class": 10, "subject": "Maths"}

    assert discoverer._is_promising_url(
        "https://cbsetuts.com/class-10-maths-exemplar-chapter1-q3-solution", question
    )
    assert not discoverer._is_promising_url("https://cbsetuts.com/index.php", question)
    assert not discoverer._is_promising_url(
        "https://othersite.com/class10", question
    )  # Missing class number
