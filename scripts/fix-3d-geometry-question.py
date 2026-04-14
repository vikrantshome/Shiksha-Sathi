#!/usr/bin/env python3
"""Fix garbled 3D Geometry question in Class 12 Math Ch11."""

import json, os

path = 'doc/Exemplar/12-mathematics-ch11.json'

with open(path) as f:
    data = json.load(f)

fixed = 0
for q in data:
    text = q.get('question_text', '')
    if 'plane 2x' in text and 'angle' in text and 'x-axis' in text:
        q['question_text'] = 'The plane 2x – 3y + 6z – 11 = 0 makes an angle sin⁻¹(α) with x-axis. The value of α is equal to'
        q['options'] = ['2/3', '3/2', '2/7', '3/7']
        q['answer_key'] = 'C'
        q['answer_explanation'] = 'Answer: 2/7 — Direction cosines of normal: (2/7, -3/7, 6/7). Angle between plane and x-axis: sin(φ) = |cos θ| = 2/7.'
        if q.get('review_state') == 'DRAFT':
            q['review_state'] = None
            qa_flags = q.get('qa_flags', []) or []
            q['qa_flags'] = [f for f in qa_flags if f != 'garbled_fraction_math']
        fixed += 1
        print(f'Fixed: {text[:60]}...')

with open(path, 'w') as f:
    json.dump(data, f, indent=2)
    f.write('\n')

print(f'Total fixed: {fixed}')
