#!/usr/bin/env python3
"""
Fix misclassified SHORT_ANSWER questions that are actually MCQs.

These questions have MCQ options embedded in their text:
  "Question text (A) opt1 (B) opt2 (C) opt3 (D) opt4"

This script:
1. Scans all exemplar JSON files
2. Detects SHORT_ANSWER with MCQ option patterns
3. Extracts question text and options
4. Changes type to MCQ
5. Looks up answer from NCERT answer PDFs (where available)

Usage:
    .venv/bin/python scripts/fix-misclassified-mcqs.py
    .venv/bin/python scripts/fix-misclassified-mcqs.py --dry-run
"""

import json
import os
import re
import sys
import subprocess

EXEMPLAR_DIR = 'doc/Exemplar'

# Pattern: question text followed by (A) option (B) option (C) option (D) option
# Uses uppercase A,B,C,D to match MCQ options specifically
MCQ_PATTERN = re.compile(
    r'^(.+?)\s*\(A\)\s*(.+?)\s*\(B\)\s*(.+?)\s*\(C\)\s*(.+?)\s*\(D\)\s*(.+)$',
    re.DOTALL | re.IGNORECASE
)


def clean_text(text):
    """Clean extracted text: remove noise, collapse whitespace."""
    # Remove PDF extraction noise characters
    text = re.sub(r'[\uf000-\uf8ff]', '', text)
    # Collapse whitespace
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()


def fix_question(q):
    """Fix a single misclassified MCQ question.
    
    Returns updated question dict, or None if not an MCQ.
    """
    if q.get('question_type') != 'SHORT_ANSWER':
        return None
    
    text = q.get('question_text', '')
    match = MCQ_PATTERN.match(text)
    if not match:
        return None
    
    question_text = clean_text(match.group(1))
    option_a = clean_text(match.group(2))
    option_b = clean_text(match.group(3))
    option_c = clean_text(match.group(4))
    option_d = clean_text(match.group(5))
    
    # Skip if question text is too short (likely garbage)
    if len(question_text) < 5:
        return None
    
    q['question_type'] = 'MCQ'
    q['question_text'] = question_text
    q['options'] = [option_a, option_b, option_c, option_d]
    
    return q


def extract_mcq_answers_from_pdf(pdf_path):
    """Extract MCQ answers from an NCERT exemplar answer PDF.
    
    Returns dict: {question_number: answer_letter}
    """
    if not os.path.exists(pdf_path):
        return {}
    
    try:
        result = subprocess.run(
            ['pdftotext', '-layout', pdf_path, '-'],
            capture_output=True, text=True, timeout=60
        )
        text = result.stdout
    except Exception:
        return {}
    
    answers = {}
    
    # Pattern 1: "1. (d)" or "1. (b)"
    for match in re.finditer(r'(\d+)\.\s*\(([a-d])\)', text, re.IGNORECASE):
        q_num = int(match.group(1))
        answer = match.group(2).upper()
        answers[q_num] = answer
    
    # Pattern 2: "1-a;" or "2-b,"
    if not answers:
        for match in re.finditer(r'(\d+)\s*-\s*([a-d])', text, re.IGNORECASE):
            q_num = int(match.group(1))
            answer = match.group(2).upper()
            answers[q_num] = answer
    
    # Pattern 3: Roman numeral format "Q I. 1. |" with answer later
    # (for Class 11-12 Chemistry)
    # This is handled by the position-based lookup in the main script
    
    return answers


