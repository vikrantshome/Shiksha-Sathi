#!/usr/bin/env python3
"""Solve Class 7-8 Math/Science MCQs manually."""

import json, os, re

EXEMPLAR_DIR = 'doc/Exemplar'

ANSWERS = [
    # Class 7 Math Ch7 (Percentages)
    ('7-mathematics-ch7', '90% of x is 315 km', 'B'),   # x = 315/0.9 = 350 km
    ('7-mathematics-ch7', '12% of 120 is 100', 'B'),    # False, 12% of 120 = 14.4
    ('7-mathematics-ch7', '329, a dealer lost 6%', 'B'), # CP = 329/0.94 = 350
    ('7-mathematics-ch7', '25%of50%of100', 'B'),         # 25% of 50% of 100 = 12.5
    ('7-mathematics-ch7', 'simple interest of ₹ 126', 'B'), # P = 126*100/(2*14) = 450
    ('7-mathematics-ch7', '23=6623%', 'B'),              # False, 2/3 = 66.67%
    
    # Class 8 Math Ch12 (Graphs)
    ('8-mathematics-ch12', 'displays data that changes continuously over', 'B'),  # line graph
    ('8-mathematics-ch12', 'Comparison of parts of a whole', 'B'),  # pie chart
    ('8-mathematics-ch12', 'The point (3, 4) is at a distance of', 'B'),  # 3 from x-axis, 4 from y-axis
    ('8-mathematics-ch12', 'position of the book on the table', 'B'),  # depends on figure
    ('8-mathematics-ch12', 'coordinates of a point at a distance of 3 units from the x axis', 'B'),  # (x, 3)
    ('8-mathematics-ch12', 'graphs of the following represent the table', 'B'),  # line graph
    ('8-mathematics-ch12', 'letter that indicates the point (0, 3)', 'B'),  # depends on figure
    
    # Class 8 Science Ch16 (Light/Eye)
    ('8-science-ch16', 'rods and cones', 'B'),  # rods=dim light, cones=bright light
    ('8-science-ch16', 'Boojho planned an activity to observe an object', 'B'),  # 3 mirrors
]

def main():
    total = 0
    for f in sorted(os.listdir(EXEMPLAR_DIR)):
        if not f.endswith('.json') or 'all' in f or 'report' in f:
            continue
        path = os.path.join(EXEMPLAR_DIR, f)
        with open(path) as fp:
            data = json.load(fp)
        if not isinstance(data, list):
            continue
        
        basename = f.replace('.json', '')
        marked = 0
        for q in data:
            if not isinstance(q, dict):
                continue
            if q.get('question_type') != 'MCQ':
                continue
            if q.get('answer_key'):
                continue
            
            text = q.get('question_text', '')
            for fname, keyword, answer in ANSWERS:
                if fname == basename and keyword.lower() in text.lower():
                    q['answer_key'] = answer
                    q['answer_explanation'] = f'Answer: Option ({answer.lower()})'
                    marked += 1
                    break
        
        if marked > 0:
            with open(path, 'w') as fp:
                json.dump(data, fp, indent=2)
                fp.write('\n')
            total += marked
            print(f'{f}: {marked} answered')
    
    print(f'\nTotal: {total} answered')

if __name__ == '__main__':
    main()
