#!/usr/bin/env python3
"""
Mark exemplar questions that require figures as DRAFT.

These questions have Shaalaa.com image URLs in their options or question text,
meaning they are diagram-based and can't be displayed without proper figure extraction.

Usage:
    .venv/bin/python scripts/mark-figure-questions-draft.py
    .venv/bin/python scripts/mark-figure-questions-draft.py --dry-run
"""

import json
import os
import re
import sys

EXEMPLAR_DIR = 'doc/Exemplar'

# Pattern to detect Shaalaa image URLs
SHAALAA_IMAGE_PATTERN = re.compile(r'shaalaa\.com/images/', re.IGNORECASE)


def has_shaalaa_images(q):
    """Check if a question has Shaalaa image URLs in text or options."""
    text = q.get('question_text', '') or ''
    if SHAALAA_IMAGE_PATTERN.search(text):
        return True
    
    for opt in (q.get('options') or []):
        if SHAALAA_IMAGE_PATTERN.search(opt):
            return True
    
    return False


def clean_question_file(json_path, dry_run=False):
    """Mark figure-based questions as DRAFT."""
    if not os.path.exists(json_path):
        return 0
    
    with open(json_path) as f:
        data = json.load(f)
    
    if not isinstance(data, list):
        return 0
    
    marked = 0
    for q in data:
        if not isinstance(q, dict):
            continue
        if has_shaalaa_images(q):
            if not dry_run:
                q['review_state'] = 'DRAFT'
                qa_flags = q.get('qa_flags', []) or []
                if 'requires_figure' not in qa_flags:
                    qa_flags.append('requires_figure')
                q['qa_flags'] = qa_flags
            marked += 1
    
    if marked > 0 and not dry_run:
        with open(json_path, 'w') as f:
            json.dump(data, f, indent=2)
            f.write('\n')
    
    return marked


def main():
    args = sys.argv[1:]
    dry_run = '--dry-run' in args
    
    total_marked = 0
    files_affected = 0
    
    for f in sorted(os.listdir(EXEMPLAR_DIR)):
        if not f.endswith('.json') or 'all' in f or 'report' in f:
            continue
        
        path = os.path.join(EXEMPLAR_DIR, f)
        marked = clean_question_file(path, dry_run)
        
        if marked > 0:
            files_affected += 1
            total_marked += marked
            mode = '[DRY RUN] ' if dry_run else ''
            print(f'{mode}{f}: {marked} questions marked as DRAFT')
    
    print(f'\n{"=" * 60}')
    if dry_run:
        print(f'DRY RUN: {files_affected} files, {total_marked} questions would be marked as DRAFT')
    else:
        print(f'DONE: {files_affected} files, {total_marked} questions marked as DRAFT')
    print(f'{"=" * 60}')


if __name__ == '__main__':
    main()