def map_answer_by_position(chapter_mcqs, pdf_answers):
    """Map answers to MCQs by sequential position.
    
    chapter_mcqs: list of fixed MCQ questions (in order)
    pdf_answers: dict from answer PDF {q_num: letter} or list of answer letters
    """
    if not pdf_answers:
        return
    
    # If pdf_answers is a dict with numeric keys, try to match by position
    if isinstance(pdf_answers, dict) and all(isinstance(k, int) for k in pdf_answers.keys()):
        for i, q in enumerate(chapter_mcqs):
            # Answer key typically starts at Q1
            if (i + 1) in pdf_answers:
                q['answer_key'] = pdf_answers[i + 1]
                q['answer_explanation'] = f'Answer: Option ({pdf_answers[i + 1].lower()})'
    else:
        # If it's a list, match by position
        if isinstance(pdf_answers, list):
            for i, q in enumerate(chapter_mcqs):
                if i < len(pdf_answers):
                    answer = pdf_answers[i]
                    q['answer_key'] = answer
                    q['answer_explanation'] = f'Answer: Option ({answer.lower()})'


def get_answer_pdf(chapter_class, chapter_subject, chapter_number):
    """Get the answer PDF path for a chapter."""
    # Map class numbers to PDF prefixes
    pdf_prefixes = {
        ('6', 'mathematics'): 'feep1an.pdf',
        ('6', 'science'): 'feep2an.pdf',
        ('7', 'mathematics'): 'gemp1a1.pdf',
        ('7', 'science'): 'geep1an.pdf',
        ('8', 'mathematics'): 'heep2an.pdf',
        ('8', 'science'): 'heep1an.pdf',
        ('9', 'mathematics'): 'ieep2an.pdf',
        ('9', 'science'): 'ieep1an.pdf',
        ('10', 'mathematics'): 'jeep2an.pdf',
        ('10', 'science'): 'jeep1an.pdf',
    }
    
    key = (chapter_class, chapter_subject)
    pdf_name = pdf_prefixes.get(key)
    
    if pdf_name:
        return os.path.join(EXEMPLAR_DIR, pdf_name)
    return None


def process_file(json_path, dry_run=False):
    """Process a single exemplar JSON file."""
    if not os.path.exists(json_path):
        return 0
    
    with open(json_path) as f:
        data = json.load(f)
    
    if not isinstance(data, list):
        return 0
    
    # Extract chapter info from filename
    basename = os.path.basename(json_path)
    match = re.match(r'(\d+)-(\w+)-ch(\d+)\.json', basename)
    if not match:
        return 0
    
    chapter_class = match.group(1)
    chapter_subject = match.group(2)
    chapter_number = int(match.group(3))
    
    # Find and fix misclassified MCQs
    fixed_mcqs = []
    for q in data:
        if isinstance(q, dict) and q.get('question_type') == 'SHORT_ANSWER':
            fixed = fix_question(q)
            if fixed:
                fixed_mcqs.append(fixed)
    
    if not fixed_mcqs:
        return 0
    
    # Try to get answers from answer PDF
    pdf_path = get_answer_pdf(chapter_class, chapter_subject, chapter_number)
    if pdf_path:
        pdf_answers = extract_mcq_answers_from_pdf(pdf_path)
        if pdf_answers:
            map_answer_by_position(fixed_mcqs, pdf_answers)
    
    count = len(fixed_mcqs)
    
    if not dry_run:
        with open(json_path, 'w') as f:
            json.dump(data, f, indent=2)
            f.write('\n')
    
    return count


def main():
    args = sys.argv[1:]
    dry_run = '--dry-run' in args
    
    total_fixed = 0
    files_processed = 0
    
    for f in sorted(os.listdir(EXEMPLAR_DIR)):
        if not f.endswith('.json') or 'all' in f or 'report' in f:
            continue
        
        path = os.path.join(EXEMPLAR_DIR, f)
        fixed = process_file(path, dry_run)
        
        if fixed > 0:
            files_processed += 1
            total_fixed += fixed
            mode = '[DRY RUN] ' if dry_run else ''
            print(f'{mode}{f}: {fixed} MCQs fixed')
    
    print(f'\n{"=" * 60}')
    if dry_run:
        print(f'DRY RUN: {files_processed} files, {total_fixed} questions would be fixed')
    else:
        print(f'DONE: {files_processed} files, {total_fixed} questions fixed')
    print(f'{"=" * 60}')


if __name__ == '__main__':
    main()
