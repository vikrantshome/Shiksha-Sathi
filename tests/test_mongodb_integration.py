# tests/test_mongodb_integration.py
import pytest
from unittest.mock import MagicMock, patch
from scripts.auto_enrich_exemplars import AutoEnricher


def test_mongodb_update():
    with patch("pymongo.MongoClient") as mock_client:
        mock_collection = MagicMock()
        mock_db = MagicMock()
        mock_db.__getitem__.return_value = mock_collection
        mock_client.return_value.__getitem__.return_value = mock_db
        mock_collection.update_one.return_value.modified_count = 1

        enricher = AutoEnricher()
        enricher.collection = mock_collection

        question_id = "test123"
        extraction = {
            "answer_text": "Solution: x = 5",
            "source_url": "https://example.com",
            "quality_score": 0.9,
        }

        enricher.update_mongodb(question_id, extraction)

        mock_collection.update_one.assert_called_once()
        call_args = mock_collection.update_one.call_args[0]
        assert call_args[0] == {"_id": question_id}
        assert "answer_text" in call_args[1]["$set"]
        assert call_args[1]["$set"]["review_status"] == "PUBLISHED"
