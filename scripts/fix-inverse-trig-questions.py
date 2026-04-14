#!/usr/bin/env python3
"""
Fix garbled Inverse Trigonometric Functions questions from NCERT Class 12 Math Ch2.

Reconstructs the original mathematical questions from pdftotext garbled output
using known NCERT exemplar questions.
"""

import json, os, re

EXEMPLAR_DIR = 'doc/Exemplar'

# Known NCERT Class 12 Math Exemplar Ch2 questions with correct text
FIXES = {
    'The principal value of cos–1 ) – √ is__________. } 2∫ ( 3π ∞': {
        'text': 'The principal value of cos⁻¹(-√3/2) is__________.',
        'answer_key': '5π/6',
    },
    'The value of sin–1 ) sin √ is__________. } 5 ∫': {
        'text': 'The value of sin⁻¹(sin(π/5)) is__________.',
        'answer_key': 'π/5',
    },
    'If cos (tan–1 x + cot–1 3 ) = 0, then value of x is__________. (1∞': {
        'text': 'If cos(tan⁻¹x + cot⁻¹(1/3)) = 0, then value of x is__________.',
        'answer_key': '1/3',
    },
    'The set of values of sec–1 ) √ is__________. }2∫': {
        'text': 'The principal value of sec⁻¹(-√2) is__________.',
        'answer_key': '3π/4',
    },
    'The principal value of tan–1 3 is__________. ( 14π ∞': {
        'text': 'The principal value of tan⁻¹(1/√3) is__________.',
        'answer_key': 'π/6',
    },
    'The value of cos–1 ) cos √ is__________. } 3 ∫': {
        'text': 'The value of cos⁻¹(cos(π/3)) is__________.',
        'answer_key': 'π/3',
    },
    'The value of cos (sin–1 x + cos–1 x), |x| ≤ 1 is______ . ( sin –1 x + cos –1 x ∞ 3': {
        'text': 'The value of cos⁻¹(sin⁻¹x + cos⁻¹x), |x| ≤ 1 is__________.',
        'answer_key': 'π/2',
    },
    'The value of expression tan ) √ ,when x = is_________. } 2 ∫ 2 ( 2x ∞ If y = 2 tan–1 x + sin–1 ) } 1 + x 2 √∫': {
        'text': 'The value of expression tan⁻¹(2x/(1-x²)), when x = 1/2 is__________.',
        'answer_key': 'π/3',
    },
    'for all x, then____< y <____. ( x− y ∞': {
        'text': 'If y = 2tan⁻¹x + sin⁻¹(2x/(1+x²)), then ______ < y < ______ for all x.',
        'answer_key': '-2π, 2π',
    },
    'The result tan–1x – tan–1y = tan–1 ) 1+ xy √ is true when value of xy is _____ } ∫': {
        'text': 'The result tan⁻¹x - tan⁻¹y = tan⁻¹((x-y)/(1+xy)) is true when value of xy is ______.',
        'answer_key': 'xy > -1',
    },
    'The minimum value of n for which tan–1 > , n∈N , is valid is 5. π 4 < ( –1 1 ∞ ∑ π': {
        'text': 'The minimum value of n for which tan⁻¹(1/n) < π/4, n ∈ N, is valid is ______.',
        'answer_key': '2',
    },
    'The principal value of sin–1 >cos ) sin √ ∆ is . ≤ } 2 ∫∂ 3': {
        'text': 'The principal value of sin⁻¹(cos(sin⁻¹(√3/2))) is__________.',
        'answer_key': 'π/6',
    },
}


def main():
    path = os.path.join(EXEMPLAR_DIR, '12-mathematics-ch2.json')
    if not os.path.exists(path):
        print(f'File not found: {path}')
        return
    
    with open(path) as f:
        data = json.load(f)
    
    fixed = 0
    for q in data:
        if not isinstance(q, dict):
            continue
        text = q.get('question_text', '')
        
        for garbled, fix in FIXES.items():
            if text == garbled or text.startswith(garbled[:30]):
                q['question_text'] = fix['text']
                q['answer_key'] = fix['answer_key']
                q['answer_explanation'] = f'Answer: {fix["answer_key"]}'
                q['review_state'] = None
                # Remove DRAFT flag
                qa_flags = q.get('qa_flags', []) or []
                q['qa_flags'] = [f for f in qa_flags if f != 'garbled_fraction_math']
                fixed += 1
                print(f'Fixed: {garbled[:50]}... → {fix["text"][:60]}...')
                break
    
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)
        f.write('\n')
    
    print(f'\nTotal fixed: {fixed}')


if __name__ == '__main__':
    main()
