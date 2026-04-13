#!/usr/bin/env python3
"""
Set answers for Class 11-12 Math exemplar MCQs solved mathematically.
"""

import json
import os
import re

EXEMPLAR_DIR = 'doc/Exemplar'

# (filename_without_json, question_text_keyword, answer_letter)
ANSWERS = [
    # Class 11 Ch4
    ('11-mathematics-ch4', 'divisible by x', 'A'),
    ('11-mathematics-ch4', '10n + 3.4n+2 + k', 'A'),
    # Class 11 Ch8
    ('11-mathematics-ch8', 'A and B are coefficient', 'B'),
    ('11-mathematics-ch8', '2nd, 3rd and the 4th terms', 'B'),
    ('11-mathematics-ch8', 'coefficient of xn', 'D'),
    ('11-mathematics-ch8', 'successive terms', 'C'),
    ('11-mathematics-ch8', 'coefficients of (3r)', 'A'),
    ('11-mathematics-ch8', 'total number of terms', 'C'),
    # Class 11 Ch12
    ('11-mathematics-ch12', 'parallelopiped', 'A'),
    ('11-mathematics-ch12', 'locus', 'B'),
    ('11-mathematics-ch12', 'xy-plane', 'D'),
    ('11-mathematics-ch12', 'x-axis', 'A'),
    # Class 11 Ch13
    ('11-mathematics-ch13', 'f (x) = x – [x]', 'B'),
    ('11-mathematics-ch13', 'y = x+', 'D'),
    ('11-mathematics-ch13', 'x100 + x99', 'A'),
    ('11-mathematics-ch13', 'x−a', 'C'),
    # Class 11 Ch15
    ('11-mathematics-ch15', 'Standard deviations for first 10', 'D'),
    ('11-mathematics-ch15', 'temperature data', 'A'),
    ('11-mathematics-ch15', 'Coefficient of variation', 'A'),
    ('11-mathematics-ch15', '∑ x 2 = 18000', 'D'),
    ('11-mathematics-ch15', 'multiply each number by –1', 'A'),
    ('11-mathematics-ch15', '1 is added to each number', 'A'),
    # Class 12 Ch7
    ('12-mathematics-ch7', '1 – sin 2x', 'B'),
    # Class 12 Ch8
    ('12-mathematics-ch8', 'x = 2y + 3', 'C'),
    ('12-mathematics-ch8', 'y = x + 1', 'A'),
    ('12-mathematics-ch8', 'circle x2 + y2 = 1', 'B'),
    # Class 12 Ch10
    ('12-mathematics-ch10', 'a = 10', 'D'),
    ('12-mathematics-ch10', 'coplanar', 'A'),
    ('12-mathematics-ch10', 'a + b + c = 0 , then the value of a.b', 'C'),
    ('12-mathematics-ch10', 'Projection', 'A'),
    ('12-mathematics-ch10', '|a| = 2 , b = 3 , c = 5', 'C'),
    ('12-mathematics-ch10', '−3 ≤ λ ≤ 2', 'C'),
    ('12-mathematics-ch10', 'unit length perpendicular', 'B'),
    ('12-mathematics-ch10', '(a × i', 'D'),
    ('12-mathematics-ch10', 'triangle OAB', 'D'),
    ('12-mathematics-ch10', 'parallel', 'A'),
    ('12-mathematics-ch10', 'orthogonal', 'C'),
    ('12-mathematics-ch10', 'angle between', 'A'),
    ('12-mathematics-ch10', '2x – 3y + 6z', 'C'),
]


def main():
    total_answered = 0
    total_skipped = 0
    skipped_list = []

    for f in sorted(os.listdir(EXEMPLAR_DIR)):
        if not f.endswith('.json') or 'all' in f or 'report' in f:
            continue

        basename = f.replace('.json', '')
        path = os.path.join(EXEMPLAR_DIR, f)

        with open(path) as fp:
            data = json.load(fp)

        if not isinstance(data, list):
            continue

        file_answered = 0
        for q in data:
            if not isinstance(q, dict):
                continue
            if q.get('question_type') != 'MCQ':
                continue
            if q.get('answer_key'):
                continue

            text = q.get('question_text', '')
            answer = None
            for fname, keyword, ans in ANSWERS:
                if fname == basename and keyword.lower() in text.lower():
                    answer = ans
                    break

            if answer:
                q['answer_key'] = answer
                q['answer_explanation'] = f'Answer: Option ({answer.lower()})'
                file_answered += 1
            else:
                total_skipped += 1
                skipped_list.append(f"{f}: {text[:60]}")

        if file_answered > 0:
            with open(path, 'w') as fp:
                json.dump(data, fp, indent=2)
                fp.write('\n')
            print(f'{f}: {file_answered} answered')
            total_answered += file_answered

    print(f'\n{"=" * 60}')
    print(f'Answered: {total_answered}, Need scraping: {total_skipped}')
    print(f'{"=" * 60}')

    if skipped_list:
        print(f'\nQuestions needing scraping:')
        for s in skipped_list:
            print(f'  {s}')


if __name__ == '__main__':
    main()
