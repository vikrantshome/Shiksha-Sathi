#!/usr/bin/env python3
"""
Clean up exemplar MCQs that are actually answer keys (not real questions).

These got misclassified during PDF extraction. Example:
  question_text: "1. (ii) 2. (iii) 3. (iii) 4. (ii) 5. (iv)"

This script identifies such MCQs and changes them to SHORT_ANSWER with review_state: DRAFT
so they don't show up in the teacher-facing question bank.

Usage:
    .venv/bin/python scripts/clean-answer-key-misclassifications.py
    .venv/bin/python scripts/clean-answer-key-misclassifications.py --dry-run
"""

import json
import os
import re
import sys

EXEMPLAR_DIR = 'doc/Exemplar'

# Pattern to detect answer key text
# Examples: "1. (ii) 2. (iii) 3. (iii)", "1. (d) 2. (a) 3. (b)"
ANSWER_KEY_PATTERN = re.compile(
    r'^\s*(?:\d+\.\s*\([a-divx]+\)\s*){2,}',
    re.IGNORECASE
)


def is_answer_key(text):
    """Check if text looks like an answer key rather than a real question."""
    if not text or len(text) < 10:
        return False
    
    # Check if text is mostly answer key patterns
    answer_key_matches = len(re.findall(r'\d+\.\s*\([a-divx]+\)', text, re.IGNORECASE))
    total_words = len(text.split())
    
    # If more than 50% of words are answer key patterns, it's an answer key
    if answer_key_matches > 3 and answer_key_matches / max(total_words, 1) > 0.3:
        return True
    
    # Also check if the entire text matches answer key pattern
    if ANSWER_KEY_PATTERN.match(text):
        return True
    
    return False


def clean_question_file(json_path, dry_run=False):
    """Clean answer key misclassifications in a JSON file."""
    if not os.path.exists(json_path):
        return 0
    
    with open(json_path) as f:
        data = json.load(f)
    
    if not isinstance(data, list):
        return 0
    
    cleaned = 0
    for q in data:
        if not isinstance(q, dict):
            continue
        if q.get('question_type') != 'MCQ':
            continue
        
        text = q.get('question_text', '')
        if is_answer_key(text):
            if not dry_run:
                # Change to SHORT_ANSWER and mark as DRAFT
                q['question_type'] = 'SHORT_ANSWER'
                q['review_state'] = 'draft'
                q['qa_flags'] = (q.get('qa_flags') or []) + ['misclassified_as_mcq']
            cleaned += 1
    
    if cleaned > 0 and not dry_run:
        with open(json_path, 'w') as f:
            json.dump(data, f, indent=2)
            f.write('\n')
    
    return cleaned


def main():
    args = sys.argv[1:]
    dry_run = '--dry-run' in args
    
    total_cleaned = 0
    files_processed = 0
    
    for f in sorted(os.listdir(EXEMPLAR_DIR)):
        if not f.endswith('.json') or 'all' in f or 'report' in f:
            continue
        
        path = os.path.join(EXEMPLAR_DIR, f)
        cleaned = clean_question_file(path, dry_run)
        
        if cleaned > 0:
            files_processed += 1
            total_cleaned += cleaned
            mode = '[DRY RUN] ' if dry_run else ''
            print(f'{mode}{f}: {cleaned} answer keys fixed')
    
    print(f'\n{"=" * 60}')
    if dry_run:
        print(f'DRY RUN: {files_processed} files, {total_cleaned} answer keys would be fixed')
    else:
        print(f'DONE: {files_processed} files, {total_cleaned} answer keys fixed')
    print(f'{"=" * 60}')


if __name__ == '__main__':
    main()
