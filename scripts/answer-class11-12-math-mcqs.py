#!/usr/bin/env python3
"""
Manually set answers for Class 11-12 Math exemplar MCQs.

For questions where the answer is mathematically derivable from the question text
and options, we set the answer directly. For others, we mark them for Shaalaa scraping.

Usage:
    .venv/bin/python scripts/answer-class11-12-math-mcqs.py
"""

import json
import os
import re
import sys

EXEMPLAR_DIR = 'doc/Exemplar'


def clean_text(text):
    """Clean extracted text."""
    text = re.sub(r'[\uf000-\uf8ff]', '', text)
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()


def find_option_index(options, keyword):
    """Find the index of an option containing a keyword (0-based)."""
    for i, opt in enumerate(options):
        if keyword.lower() in opt.lower():
            return i
    return -1


def answer_by_content(q):
    """Try to determine the answer from question text and options.
    
    Returns answer letter (A-D) or None if not confident.
    """
    text = clean_text(q.get('question_text', '')).lower()
    options = q.get('options', [])
    cleaned_opts = [clean_text(o).lower() for o in options]
    
    if not options or len(options) < 2:
        return None
    
    # === 3D Geometry questions ===
    # "locus of a point for which x = 0" → yz-plane
    if 'locus' in text and 'x = 0' in text:
        idx = find_option_index(options, 'yz-plane')
        if idx >= 0:
            return chr(65 + idx)
    
    if 'locus' in text and 'y = 0' in text:
        idx = find_option_index(options, 'xz-plane')
        if idx >= 0:
            return chr(65 + idx)
    
    if 'locus' in text and 'z = 0' in text:
        idx = find_option_index(options, 'xy-plane')
        if idx >= 0:
            return chr(65 + idx)
    
    # "foot of perpendicular from (a,b,c) on xy-plane" → (a,b,0)
    if 'foot of the perpendicular' in text and 'xy-plane' in text:
        match = re.search(r'\((\d+),\s*(\d+),\s*(\d+)\)', text)
        if match:
            target = f"({match.group(1)}, {match.group(2)}, 0)"
            for i, opt in enumerate(cleaned_opts):
                if match.group(1) in opt and match.group(2) in opt and ', 0)' in opt:
                    return chr(65 + i)
    
    # "foot of perpendicular from point on x-axis" → (x,0,0)
    if 'foot of the perpendicular' in text and 'x-axis' in text:
        match = re.search(r'\((\d+),\s*(\d+),\s*(\d+)\)', text)
        if match:
            target = f"({match.group(1)}, 0, 0)"
            for i, opt in enumerate(cleaned_opts):
                if match.group(1) in opt and ', 0, 0)' in opt:
                    return chr(65 + i)
    
    # "foot of perpendicular from point on y-axis" → (0,y,0)
    if 'foot of the perpendicular' in text and 'y-axis' in text:
        match = re.search(r'\((\d+),\s*(\d+),\s*(\d+)\)', text)
        if match:
            for i, opt in enumerate(cleaned_opts):
                if match.group(2) in opt and ', 0, ' in opt:
                    return chr(65 + i)
    
    # "parallelopiped volume" with points
    if 'parallelopiped' in text or 'parallelepiped' in text:
        # Often the volume is |det| - look for numeric answer
        nums = [re.findall(r'(\d+)', o) for o in options]
        # Skip if options are garbled
        if all(len(n) == 0 for n in nums):
            return None
    
    # === Limits ===
    if 'lim' in text and 'x → 0' in text:
        # "lim (sin x)/x as x→0" = 1
        if 'sin' in text:
            idx = find_option_index(options, '1')
            if idx >= 0:
                return chr(65 + idx)
        # "lim (1 - cos x)/x as x→0" = 0
        if 'cos' in text:
            idx = find_option_index(options, '0')
            if idx >= 0:
                return chr(65 + idx)
        # "lim (e^x - 1)/x as x→0" = 1
        if 'e' in text and '1' in text:
            idx = find_option_index(options, '1')
            if idx >= 0:
                return chr(65 + idx)
    
    # === Derivatives ===
    # "f(x) = x^n, f'(x) = nx^(n-1)"
    if "f'" in text or "f ′" in text or "dy/dx" in text:
        pass  # Too varied, skip
    
    # === Distance formula ===
    if 'distance' in text and 'plane' in text:
        # Distance from point to plane formula
        pass  # Complex, skip
    
    # === Determinant questions ===
    if 'determinant' in text or '|a' in text:
        pass  # Complex, skip
    
    # === "Match the following" → Skip ===
    if 'match' in text:
        return None
    
    # === Simple algebraic identities ===
    if 'i^2' in text or 'iota' in text or 'complex' in text:
        # i^2 = -1
        if 'i^2' in text or 'iota^2' in text:
            idx = find_option_index(options, '-1')
            if idx >= 0:
                return chr(65 + idx)
    
    # === Probability: P(A') = 1 - P(A) ===
    if 'probability' in text and "p(a')" in text:
        match = re.search(r'p\(a\)\s*=\s*([\d/]+)', text)
        if match:
            pass  # Need calculation, skip
    
    # === Trigonometry basics ===
    # "sin(π/2)" = 1
    if 'sin' in text and 'π/2' in text:
        idx = find_option_index(options, '1')
        if idx >= 0:
            return chr(65 + idx)
    
    # "cos(π)" = -1
    if 'cos' in text and 'π' in text:
        if 'π)' in text or 'pi)' in text:
            idx = find_option_index(options, '-1')
            if idx >= 0:
                return chr(65 + idx)
    
    # === "The value of 0!" = 1 ===
    if '0!' in text:
        idx = find_option_index(options, '1')
        if idx >= 0:
            return chr(65 + idx)
    
    # === "nCr" questions ===
    if 'ncr' in text or 'combination' in text:
        pass  # Skip
    
    # === "Mean deviation" questions ===
    if 'mean deviation' in text:
        pass  # Skip
    
    return None


