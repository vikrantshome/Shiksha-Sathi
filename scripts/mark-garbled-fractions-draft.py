#!/usr/bin/env python3
"""
Mark garbled fraction/math questions as DRAFT in exemplar JSON files.

These questions have mathematical fractions that pdftotext couldn't properly
extract from PDF layout.

Usage:
    .venv/bin/python scripts/mark-garbled-fractions-draft.py
"""

import json, os, re

EXEMPLAR_DIR = 'doc/Exemplar'

# Pattern to detect garbled fraction/math notation
GARBLED_PATTERN = re.compile(r'(\}.*\d|∫|∞|is__________.*\d)')


def is_garbled(text):
    if not text:
        return False
    return bool(GARBLED_PATTERN.search(text))


def main():
    total = 0
    files_affected = 0
    
    for f in sorted(os.listdir(EXEMPLAR_DIR)):
        if not f.endswith('.json') or 'all' in f or 'report' in f:
            continue
        
        path = os.path.join(EXEMPLAR_DIR, f)
        with open(path) as fp:
            data = json.load(fp)
        
        if not isinstance(data, list):
            continue
        
        marked = 0
        for q in data:
            if not isinstance(q, dict):
                continue
            if q.get('review_state') == 'DRAFT':
                continue
            
            text = q.get('question_text', '')
            if is_garbled(text):
                q['review_state'] = 'DRAFT'
                qa_flags = q.get('qa_flags', []) or []
                if 'garbled_fraction_math' not in qa_flags:
                    qa_flags.append('garbled_fraction_math')
                q['qa_flags'] = qa_flags
                marked += 1
        
        if marked > 0:
            with open(path, 'w') as fp:
                json.dump(data, fp, indent=2)
                fp.write('\n')
            files_affected += 1
            total += marked
            print(f'{f}: {marked} marked')
    
    print(f'\nTotal: {files_affected} files, {total} marked as DRAFT')


if __name__ == '__main__':
    main()
