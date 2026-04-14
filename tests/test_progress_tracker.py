# tests/test_progress_tracker.py
import pytest
import tempfile
import os
from scripts.progress_tracker import ProgressTracker, QuestionResult


def test_progress_tracker():
    # Load test config
    config = {
        "logging": {
            "success_csv": "logs/test_success_{date}.csv",
            "failure_csv": "logs/test_failure_{date}.csv",
        }
    }

    tracker = ProgressTracker(config)

    # Add various results
    tracker.add_success(
        "id1",
        {"class": 10, "subject": "Maths", "number": "1"},
        0.85,
        "https://example.com",
    )
    tracker.add_failure(
        "id2", {"class": 10, "subject": "Maths", "number": "2"}, "No URL found", ""
    )
    tracker.add_skipped(
        "id3", {"class": 9, "subject": "Science", "number": "1"}, "Already answered"
    )

    # Check counts
    assert len(tracker.results) == 3
    assert tracker.results[0].status == "success"
    assert tracker.results[1].status == "failed"
    assert tracker.results[2].status == "skipped"

    # Test saving results (would write to a temp location)
    # Note: This test assumes logs/ directory exists
    try:
        tracker.save_results()
        # If no exception, it worked
        assert True
    except Exception as e:
        pytest.fail(f"save_results raised: {e}")
