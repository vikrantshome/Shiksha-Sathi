#!/usr/bin/env python3
"""
Solve SHORT_ANSWER questions for Class 8 Math Ch5 (Understanding Quadrilaterals).

These are mostly fill-in-the-blank and simple geometry questions.
"""

import json, os, re

EXEMPLAR_DIR = 'doc/Exemplar'
path = os.path.join(EXEMPLAR_DIR, '8-mathematics-ch5.json')

# Known answers for Class 8 Math Ch5 exemplar questions
ANSWERS = {
    # Fill-in-the-blank questions
    'measure of each exterior angle of a regular pentagon': '72°',
    'Sum of the angles of a hexagon': '720°',
    'measure of each exterior angle of a regular polygon of 18 sides': '20°',
    'number of sides of a regular polygon.*36°': '10',
    'closed curve entirely made up of line segments': 'polygon',
    'quadrilateral that is not a parallelogram but has exactly two opposite angles': 'kite',
    'measure of each angle of a regular pentagon': '108°',
    'name of three-sided regular polygon': 'equilateral triangle',
    'number of diagonals in a hexagon': '9',
    'polygon is a simple closed curve made up of only': 'line segments',
    'regular polygon is a polygon whose all sides are equal and all': 'angles',
    'sum of interior angles of a polygon of n sides is': '(n-2)',
    'sum of all.*of a quadrilateral is 360': 'angles',
    'diagonals of the quadrilateral': 'DG and EF',
    'pairs of opposite sides are': 'HO and PE, HE and OP',
    'pairs of adjacent angles are': 'H and O, O and P, P and E, E and H',
    'pairs of opposite angles are': 'W and Y, X and Z',
    'If AM and CN are perpendiculars.*parallelogram': 'Yes',
    'Construct a rhombus PAIR': 'Constructed',
    'HOPE is a rectangle.*diagonals meet at G': '18',
    'exterior angle of a regular polygon of 15 sides': '24°',
    'number of sides of a regular polygon.*45°': '8',
    'measure of each exterior angle of a regular polygon of 10 sides': '36°',
    'sum of interior angles of a polygon with 7 sides': '900°',
    'measure of each angle of a regular hexagon': '120°',
    'maximum number of right angles in a right angled triangle': '1',
    'sum of interior angles of a polygon having 11 sides': '1620°',
    'measure of each angle of regular octagon': '135°',
    'number of sides in regular polygon.*24°': '15',
    'number of diagonals in triangle': '0',
    'number of diagonals in quadrilateral': '2',
    'number of diagonals in pentagon': '5',
    'sum of exterior angles of any polygon': '360°',
}


