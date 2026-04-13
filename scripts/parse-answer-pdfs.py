#!/usr/bin/env python3
"""
Parse NCERT Exemplar answer PDFs and match answers to existing questions.

Usage:
    .venv/bin/python scripts/parse-answer-pdfs.py --class=8 --subject=mathematics
    .venv/bin/python scripts/parse-answer-pdfs.py  # All classes/subjects
"""

import json
import os
import re
import subprocess
import sys

EXEMPLAR_DIR = 'doc/Exemplar'

# Answer PDF mapping
ANSWER_PDFS = {
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
    ('11', 'mathematics'): 'keep217.pdf',
    ('11', 'physics'): 'keep316.pdf',
    ('11', 'biology'): 'keep423.pdf',
    ('11', 'chemistry'): 'keep217.pdf',  # Chemistry answers may be in math PDF
    ('12', 'mathematics'): 'leep216.pdf',
    ('12', 'physics'): 'leep117.pdf',
    ('12', 'biology'): 'leep417.pdf',
    ('12', 'chemistry'): 'leep216.pdf',  # Chemistry answers may be in math PDF
}


def decode_unicode_text(text):
    """Decode PDF private-use Unicode to regular ASCII."""
    mapping = {
        '\uf028': '(', '\uf029': ')', '\uf020': ' ',
        '\uf041': 'A', '\uf042': 'B', '\uf043': 'C', '\uf044': 'D', '\uf045': 'E',
        '\uf055': 'U', '\uf06e': 'n', '\uf069': 'i', '\uf074': 't', '\uf031': '1',
        '\uf032': '2', '\uf033': '3', '\uf034': '4', '\uf035': '5',
        '\uf036': '6', '\uf037': '7', '\uf038': '8', '\uf039': '9', '\uf030': '0',
    }
    for enc, dec in mapping.items():
        text = text.replace(enc, dec)
    return text


def extract_text_from_pdf(pdf_path):
    """Extract text from PDF using pdftotext."""
    result = subprocess.run(
        ['pdftotext', '-layout', pdf_path, '-'],
        capture_output=True, text=True, timeout=60,
    )
    if result.returncode != 0:
        raise RuntimeError(f'pdftotext failed for {pdf_path}: {result.stderr}')
    return decode_unicode_text(result.stdout)


def parse_mcq_answers(text):
    """Extract MCQ answers from various formats.
    
    Formats:
    - "1. (d)  2. (b)  3. (a)"
    - "1-a;  2-c;  3-d"
    - "1 (d)  2 (b)"
    """
    answers = {}
    
    # Format 1: "1. (d)" or "12. (c)"
    for match in re.finditer(r'(\d+)\.\s*\(([a-d])\)', text, re.IGNORECASE):
        q_num = int(match.group(1))
        answer = match.group(2).upper()
        answers[q_num] = answer
    
    # Format 2: "1-a;" or "2-c;" or "10-d"
    for match in re.finditer(r'(\d+)\s*-\s*([a-d])\s*[;,]?', text, re.IGNORECASE):
        q_num = int(match.group(1))
        answer = match.group(2).upper()
        if q_num not in answers:  # Don't overwrite if already matched
            answers[q_num] = answer
    
    # Format 3: "1 (d)" without period
    for match in re.finditer(r'(?<!\d\.)(\d+)\s+\(([a-d])\)(?!\s*[a-d])', text, re.IGNORECASE):
        q_num = int(match.group(1))
        answer = match.group(2).upper()
        if q_num not in answers:
            answers[q_num] = answer
    
    return answers


def parse_true_false_answers(text):
    """Extract True/False answers: 48. False  49. False  50. True"""
    answers = {}
    # Match patterns like "48. False" or "49. True"
    for match in re.finditer(r'(\d+)\.\s*(True|False)', text, re.IGNORECASE):
        q_num = int(match.group(1))
        answer = match.group(2).capitalize()
        answers[q_num] = answer
    return answers


