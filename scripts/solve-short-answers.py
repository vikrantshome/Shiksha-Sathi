#!/usr/bin/env python3
"""
Solve SHORT_ANSWER questions for multiple exemplar chapters.
Uses pattern matching on question text to provide answers.
"""

import json, os, re

EXEMPLAR_DIR = 'doc/Exemplar'

# Universal answer patterns
ANSWER_PATTERNS = [
    # === Regular polygons ===
    (r'each exterior angle.*regular pentagon', '72°'),
    (r'each angle.*regular pentagon', '108°'),
    (r'each exterior angle.*regular hexagon', '60°'),
    (r'each angle.*regular hexagon', '120°'),
    (r'each exterior angle.*regular octagon', '45°'),
    (r'each angle.*regular octagon', '135°'),
    (r'each exterior angle.*18 sides', '20°'),
    (r'each exterior angle.*15 sides', '24°'),
    (r'each exterior angle.*10 sides', '36°'),
    (r'each exterior angle.*8 sides', '45°'),
    (r'sides.*regular polygon.*36', '10'),
    (r'sides.*regular polygon.*45', '8'),
    (r'sides.*regular polygon.*24', '15'),
    (r'sides.*regular polygon.*72', '5'),
    (r'sides.*regular polygon.*60', '6'),
    (r'sides.*regular polygon.*20', '18'),
    
    # === Polygon names ===
    (r'three-sided regular polygon', 'equilateral triangle'),
    (r'polygon having 10 sides', 'decagon'),
    (r'nonagon has.*sides', '9'),
    (r'decagon has.*sides', '10'),
    (r'heptagon has.*sides', '7'),
    (r'polygon with 3 sides', 'triangle'),
    
    # === Diagonals ===
    (r'diagonals in a hexagon', '9'),
    (r'diagonals in triangle', '0'),
    (r'diagonals in quadrilateral', '2'),
    (r'diagonals in pentagon', '5'),
    (r'number of diagonals in a hexagon', '9'),
    (r'number of diagonals in triangle', '0'),
    (r'number of diagonals in quadrilateral', '2'),
    (r'number of diagonals in pentagon', '5'),
    
    # === Quadrilateral properties ===
    (r'regular quadrilateral', 'square'),
    (r'pair of opposite sides is parallel', 'trapezium'),
    (r'one pair of.*sides.*parallel', 'trapezium'),
    (r'both pairs of opposite sides parallel', 'parallelogram'),
    (r'all sides of a quadrilateral are equal', 'rhombus'),
    (r'rhombus is a parallelogram in which.*sides are equal', 'all'),
    (r'rhombus.*all sides', 'equal'),
    (r'rhombus diagonals intersect at', 'right angles'),
    (r'diagonals of a rhombus are', 'perpendicular bisectors'),
    (r'diagonals of a parallelogram', 'bisect each other'),
    (r'diagonals of a rectangle are', 'equal'),
    (r'each angle of a rectangle measures', '90°'),
    (r'square is a.*rectangle', 'special type'),
    (r'square.*all sides', 'equal'),
    (r'quadrilateral that is not a parallelogram.*two opposite angles', 'kite'),
    (r'kite.*adjacent sides', 'equal'),
    (r'trapezium.*one pair.*sides', 'parallel'),
    (r'opposite angles of a parallelogram', 'equal'),
    (r'opposite sides of a parallelogram', 'equal and parallel'),
    (r'consecutive angles of a parallelogram', 'supplementary'),
    (r'adjacent angles of a parallelogram', 'supplementary'),
    (r'if the diagonals of a quadrilateral bisect each other', 'parallelogram'),
    (r'if diagonals.*bisect each other', 'parallelogram'),
    (r'quadrilateral with one pair of parallel sides', 'trapezium'),
    (r'quadrilateral with both pairs.*parallel', 'parallelogram'),
    (r'rectangle.*all angles', '90°'),
    (r'quadrilateral with diagonals equal.*bisect.*right angles', 'square'),
    (r'all sides equal.*each angle 90', 'square'),
    
    # === Angles ===
    (r'sum of measures of two angles is 90', 'complementary'),
    (r'sum of measures of two angles is 180', 'supplementary'),
    (r'maximum number of right angles.*triangle', '1'),
    (r'each interior angle.*square', '90°'),
    (r'each exterior angle.*square', '90°'),
    (r'measure of each exterior angle of a regular pentagon', '72°'),
    (r'Sum of the angles of a hexagon', '720°'),
    (r'sum of.*angles.*hexagon', '720°'),
    (r'sum of interior angles.*7 sides', '900°'),
    (r'sum of interior angles.*11 sides', '1620°'),
    (r'interior angles.*7 sides', '900°'),
    (r'interior angles.*11 sides', '1620°'),
    
    # === General fill-in ===
    (r'polygon is a simple closed curve made up of only', 'line segments'),
    (r'regular polygon is a polygon whose all sides are equal and all', 'angles'),
    (r'sum of interior angles of a polygon of n sides is', '(n-2) × 180°'),
    (r'closed curve entirely made up of line segments', 'polygon'),
    (r'sum of all exterior angles.*polygon', '360°'),
    (r'sum of exterior angles.*polygon', '360°'),
    (r'measurements can determine a quadrilateral uniquely', '5'),
    (r'quadrilateral can be constructed uniquely if its three sides and', 'two included angles'),
    
    # === Perimeter and Area ===
    (r'Perimeter of a regular polygon.*length of one side', 'number of sides'),
    (r'Perimeter of a regular polygon.*number of sides', 'length of one side'),
    (r'distance around a circle', 'circumference'),
    (r'wire in the shape of a square is rebent into a rectangle.*perimeter', 'perimeter'),
    (r'area.*any side.*parallelogram.*chosen', 'base'),
    
    # === Data Handling ===
    (r'difference between the highest and the lowest observations', 'range'),
    (r'observation that occurs the most often', 'mode'),
    (r'middle most observation', 'median'),
    (r'Mean, Median, Mode are the measures of', 'central tendency'),
    (r'Data available in an unorganised form', 'raw'),
    (r'In the class interval 20.*30, the lower class limit', '20'),
    (r'In the class interval 26.*33, 33 is known as', 'upper class limit'),
    
    # === Triangles ===
    (r'triangle always has altitude outside itself', 'obtuse-angled'),
    (r'sum of an exterior angle of a triangle and its adjacent angle', '180°'),
    (r'longest side of a right angled triangle', 'hypotenuse'),
    (r'Median is also called.*equilateral triangle', 'altitude'),
    (r'Measures of each of the angles of an equilateral triangle', '60°'),
    
    # === Lines and Angles ===
    (r'transversal intersects two or more than two lines at', 'distinct'),
    
    # === Algebraic Expressions ===
    (r'Sum or difference of two like terms', 'like term'),
    (r'3a2b.*7ba2', 'like terms'),
    (r'5a2b.*5b2a', 'unlike terms'),
    (r'In the expression 2πr.*algebraic variable', 'r'),
    (r'product of two terms with like signs', 'positive'),
    (r'product of two terms with unlike signs', 'negative'),
    (r'a.*b.*a2.*2ab.*b2', '(a - b)²'),
    (r'a2.*b2.*a.*b', '(a - b)'),
    (r'area of circle.*numerical constant', 'π'),
    
    # === Integers ===
    (r'absolute value', 'modulus'),
    
    # === Fractions ===
    (r'Rani ate part of a cake.*Ravi.*remaining.*left', '3/14'),
    
    # === Percentages ===
    (r'2 : 3 = .* %', '66.67%'),
    (r'30% of 360', '108'),
    (r'120 % of 50 km', '60 km'),
    (r'gain or loss per cent', 'profit/loss percentage'),
    (r'is a reduction on the marked price', 'Discount'),
    (r'Discount.*Marked Price.*Selling Price', 'Marked Price - Selling Price'),
    
    # === Simple Equations ===
    (r'z + 3 = 5.*z =', '2'),
    (r'3x.*4.*1.*2x', '1'),
    (r'value of the variable which makes both sides equal', 'solution'),
    
    # === Linear Equations ===
    (r'linear equation.*power of the variable', 'highest'),
    
    # === Solid Shapes ===
    (r'Square prism is also called', 'cube'),
    (r'Rectangular prism is also called', 'cuboid'),
    (r'pyramid on an n sided polygon has.*faces', 'n + 1'),
    
    # === Graphs ===
    (r'displays data that changes continuously', 'line graph'),
    (r'coordinates for representing a point', 'two'),
    (r'x-coordinate is zero.*y-axis', 'y-axis'),
    
    # === Playing with Numbers ===
    (r'divisible by 3 and', '9'),
    (r'reversing the digits', '9'),
    (r'sum of a two.digit number.*reversing', '9'),
    
    # === Rational Numbers ===
    (r'On a number line.*to the.*of zero', 'left'),
    
    # === Exponents ===
    (r'multiplicative inverse of 10', '10⁻¹⁰'),
    
    # === Comparing Quantities ===
    (r'x = 5y.*vary', 'directly'),
    (r'xy = 10.*vary', 'inversely'),
    (r'x ∝ y', 'directly proportional'),
]


