#!/usr/bin/env python3
"""Mark garbled MCQs as DRAFT - empty text, merged multi-part, missing formulas."""

import json, os, re

EXEMPLAR_DIR = 'doc/Exemplar'

def is_garbled(q):
    text = (q.get('question_text', '') or '').strip()
    if len(text) < 3:
        return True
    if text in ['(i) →', '(iii), boiling point of', '(ii), boiling point of',
                '(iii) Justification : Same bonds are formed in reaction']:
        return True
    if 'C1 C2' in text or 'C1\nC2' in text:
        return True
    if re.match(r'^(If y = ,|If f \(x\) = ,|If f \( x \) = for|If y = , then at)', text):
        return True
    if re.match(r'^If f \(x\) = 1 \+ x \+ \+', text):
        return True
    if 'Find C1 C2' in text:
        return True
    if 'Match each item given under the column C1' in text:
        return True
    if 'Match the proposed probability under Column C1' in text:
        return True
    if 'Match the following\n' in text and 'If E1 and E2' in text:
        return True
    if 'A = FeCr2O4 B =' in text:
        return True
    return False

total = 0
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
        if q.get('question_type') != 'MCQ':
            continue
        if q.get('answer_key'):
            continue
        if q.get('review_state') == 'DRAFT':
            continue
        if is_garbled(q):
            q['review_state'] = 'DRAFT'
            qa_flags = q.get('qa_flags', []) or []
            if 'garbled_text' not in qa_flags:
                qa_flags.append('garbled_text')
            q['qa_flags'] = qa_flags
            marked += 1
    if marked > 0:
        with open(path, 'w') as fp:
            json.dump(data, fp, indent=2)
            fp.write('\n')
        total += marked
        print(f'{f}: {marked} marked')

print(f'\nTotal: {total} marked as DRAFT')
