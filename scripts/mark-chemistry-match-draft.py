#!/usr/bin/env python3
"""
Mark Chemistry match-the-following MCQs as DRAFT.

These aren't real MCQs — they're matching exercises where multi-column content
got merged into option strings during PDF extraction.
"""

import json
import os
import re

EXEMPLAR_DIR = 'doc/Exemplar'


def is_match_question(q):
    """Check if question is a match-the-following type."""
    text = q.get('question_text', '').lower()
    if 'match' not in text:
        return False
    
    # Check if options contain multi-column matching content
    options = q.get('options', [])
    for opt in options:
        if re.search(r'(column|col)\s*[iIvVxX]*', opt, re.IGNORECASE):
            return True
        if re.search(r'(i)\s*(ii)\s*(iii)', opt):
            return True
    
    return False


def main():
    total_marked = 0
    files_affected = 0
    
    for f in sorted(os.listdir(EXEMPLAR_DIR)):
        if not f.endswith('.json') or 'all' in f or 'report' in f:
            continue
        
        # Only Chemistry files
        if 'chemistry' not in f:
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
            if q.get('question_type') != 'MCQ':
                continue
            if q.get('answer_key'):
                continue  # Already has answer
            
            if is_match_question(q):
                q['review_state'] = 'DRAFT'
                qa_flags = q.get('qa_flags', []) or []
                if 'match_the_following_not_mcq' not in qa_flags:
                    qa_flags.append('match_the_following_not_mcq')
                q['qa_flags'] = qa_flags
                marked += 1
        
        if marked > 0:
            with open(path, 'w') as fp:
                json.dump(data, fp, indent=2)
                fp.write('\n')
            files_affected += 1
            total_marked += marked
            print(f'{f}: {marked} marked as DRAFT')
    
    print(f'\nTotal: {files_affected} files, {total_marked} questions marked as DRAFT')


if __name__ == '__main__':
    main()
