#!/usr/bin/env python3
"""
Clean up MCQ questions that have options embedded inline in the question text.

This fixes exemplar MCQs where pdftotext merged options into the question text
instead of separating them properly.

Pattern: "Question text (a) option A (b) option B (c) option C (d) option D"

Usage:
    .venv/bin/python scripts/clean-mcq-inline-options.py
    .venv/bin/python scripts/clean-mcq-inline-options.py --dry-run
"""

import json
import os
import re
import sys

EXEMPLAR_DIR = 'doc/Exemplar'

# Regex to extract inline MCQ options
# Matches: question_text (a) optA (b) optB (c) optC (d) optD
# The options can contain various characters including math symbols
INLINE_MCQ_PATTERN = re.compile(
    r'^(.+?)\s*\([a-d]\)\s*(.+?)\s*\([a-d]\)\s*(.+?)\s*\([a-d]\)\s*(.+?)\s*\([a-d]\)\s*(.+)$',
    re.DOTALL | re.IGNORECASE
)

def clean_unicode_noise(text):
    """Remove PDF extraction noise characters."""
    # Remove private use area characters (U+F000-U+F8FF)
    text = re.sub(r'[\uf000-\uf8ff]', '', text)
    # Clean up multiple spaces
    text = re.sub(r'\s{2,}', ' ', text).strip()
    return text

def extract_options(text):
    """Extract inline MCQ options from question text.
    
    Returns (cleaned_question_text, options_dict) or None if no inline options found.
    """
    # Clean noise first
    text = clean_unicode_noise(text)
    
    match = INLINE_MCQ_PATTERN.match(text)
    if not match:
        return None
    
    question_text = clean_unicode_noise(match.group(1).strip())
    option_texts = [clean_unicode_noise(match.group(i).strip()) for i in range(2, 6)]
    
    # Clean up option texts - remove trailing garbage
    cleaned_options = []
    for opt in option_texts:
        # Remove trailing letters that might be from next question
        opt = re.sub(r'\s*[a-d]\s*$', '', opt)
        cleaned_options.append(opt)
    
    return question_text, cleaned_options


def extract_options_simple(text):
    """Extract options using simpler pattern matching.
    
    Looks for (a) ... (b) ... (c) ... (d) ... patterns anywhere in text.
    """
    # Clean noise first
    text = clean_unicode_noise(text)
    
    # Find all option markers with their content
    options = []
    pattern = r'\(([a-d])\)\s*([^(\[]+?)(?=\s*\([a-d]\)|$)'
    matches = list(re.finditer(pattern, text, re.IGNORECASE))
    
    if len(matches) < 2:
        return None
    
    # Check if we have at least 2 different option letters
    option_letters = set(m.group(1).lower() for m in matches)
    if len(option_letters) < 2:
        return None
    
    # Extract options
    cleaned_options = []
    for i, match in enumerate(matches):
        opt_text = match.group(2).strip()
        # Remove trailing garbage
        opt_text = re.sub(r'\s{2,}', ' ', opt_text).strip()
        cleaned_options.append(opt_text)
    
    if len(cleaned_options) < 2:
        return None
    
    # Question text is everything before the first option
    question_text = clean_unicode_noise(text[:matches[0].start()].strip())
    
    return question_text, cleaned_options


def extract_options_advanced(text):
    """Extract options from garbled PDF text where options got mixed.
    
    Handles patterns like:
    - "The value of is 4 4 25 5 (a) (b) (c) (d) 5 25 4 2 –1 2"
    - "The reciprocal of is 2 5 5 2 (a) (b) (c) – (d) – 5 2 2 5"
    """
    text = clean_unicode_noise(text)
    
    # Find the first option marker
    first_opt = re.search(r'\s*\([a-d]\)\s', text, re.IGNORECASE)
    if not first_opt:
        return None
    
    # Question text is everything before the first option
    question_text = clean_unicode_noise(text[:first_opt.start()].strip())
    
    # Rest is options
    options_text = text[first_opt.start():]
    
    # Split by option markers
    parts = re.split(r'\s*\([a-d]\)\s*', options_text, flags=re.IGNORECASE)
    # First part will be empty (before first option marker)
    parts = [p.strip() for p in parts if p.strip()]
    
    if len(parts) < 2:
        return None
    
    # Clean each option
    cleaned_options = []
    for part in parts:
        # Remove trailing option markers or garbage
        part = re.sub(r'\s*\([a-d]\)\s*$', '', part, flags=re.IGNORECASE)
        part = clean_unicode_noise(part)
        if len(part) > 0:
            cleaned_options.append(part)
    
    if len(cleaned_options) < 2:
        return None
    
    return question_text, cleaned_options[:4]


def clean_question_file(json_path, dry_run=False):
    """Clean inline options from a question file."""
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
        if q.get('question_type') != 'MCQ':
            continue
        
        text = q.get('question_text', '')
        if not text:
            continue
        
        # Skip if options are already properly set
        if q.get('options') and len(q.get('options', [])) >= 2:
            continue
        
        # Try to extract inline options
        result = extract_options(text)
        if not result:
            result = extract_options_advanced(text)
        if not result:
            result = extract_options_simple(text)
        
        if result:
            question_text, options = result
            
            # Validate: we need at least 2 options
            if len(options) < 2:
                continue
            
            # Clean up options (remove very short or empty ones)
            valid_options = [opt for opt in options if len(opt) > 1]
            if len(valid_options) < 2:
                continue
            
            if not dry_run:
                q['question_text'] = question_text
                q['options'] = valid_options[:4]  # Max 4 options
            
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
    files_processed = 0
    
    for f in sorted(os.listdir(EXEMPLAR_DIR)):
        if not f.endswith('.json') or 'all' in f or 'report' in f:
            continue
        
        path = os.path.join(EXEMPLAR_DIR, f)
        cleaned = clean_question_file(path, dry_run)
        
        if cleaned > 0:
            files_processed += 1
            total_cleaned += cleaned
            mode = '[DRY RUN] ' if dry_run else ''
            print(f'{mode}{f}: {cleaned} MCQs cleaned')
    
    print(f'\n{"=" * 60}')
    if dry_run:
        print(f'DRY RUN: {files_processed} files, {total_cleaned} MCQs would be cleaned')
    else:
        print(f'DONE: {files_processed} files, {total_cleaned} MCQs cleaned')
    print(f'{"=" * 60}')


if __name__ == '__main__':
    main()