def process_file(json_path):
    """Process a single JSON file and set answers where confident."""
    if not os.path.exists(json_path):
        return 0, 0
    
    basename = os.path.basename(json_path)
    # Only process Class 11-12 Math
    if not (basename.startswith('11-mathematics') or basename.startswith('12-mathematics')):
        return 0, 0
    
    with open(json_path) as f:
        data = json.load(f)
    
    if not isinstance(data, list):
        return 0, 0
    
    answered = 0
    skipped = 0
    
    for q in data:
        if not isinstance(q, dict):
            continue
        if q.get('question_type') != 'MCQ':
            continue
        if q.get('answer_key'):
            continue  # Already has answer
        
        answer = answer_by_content(q)
        if answer:
            q['answer_key'] = answer
            q['answer_explanation'] = f'Answer: Option ({answer.lower()})'
            answered += 1
        else:
            skipped += 1
    
    if answered > 0:
        with open(json_path, 'w') as f:
            json.dump(data, f, indent=2)
            f.write('\n')
    
    return answered, skipped


def main():
    total_answered = 0
    total_skipped = 0
    files_processed = 0
    
    for f in sorted(os.listdir(EXEMPLAR_DIR)):
        if not f.endswith('.json') or 'all' in f or 'report' in f:
            continue
        
        path = os.path.join(EXEMPLAR_DIR, f)
        answered, skipped = process_file(path)
        
        if answered > 0 or skipped > 0:
            files_processed += 1
            total_answered += answered
            total_skipped += skipped
            print(f'{f}: {answered} answered, {skipped} skipped')
    
    print(f'\n{"=" * 60}')
    print(f'DONE: {files_processed} files, {total_answered} answered, {total_skipped} need scraping')
    print(f'{"=" * 60}')


if __name__ == '__main__':
    main()
