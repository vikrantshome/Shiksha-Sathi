#!/usr/bin/env python3
"""
Clean Unicode Private Use Area (PUA) characters from exemplar JSON files.

pdftotext uses PUA chars (U+F800-U+F8FF) for special symbols it can't map.
This script replaces common patterns and strips the rest.

Usage:
    .venv/bin/python scripts/clean-pua-chars.py
    .venv/bin/python scripts/clean-pua-chars.py --dry-run
"""

import json
import os
import re
import sys

EXEMPLAR_DIR = 'doc/Exemplar'

# PUA character replacements
# These are mappings from pdftotext's PUA usage to sensible Unicode
PUA_REPLACEMENTS = {
    '\uf024': '^',    # Hat notation for unit vectors (î, ĵ, k̂)
    '\uf072': '',     # Vector arrow over variable (a⃗ → a, context implies vector)
    '\uf0b6': 'k',    # k unit vector
    '\uf8e7': '→',   # Arrow (reaction arrows, implies)
    '\uf8e8': ']',    # Right bracket
    '\uf8e9': '[',    # Left bracket
    '\uf8ea': '{',    # Left brace
    '\uf8eb': '(',    # Left parenthesis
    '\uf8ec': ')',    # Right parenthesis
    '\uf8ed': '}',    # Right brace
    '\uf8ee': '<',    # Less than
    '\uf8ef': '>',    # Greater than
    '\uf8f0': '≤',    # Less than or equal
    '\uf8f1': '≥',    # Greater than or equal
    '\uf8f2': '≠',    # Not equal
    '\uf8f3': '±',    # Plus-minus
    '\uf8f4': '×',    # Multiplication
    '\uf8f5': '÷',    # Division
    '\uf8f6': '∞',    # Infinity
    '\uf8f7': '√',    # Square root
    '\uf8f8': '∫',    # Integral
    '\uf8f9': '∑',    # Summation
    '\uf8fa': '∆',    # Delta
    '\uf8fb': '∂',    # Partial derivative
    '\uf8fc': 'π',    # Pi
    '\uf8fd': '°',    # Degree
    '\uf8fe': '−',    # Minus sign
    '\uf8ff': '∆',    # Another delta variant
}

# Any PUA char not in the map gets removed
# PUA covers U+E000-U+F8FF
PUA_PATTERN = re.compile(r'[\uE000-\uF8FF]')


def clean_pua(text):
    """Replace known PUA chars, strip unknown ones."""
    if not text:
        return text
    
    result = []
    for char in text:
        code = ord(char)
        if 0xE000 <= code <= 0xF8FF:
            replacement = PUA_REPLACEMENTS.get(char, '')
            result.append(replacement)
        else:
            result.append(char)
    
    cleaned = ''.join(result)
    # Fix common duplication issues: →→ → →, (( → (, )) → )
    cleaned = cleaned.replace('→→', '→')
    cleaned = cleaned.replace('((', '(')
    cleaned = cleaned.replace('))', ')')
    cleaned = cleaned.replace('[[', '[')
    cleaned = cleaned.replace(']]', ']')
    cleaned = cleaned.replace('{{', '{')
    cleaned = cleaned.replace('}}', '}')
    # Clean up multiple spaces
    cleaned = re.sub(r'\s{2,}', ' ', cleaned)
    return cleaned


def process_file(json_path, dry_run=False):
    """Clean PUA chars from a single exemplar JSON file."""
    if not os.path.exists(json_path):
        return 0
    
    with open(json_path) as f:
        data = json.load(f)
    
    if not isinstance(data, list):
        return 0
    
    cleaned = 0
    for q in data:
        if not isinstance(q, dict):
            continue
        
        # Clean question text
        text_before = q.get('question_text', '')
        if text_before:
            q['question_text'] = clean_pua(text_before)
            if q['question_text'] != text_before:
                cleaned += 1
        
        # Clean options
        for i, opt in enumerate(q.get('options') or []):
            opt_before = opt
            q['options'][i] = clean_pua(opt)
            if q['options'][i] != opt_before:
                cleaned += 1
        
        # Clean explanation
        expl_before = q.get('answer_explanation', '')
        if expl_before:
            q['answer_explanation'] = clean_pua(expl_before)
            if q['answer_explanation'] != expl_before:
                cleaned += 1
    
    if cleaned > 0 and not dry_run:
        with open(json_path, 'w') as f:
            json.dump(data, f, indent=2)
            f.write('\n')
    
    return cleaned


def main():
    args = sys.argv[1:]
    dry_run = '--dry-run' in args
    
    total_cleaned = 0
    files_affected = 0
    
    for f in sorted(os.listdir(EXEMPLAR_DIR)):
        if not f.endswith('.json') or 'all' in f or 'report' in f:
            continue
        
        path = os.path.join(EXEMPLAR_DIR, f)
        cleaned = process_file(path, dry_run)
        
        if cleaned > 0:
            files_affected += 1
            total_cleaned += cleaned
            mode = '[DRY] ' if dry_run else ''
            print(f'{mode}{f}: {cleaned} cleaned')
    
    print(f'\n{"=" * 60}')
    if dry_run:
        print(f'DRY RUN: {files_affected} files, {total_cleaned} fields cleaned')
    else:
        print(f'DONE: {files_affected} files, {total_cleaned} fields cleaned')
    print(f'{"=" * 60}')


if __name__ == '__main__':
    main()
