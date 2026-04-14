# tests/test_answer_extractor.py
import pytest
from scripts.answer_extractor import AnswerExtractor


def test_evaluate_quality():
    extractor = AnswerExtractor()
    question = {"subject": "Mathematics"}

    # Good answer
    good_answer = "Solution: Step 1: Let x = ... Therefore, x = 5."
    score, issues = extractor._evaluate_quality(good_answer, question)
    assert score >= 0.7
    assert len(issues) == 0

    # Bad answer with diagram reference
    bad_answer = "See figure 1 for the solution."
    score, issues = extractor._evaluate_quality(bad_answer, question)
    assert score < 0.5
    assert any(
        "figure" in str(issue).lower() or "diagram" in str(issue).lower()
        for issue in issues
    )

    # Too short answer
    short_answer = "Answer: 42"
    score, issues = extractor._evaluate_quality(short_answer, question)
    assert len(issues) > 0


def test_is_valid_answer_fragment():
    extractor = AnswerExtractor()

    assert extractor._is_valid_answer_fragment(
        "Solution: Therefore, x = 5. Hence proved." * 5
    )
    assert not extractor._is_valid_answer_fragment("Too short")