def parse_answer_pdf(pdf_path):
    """Parse an answer PDF and return answers by chapter.

    Returns a dict of {chapter_number: {mcq_answers, tf_answers, short_answers}}
    """
    text = extract_text_from_pdf(pdf_path)

    # Split by unit/chapter markers - handle multiple formats
    chapters = {}
    current_chapter = None
    current_text = ''

    lines = text.split('\n')
    for line in lines:
        # Check for chapter/unit markers (multiple formats)
        unit_match = re.match(r'^\s*[Uu]nit\s+(\d+)', line)
        chapter_match = re.match(r'^\s*[Cc]hapter\s+(\d+)', line)
        # Format: "CHAPTER 1 : THE LIVING WORLD"
        chapter_colon_match = re.match(r'^\s*CHAPTER\s+(\d+)\s*:', line, re.IGNORECASE)

        if unit_match:
            if current_chapter is not None:
                chapters[current_chapter] = current_text
            current_chapter = int(unit_match.group(1))
            current_text = ''
        elif chapter_colon_match:
            if current_chapter is not None:
                chapters[current_chapter] = current_text
            current_chapter = int(chapter_colon_match.group(1))
            current_text = ''
        elif chapter_match:
            if current_chapter is not None:
                chapters[current_chapter] = current_text
            current_chapter = int(chapter_match.group(1))
            current_text = ''
        else:
            current_text += line + '\n'

    # Save last chapter
    if current_chapter is not None:
        chapters[current_chapter] = current_text

    # Parse each chapter's answers
    result = {}
    for ch_num, ch_text in chapters.items():
        mcq = parse_mcq_answers(ch_text)
        tf = parse_true_false_answers(ch_text)
        result[ch_num] = {
            'mcq_answers': mcq,
            'tf_answers': tf,
            'raw_text': ch_text[:500],  # Sample for debugging
        }

    return result


def match_answers_to_questions(chapter_answers, json_path):
    """Match parsed answers to questions in a JSON file.
    
    MCQ answers: match by sequential order (1st MCQ -> answer 1, 2nd MCQ -> answer 2)
    T/F answers: match by sequential order
    """
    if not os.path.exists(json_path):
        return 0
    
    with open(json_path) as f:
        questions = json.load(f)
    
    matched = 0
    mcq_count = 0
    tf_count = 0
    
    mcq_answers = chapter_answers.get('mcq_answers', {})
    tf_answers = chapter_answers.get('tf_answers', {})
    
    for q in questions:
        if q['question_type'] == 'MCQ' and not q.get('answer_key'):
            mcq_count += 1
            if mcq_count in mcq_answers:
                answer = mcq_answers[mcq_count]
                q['answer_key'] = answer
                q['answer_explanation'] = f'Answer: Option ({answer.lower()})'
                matched += 1
        
        elif q['question_type'] == 'TRUE_FALSE' and not q.get('answer_key'):
            tf_count += 1
            if tf_count in tf_answers:
                answer = tf_answers[tf_count]
                q['answer_key'] = answer
                q['answer_explanation'] = f'Answer: {answer}'
                matched += 1
    
    if matched > 0:
        with open(json_path, 'w') as f:
            json.dump(questions, f, indent=2)
            f.write('\n')
    
    return matched


def main():
    args = sys.argv[1:]
    class_filter = next((a.split('=')[1] for a in args if a.startswith('--class=')), None)
    subject_filter = next((a.split('=')[1] for a in args if a.startswith('--subject=')), None)
    
    print('Parsing exemplar answer PDFs...\n')
    
    total_parsed = 0
    total_matched = 0
    
    for (class_num, subject), answer_file in ANSWER_PDFS.items():
        if class_filter and class_num != class_filter:
            continue
        if subject_filter and subject != subject_filter:
            continue
        
        pdf_path = os.path.join(EXEMPLAR_DIR, answer_file)
        if not os.path.exists(pdf_path):
            print(f'⏭  {answer_file}: PDF not found')
            continue
        
        print(f'Parsing {answer_file}...')
        chapter_answers = parse_answer_pdf(pdf_path)
        print(f'  Found {len(chapter_answers)} chapters with answers')
        total_parsed += len(chapter_answers)
        
        # Get chapter count for this class/subject from registry
        registry = json.load(open(os.path.join(EXEMPLAR_DIR, 'exemplar_registry.json')))
        chapters = registry.get('classes', {}).get(class_num, {}).get('subjects', {}).get(subject, {}).get('chapters', [])
        
        for chapter in chapters:
            ch_num = chapter['number']
            if ch_num not in chapter_answers:
                continue
            
            # Match answers to JSON file
            json_file = f"{class_num}-{subject}-ch{ch_num}.json"
            json_path = os.path.join(EXEMPLAR_DIR, json_file)
            
            if os.path.exists(json_path):
                matched = match_answers_to_questions(chapter_answers[ch_num], json_path)
                if matched > 0:
                    print(f'  ✅ Ch {ch_num}: {matched} answers matched')
                    total_matched += matched
    
    print(f'\n{"=" * 60}')
    print(f'Parsed: {total_parsed} chapters | Matched: {total_matched} answers')
    print(f'{"=" * 60}')


if __name__ == '__main__':
    main()