def solve_question(text):
    """Try to solve a question based on its text."""
    text_lower = text.lower()
    
    for pattern, answer in ANSWER_PATTERNS:
        if re.search(pattern, text_lower, re.IGNORECASE):
            return answer
    
    return None


def process_chapter(json_path):
    """Process a single chapter file."""
    if not os.path.exists(json_path):
        return 0, 0
    
    with open(json_path) as f:
        data = json.load(f)
    
    if not isinstance(data, list):
        return 0, 0
    
    answered = 0
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
    
    if answered > 0:
        with open(json_path, 'w') as f:
            json.dump(data, f, indent=2)
            f.write('\n')
    
    total_remaining = sum(1 for q in data if isinstance(q, dict) and q.get('question_type') == 'SHORT_ANSWER' and not q.get('answer_key'))
    return answered, total_remaining


def main():
    total_answered = 0
    files_processed = 0
    
    for f in sorted(os.listdir(EXEMPLAR_DIR)):
        if not f.endswith('.json') or 'all' in f or 'report' in f:
            continue
        
        path = os.path.join(EXEMPLAR_DIR, f)
        answered, remaining = process_chapter(path)
        
        if answered > 0:
            files_processed += 1
            total_answered += answered
            print(f'{f}: {answered} answered, {remaining} remaining')
    
    print(f'\n{"=" * 60}')
    print(f'Total: {files_processed} files, {total_answered} questions answered')
    print(f'{"=" * 60}')


if __name__ == '__main__':
    main()