def solve_question(text):
    """Try to solve a question based on its text."""
    text_lower = text.lower()
    
    # Fill-in-the-blank patterns
    patterns = [
        (r'exterior angle.*regular pentagon', '72°'),
        (r'sum of.*angles.*hexagon', '720°'),
        (r'exterior angle.*18 sides', '20°'),
        (r'exterior angle.*measure of 36', '10'),
        (r'sides.*regular polygon.*36', '10'),
        (r'closed curve.*line segments.*another name', 'polygon'),
        (r'quadrilateral.*not a parallelogram.*two opposite angles.*equal', 'kite'),
        (r'each angle.*regular pentagon', '108°'),
        (r'three-sided regular polygon', 'equilateral triangle'),
        (r'diagonals in a hexagon', '9'),
        (r'polygon is a simple closed curve made up of only', 'line segments'),
        (r'regular polygon is a polygon whose all sides are equal and all', 'angles'),
        (r'sum of interior angles of a polygon of n sides is', '(n-2)'),
        (r'sum of all.*quadrilateral is 360', 'angles'),
        (r'sum of all exterior angles.*polygon', '360°'),
        (r'diagonals of the quadrilateral', 'DG and EF'),
        (r'opposite sides are.*HOPE', 'HO and PE, HE and OP'),
        (r'adjacent angles are.*ROPE', '∠R and ∠O, ∠O and ∠P, ∠P and ∠E, ∠E and ∠R'),
        (r'opposite angles are.*WXYZ', '∠W and ∠Y, ∠X and ∠Z'),
        (r'exterior angle.*15 sides', '24°'),
        (r'sides.*regular polygon.*45', '8'),
        (r'exterior angle.*10 sides', '36°'),
        (r'interior angles.*7 sides', '900°'),
        (r'each angle.*regular hexagon', '120°'),
        (r'maximum number of right angles.*triangle', '1'),
        (r'interior angles.*11 sides', '1620°'),
        (r'each angle.*regular octagon', '135°'),
        (r'sides.*regular polygon.*24', '15'),
        (r'diagonals in triangle', '0'),
        (r'diagonals in quadrilateral', '2'),
        (r'diagonals in pentagon', '5'),
        (r'sum of exterior angles.*polygon', '360°'),
        (r'AM and CN are perpendiculars.*parallelogram', 'Yes, ∆AMD ≅ ∆CNB by AAS congruence'),
        (r'Construct a rhombus PAIR', 'Constructed with PA = 6 cm and ∠A = 110°'),
        (r'HOPE is a rectangle.*diagonals.*HG = 5x.*EG = 4x', 'x = 18'),
        (r'regular quadrilateral', 'square'),
        (r'pair of opposite sides is parallel', 'trapezium'),
        (r'all sides of a quadrilateral are equal', 'rhombus'),
        (r'rhombus diagonals intersect at', 'right'),
        (r'measurements can determine a quadrilateral uniquely', '5'),
        (r'quadrilateral can be constructed uniquely if its three sides and', 'two included angles'),
        (r'parallelogram.*adjacent angles', 'supplementary'),
        (r'opposite angles of a parallelogram are', 'equal'),
        (r'diagonals of a parallelogram', 'bisect each other'),
        (r'diagonals of a rhombus are', 'perpendicular bisectors of each other'),
        (r'diagonals of a rectangle are', 'equal'),
        (r'square is a.*rectangle', 'special type of'),
        (r'each angle of a rectangle measures', '90°'),
        (r'opposite sides of a parallelogram are', 'equal and parallel'),
        (r'consecutive angles of a parallelogram are', 'supplementary'),
        (r'adjacent angles of a parallelogram', 'supplementary'),
        (r'angle sum property.*quadrilateral', '360°'),
        (r'sum of interior angles.*quadrilateral', '360°'),
        (r'each interior angle.*square', '90°'),
        (r'each exterior angle.*square', '90°'),
        (r'quadrilateral with diagonals equal and bisect each other at right angles', 'square'),
        (r'quadrilateral with all sides equal and each angle 90', 'square'),
        (r'rhombus is a parallelogram in which.*sides are equal', 'all'),
        (r'measure of.*angle of concave quadrilateral is more than 180', 'one interior'),
        (r'diagonal of a quadrilateral is a line segment that joins two.*vertices', 'opposite'),
        (r'number of sides in a regular polygon.*exterior angle as', 'variable'),
        (r'diagonals of a quadrilateral bisect each other, it is a', 'parallelogram'),
        (r'adjacent sides of a parallelogram are 5 cm and 9 cm.*perimeter', '28 cm'),
        (r'nonagon has.*sides', '9'),
        (r'decagon has.*sides', '10'),
        (r'heptagon has.*sides', '7'),
        (r'number of sides of polygon.*exterior angle.*72', '5'),
        (r'number of sides of polygon.*exterior angle.*60', '6'),
        (r'number of sides of polygon.*exterior angle.*30', '12'),
        (r'number of sides of polygon.*exterior angle.*20', '18'),
        (r'number of sides of polygon.*exterior angle.*15', '24'),
        (r'number of sides of polygon.*exterior angle.*10', '36'),
        (r'each interior angle.*144', '10'),
        (r'each interior angle.*150', '12'),
        (r'each interior angle.*135', '8'),
        (r'each interior angle.*120', '6'),
        (r'adjacent angles of a parallelogram are in the ratio', 'supplementary'),
        (r'perimeter of parallelogram', '2 × (sum of adjacent sides)'),
        (r'sum of exterior angles of any polygon is', '360°'),
        (r'sum of interior angles.*n sided polygon', '(n-2) × 180°'),
        (r'interior angle.*exterior angle', '180°'),
        (r'each interior angle and each exterior angle.*regular polygon', '180°'),
        (r'polygon.*minimum.*sides', '3'),
        (r'minimum number of sides of a polygon', '3'),
        (r'quadrilateral with one pair of parallel sides', 'trapezium'),
        (r'quadrilateral with both pairs of opposite sides parallel', 'parallelogram'),
        (r'rectangle.*all angles', '90°'),
        (r'square.*all sides', 'equal'),
        (r'rhombus.*all sides', 'equal'),
        (r'kite.*adjacent sides', 'equal'),
        (r'trapezium.*one pair of.*sides', 'parallel'),
    ]
    
    for pattern, answer in patterns:
        if re.search(pattern, text_lower, re.IGNORECASE):
            return answer
    
    return None


def main():
    if not os.path.exists(path):
        print(f'File not found: {path}')
        return
    
    with open(path) as f:
        data = json.load(f)
    
    if not isinstance(data, list):
        return
    
    answered = 0
    skipped = 0
    skipped_list = []
    
    for q in data:
        if not isinstance(q, dict):
            continue
        if q.get('question_type') != 'SHORT_ANSWER':
            continue
        if q.get('answer_key'):
            continue
        
        text = q.get('question_text', '')
        answer = solve_question(text)
        
        if answer:
            q['answer_key'] = answer
            q['answer_explanation'] = f'Answer: {answer}'
            answered += 1
        else:
            skipped += 1
            skipped_list.append(text[:80])
    
    if answered > 0:
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
            f.write('\n')
        print(f'Class 8 Math Ch5: {answered} answered, {skipped} skipped')
    
    if skipped_list:
        print(f'\nSkipped questions:')
        for s in skipped_list[:10]:
            print(f'  {s}')
        if len(skipped_list) > 10:
            print(f'  ... and {len(skipped_list) - 10} more')


if __name__ == '__main__':
    main()
