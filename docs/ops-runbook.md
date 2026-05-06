# Ops Runbook: NCERT Exemplar Automated Enrichment

## Quick Start

1. **Ensure MongoDB is running**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or if using Atlas, update scripts/config.yaml with connection string
   ```

2. **Set SERPAPI_KEY** (required for Google search)
   ```bash
   export SERPAPI_KEY="your_key_here"
   # Or add to .env file and load
   ```

3. **Verify setup**
   ```bash
   python scripts/verify_setup.py
   ```

4. **Run pilot (Class 10 Maths)**
   ```bash
   python scripts/run_pilot.py
   ```

5. **If pilot successful, run full enrichment**
   ```bash
   python scripts/run_full.py
   ```
   Or run specific classes:
   ```bash
   python scripts/run_full.py 9 10 11 12
   ```

## Monitoring

- **Live logs**: `logs/auto-enrich-YYYYMMDD.log`
- **Results CSV**: `logs/successful_updates_YYYYMMDD.csv`
- **Detailed JSON**: `logs/detailed_results_YYYYMMDD.json`
- **Dashboard**: `python scripts/monitor.py`
- **Full report**: `python scripts/generate_report.py`

## Configuration

Edit `scripts/config.yaml` to adjust:
- `rate_limit_delay`: seconds between requests (default 2.5)
- `batch.batch_size`: questions per batch (default 50)
- `quality.min_answer_length`: minimum answer length (default 10)
- `quality.required_keywords`: keywords that indicate solution text
- `quality.forbidden_patterns`: patterns that exclude answers (figures, diagrams)

## Quality Thresholds

The system uses automatic subject expert evaluation:
- **Quality score >= 0.7**: Automatically approved and published
- **Quality score < 0.7**: Marked as failed, logged for manual review
- **Any forbidden pattern** (figure, diagram, draw, etc.): Automatically rejected

## Troubleshooting

### No search results
- Verify `SERPAPI_KEY` is set and valid
- Check internet connectivity
- Review logs for search errors

### Low success rate (< 50%)
- Adjust quality thresholds in config.yaml
- Examine sample answers using `python scripts/qa_check.py`
- Check that questions are not figure-dependent (excluded automatically)

### MongoDB connection refused
- Ensure MongoDB is running: `brew services start mongodb-community` (Mac)
- Or update connection string in config.yaml for Atlas/remote

### High failure rate due to extraction
- Review `logs/failed_questions_YYYYMMDD.csv` for specific issues
- Adjust answer extraction patterns in `answer_extractor.py`
- Consider adding site-specific extraction logic

## Rollback

To revert all automated updates (mark as DRAFT again):

```bash
mongosh "mongodb://localhost:27017/shikshasathi" --eval '
db.questions.updateMany(
  { 
    "review_status": "PUBLISHED", 
    "reviewed_by": "auto-enricher",
    "source_kind": "EXEMPLAR"
  },
  { 
    $set: { 
      "review_status": "DRAFT",
      "answer_text": null,
      "answer_source": null,
      "reviewed_by": null,
      "reviewed_at": null,
      "quality_score": null
    } 
  }
)
'
```

**Note**: This only reverts questions enriched by this system (identified by `reviewed_by: "auto-enricher"`).

## Performance Expectations

Based on testing:
- **Class 10 Maths**: ~21 questions, ~10-15 minutes (with rate limiting)
- **Full dataset**: ~1,522 eligible questions, estimated 8-12 hours
- **Success rate target**: 70-85% (remaining failures require manual solutioninding)

## Contact & Issues

Report issues with the enrichment system at: [repository]/issues

Include:
- Log file (`logs/auto-enrich-YYYYMMDD.log`)
- Sample question data
- Error messages
