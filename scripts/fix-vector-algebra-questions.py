#!/usr/bin/env python3
"""
Fix remaining garbled Vector Algebra questions and set answers.
"""

import json, os

EXEMPLAR_DIR = 'doc/Exemplar'
path = os.path.join(EXEMPLAR_DIR, '12-mathematics-ch10.json')

with open(path) as f:
    data = json.load(f)

# Fix specific garbled questions
FIXES = {
    'The formula (a + b ) 2 = a 2 + b 2 + 2a × b is valid for non-zero vectors a and b . ': {
        'text': 'The formula (a + b)² = a² + b² + 2a × b is valid for non-zero vectors a and b.',
        'answer_key': 'False',
        'answer_explanation': 'Answer: False — The correct formula is (a + b)² = a² + b² + 2a·b (dot product), not cross product.',
    },
    'The vector a + b bisects the angle between the non-collinear vectors a and b if ________ VECTOR ALGEBRA 219 ': {
        'text': 'The vector a + b bisects the angle between the non-collinear vectors a and b if |a| = |b|.',
        'answer_key': '|a| = |b|',
        'answer_explanation': 'Answer: |a| = |b| — The sum of two vectors bisects the angle between them only when they have equal magnitudes.',
    },
    'If r . a = 0, r . b = 0, and r . c = 0 for some non-zero vector r, then the value of a.(b × c) is ________ ': {
        'text': 'If r·a = 0, r·b = 0, and r·c = 0 for some non-zero vector r, then the value of a·(b × c) is ________. ',
        'answer_key': '0',
        'answer_explanation': 'Answer: 0 — If r is perpendicular to a, b, and c, then a, b, c are coplanar, so their scalar triple product is zero.',
    },
    'The vectors a = 3i − 2 j + 2kˆ and b = – ˆi − 2kˆ are the adjacent sides of a parallelogram. The acute angle between its diagonals is ________. 1': {
        'text': 'The vectors a = 3î − 2ĵ + 2k̂ and b = −î − 2k̂ are the adjacent sides of a parallelogram. The acute angle between its diagonals is ________. ',
        'answer_key': 'π/4',
        'answer_explanation': 'Answer: π/4 — The diagonals are a+b and a-b. Compute their angle.',
    },
    'The values of k for which ka < a and ka + a is parallel to a holds true 2 are _______. 2': {
        'text': 'The values of k for which |ka| < |a| and ka + a is parallel to a holds true are _______. ',
        'answer_key': '-1 < k < 1',
        'answer_explanation': 'Answer: -1 < k < 1 — |ka| < |a| implies |k| < 1, so -1 < k < 1.',
    },
    'The value of the expression a × b + (a . b ) 2 is _______. 2 2 ': {
        'text': 'The value of the expression |a × b|² + (a·b)² is _______.',
        'answer_key': '|a|²|b|²',
        'answer_explanation': 'Answer: |a|²|b|² — This is Lagrange\'s identity: |a×b|² + (a·b)² = |a|²|b|².',
    },
    'If a × b + a . b = 144 and a = 4 , then b is equal to _______. ( ) ( ) ': {
        'text': 'If |a × b|² + (a·b)² = 144 and |a| = 4, then |b| is equal to _______.',
        'answer_key': '3',
        'answer_explanation': 'Answer: 3 — |a×b|² + (a·b)² = |a|²|b|² = 144, so |b|² = 144/16 = 9, |b| = 3.',
    },
    'If a is any non-zero vector, then (a .iˆ) iˆ + a . ˆj ˆj + a . kˆ kˆ equals _______. State True or False in each of the following Exercises. ': {
        'text': 'If a is any non-zero vector, then (a·î)î + (a·ĵ)ĵ + (a·k̂)k̂ equals _______.',
        'answer_key': 'a',
        'answer_explanation': 'Answer: a — This is the resolution of a vector into its components.',
    },
    'Position vector of a point P is a vector whose initial point is origin. ': {
        'text': 'Position vector of a point P is a vector whose initial point is origin.',
        'answer_key': 'True',
        'answer_explanation': 'Answer: True — By definition, a position vector has its initial point at the origin.',
    },
    'If a + b = a − b , then the vectors a and b are orthogonal. ': {
        'text': 'If |a + b| = |a − b|, then the vectors a and b are orthogonal.',
        'answer_key': 'True',
        'answer_explanation': 'Answer: True — |a+b|² = |a-b|² implies 4a·b = 0, so a·b = 0.',
    },
    'If a and b are adjacent sides of a rhombus, then a . b = 0.': {
        'text': 'If a and b are adjacent sides of a rhombus, then a·b = 0.',
        'answer_key': 'False',
        'answer_explanation': 'Answer: False — Adjacent sides of a rhombus are not necessarily perpendicular (only for a square).',
    },
}

fixed = 0
for q in data:
    text = q.get('question_text', '')
    for garbled, fix in FIXES.items():
        if text.strip() == garbled.strip() or (garbled[:40] and text.startswith(garbled[:40])):
            q['question_text'] = fix['text']
            q['answer_key'] = fix['answer_key']
            q['answer_explanation'] = fix['answer_explanation']
            q['review_state'] = None
            qa_flags = q.get('qa_flags', []) or []
            q['qa_flags'] = [f for f in qa_flags if f != 'garbled_fraction_math']
            fixed += 1
            print(f'Fixed: {garbled[:50]}... → {fix["text"][:60]}...')
            break

with open(path, 'w') as f:
    json.dump(data, f, indent=2)
    f.write('\n')

print(f'\nTotal fixed: {fixed}')
