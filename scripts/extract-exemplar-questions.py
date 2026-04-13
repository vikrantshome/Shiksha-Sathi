"""
Extract questions from NCERT Exemplar PDFs.

Uses pdftotext for layout-preserved text extraction, then parses
the structured content (Solved Examples, Exercises) into
questions with the same schema as existing exemplar JSON files.

Section markers use PDF private-use Unicode:
  U+F028 = (  U+F029 = )
  U+F041 = A  U+F042 = B  U+F043 = C  U+F044 = D

So (A) becomes \uf028\uf041\uf029

Usage:
    .venv/bin/python scripts/extract-exemplar-questions.py
    .venv/bin/python scripts/extract-exemplar-questions.py --class=8
    .venv/bin/python scripts/extract-exemplar-questions.py --class=8 --subject=mathematics
    .venv/bin/python scripts/extract-exemplar-questions.py --dry-run
"""

import json
import os
import re
import subprocess
import sys

REGISTRY_PATH = 'doc/Exemplar/exemplar_registry.json'
EXEMPLAR_DIR = 'doc/Exemplar'

# Unicode section markers from PDF fonts (private use area)
LPAREN_U = '\uf028'
RPAREN_U = '\uf029'
SEC_A_U = '\uf041'
SEC_B_U = '\uf042'
SEC_C_U = '\uf043'
SEC_D_U = '\uf044'
SEC_E_U = '\uf045'

# Pattern 1: Unicode-encoded section headers (Class 6-8 exemplar)
SECTION_PATTERN_UNICODE = re.compile(
    r'^\s*' + LPAREN_U + r'(' + SEC_A_U + r'|' + SEC_B_U + r'|' + SEC_C_U + r'|' + SEC_D_U + r'|' + SEC_E_U + r')' + RPAREN_U + r'\s+(.+)$'
)

# Pattern 2: Plain ASCII section headers (Class 9+ exemplar)
SECTION_PATTERN_ASCII = re.compile(r'^\s*\(([A-E])\)\s+(.+)$')

SECTION_LETTER_MAP = {
    SEC_A_U: 'A', SEC_B_U: 'B', SEC_C_U: 'C', SEC_D_U: 'D', SEC_E_U: 'E',
    'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E',
}

EXAMPLE_NUM_PATTERN = re.compile(r'^\s*Example\s+(\d+)\s*[:.]?\s*(.*)$')
SOLUTION_PATTERN = re.compile(r'^\s*[Ss]olution\s*[:.]?\s*(.*)$')
QUESTION_NUM_PATTERN = re.compile(r'^\s*(\d+)\.\s+(.+)$')
OPTION_PATTERN = re.compile(r'^\s*\(([A-D])\)\s+(.+)$')
# Class 12 exemplar uses roman numerals: (i), (ii), (iii), (iv)
OPTION_PATTERN_ROMAN = re.compile(r'^\s*\(([ivx]+)\)\s+(.+)$')


def decode_unicode_text(text):
    """Decode PDF private-use Unicode to regular ASCII."""
    mapping = {
        '\uf028': '(', '\uf029': ')', '\uf020': ' ',
        '\uf041': 'A', '\uf042': 'B', '\uf043': 'C', '\uf044': 'D', '\uf045': 'E',
    }
    for enc, dec in mapping.items():
        text = text.replace(enc, dec)
    return text


def get_all_chapters(registry):
    chapters = []
    for class_num, class_data in (registry.get('classes') or {}).items():
        for subject, subject_data in (class_data.get('subjects') or {}).items():
            for chapter in (subject_data.get('chapters') or []):
                chapters.append({
                    'class': class_num,
                    'subject': subject,
                    'chapter_number': chapter['number'],
                    'chapter_title': chapter['title'],
                    'file': chapter['file'],
                })
    return chapters


def extract_text_from_pdf(pdf_path):
    result = subprocess.run(
        ['pdftotext', '-layout', pdf_path, '-'],
        capture_output=True, text=True, timeout=60,
    )
    if result.returncode != 0:
        raise RuntimeError(f'pdftotext failed for {pdf_path}: {result.stderr}')
    return result.stdout


def find_section_lines(lines):
    """Find section boundaries (A=Concepts, B=Examples, C=Exercise, D=Activities).
    Handles both Unicode-encoded (Class 6-8) and ASCII (Class 9+) section headers."""
    sections = {}
    for i, line in enumerate(lines):
        # Try Unicode pattern first
        match = SECTION_PATTERN_UNICODE.match(line)
        if match:
            sec = SECTION_LETTER_MAP.get(match.group(1), '?')
            sections[sec] = i
            continue
        # Fall back to ASCII pattern
        match = SECTION_PATTERN_ASCII.match(line)
        if match:
            sections[match.group(1)] = i
    return sections


def parse_solved_examples(lines, start, end):
    """Parse section B: Solved Examples."""
    examples = []
    idx = start

    while idx < end:
        line = lines[idx]
        decoded = decode_unicode_text(line)
        match = EXAMPLE_NUM_PATTERN.match(decoded)

        if match:
            example_num = int(match.group(1))
            question_text = match.group(2).strip()

            # Skip instruction lines
            if question_text.lower().startswith(('in example', 'in questions', 'write the')):
                idx += 1
                continue

            idx += 1
            question_type = 'SHORT_ANSWER'

            # Collect continuation of question text and options
            option_lines = []
            while idx < end:
                d = decode_unicode_text(lines[idx]).strip()
                # Stop at solution or next example
                if SOLUTION_PATTERN.match(d) or EXAMPLE_NUM_PATTERN.match(d):
                    break
                if d and not is_junk(d):
                    # Check if it's an option line
                    opt_match = OPTION_PATTERN.match(d)
                    if opt_match:
                        option_lines.append(d)
                    else:
                        question_text += ' ' + d
                idx += 1

            # Parse options
            opts = []
            for ol in option_lines:
                om = OPTION_PATTERN.match(ol)
                if om:
                    opts.append(om.group(2).strip())

            if opts and len(opts) >= 2:
                question_type = 'MCQ'

            # Find and parse solution
            answer_text = ''
            explanation = ''
            while idx < end:
                d = decode_unicode_text(lines[idx])
                sol_match = SOLUTION_PATTERN.match(d.strip())
                if sol_match:
                    answer_text = sol_match.group(1).strip()
                    idx += 1
                    expl_lines = []
                    while idx < end:
                        d2 = decode_unicode_text(lines[idx]).strip()
                        if EXAMPLE_NUM_PATTERN.match(d2):
                            break
                        if d2 and not is_junk(d2) and not d2.startswith('(A)'):
                            expl_lines.append(d2)
                        idx += 1
                        if len(expl_lines) > 8:
                            break
                    explanation = ' '.join(expl_lines)
                    break
                else:
                    idx += 1

            # Determine type
            if '____' in question_text or '_____' in question_text:
                question_type = 'FILL_IN_BLANKS'
            elif question_type != 'MCQ':
                lower_q = question_text.lower()
                if ('true' in lower_q or 'false' in lower_q) and (
                    ('true' in lower_q and 'false' in lower_q) or
                    answer_text.lower() in ('true', 'false')
                ):
                    question_type = 'TRUE_FALSE'

            if question_text and len(question_text) > 10:
                examples.append({
                    'question_text': question_text,
                    'question_type': question_type,
                    'options': opts,
                    'answer_key': answer_text,
                    'answer_explanation': explanation,
                })
        else:
            idx += 1

    return examples


def parse_exercise_questions(lines, start, end):
    """Parse section C: Exercise questions."""
    questions = []
    idx = start

    # Scan for instruction lines to determine question type ranges
    mcq_range = None
    fill_range = None
    tf_range = None
    short_range = None
    long_range = None

    for i in range(start, min(start + 10, end)):
        decoded = decode_unicode_text(lines[i]).lower()

        m = re.search(r'questions?\s+(\d+)\s+to\s+(\d+)', decoded)
        if m:
            qs, qe = int(m.group(1)), int(m.group(2))
            if 'fill in' in decoded or 'blank' in decoded:
                fill_range = (qs, qe)
            elif 'true' in decoded and 'false' in decoded:
                tf_range = (qs, qe)
            elif 'short answer' in decoded:
                short_range = (qs, qe)
            elif 'long answer' in decoded:
                long_range = (qs, qe)
            elif 'one is correct' in decoded or 'only one' in decoded or 'four options' in decoded:
                mcq_range = (qs, qe)

    # If no MCQ range found, assume first range (1 to N) is MCQ
    if mcq_range is None:
        for i in range(start, min(start + 5, end)):
            decoded = decode_unicode_text(lines[i]).lower()
            m = re.search(r'questions?\s+(\d+)\s+to\s+(\d+)', decoded)
            if m:
                mcq_range = (int(m.group(1)), int(m.group(2)))
                break

    current_num = None
    current_text = ''
    current_options = []
    current_type = 'SHORT_ANSWER'

    def save_current():
        nonlocal current_num, current_text, current_options, current_type
        if current_num is not None and current_text.strip():
            qt = current_text.strip()
            if len(qt) > 5:
                questions.append({
                    'question_num': current_num,
                    'question_text': qt,
                    'question_type': current_type,
                    'options': current_options,
                })
        current_num = None
        current_text = ''
        current_options = []

    def determine_type(num):
        if mcq_range and mcq_range[0] <= num <= mcq_range[1]:
            return 'MCQ'
        if fill_range and fill_range[0] <= num <= fill_range[1]:
            return 'FILL_IN_BLANKS'
        if tf_range and tf_range[0] <= num <= tf_range[1]:
            return 'TRUE_FALSE'
        if short_range and short_range[0] <= num <= short_range[1]:
            return 'SHORT_ANSWER'
        if long_range and long_range[0] <= num <= long_range[1]:
            return 'LONG_ANSWER'
        # Default: first range is MCQ, fill is second, then short
        return 'SHORT_ANSWER'

    while idx < end:
        decoded = decode_unicode_text(lines[idx]).strip()

        q_match = QUESTION_NUM_PATTERN.match(decoded)

        if q_match:
            # Save previous
            save_current()

            current_num = int(q_match.group(1))
            current_text = q_match.group(2).strip()
            current_type = determine_type(current_num)
            current_options = []

            # If MCQ, try to parse options
            if current_type == 'MCQ':
                opts, idx = parse_options(lines, idx + 1, end)
                if opts:
                    current_options = opts
                    idx -= 1  # parse_options already advanced
            idx += 1
        elif current_num is not None and decoded and not is_junk(decoded):
            # Append to current question
            if not decoded.startswith(('UNIT-', 'EXEMPLAR', 'Fig.', 'MATHEMATICS', 'SCIENCE', 'Activity')):
                current_text += ' ' + decoded
            idx += 1
        else:
            idx += 1

    # Save last
    save_current()
    return questions


def parse_options(lines, start, end, max_options=4):
    """Parse MCQ options starting at line index. Handles both (A)/(B)/(C)/(D) and (i)/(ii)/(iii)/(iv) formats."""
    options = []
    idx = start
    while len(options) < max_options and idx < end:
        decoded = decode_unicode_text(lines[idx]).strip()
        match = OPTION_PATTERN.match(decoded)
        if not match:
            match = OPTION_PATTERN_ROMAN.match(decoded)
        if match:
            options.append(match.group(2).strip())
            idx += 1
        elif not decoded:
            idx += 1
        else:
            break
    return options, idx


def is_junk(text):
    """Check if text is noise from PDF extraction."""
    junk_patterns = [
        'UNIT-', 'EXEMPLAR PROBLEMS', 'MATHEMATICS', 'SCIENCE',
        'Rough Work', '11.4.2018', '11.4.20', 'Fig.',
    ]
    for pat in junk_patterns:
        if pat in text:
            return True
    return False


def extract_questions_from_text(text, chapter_info):
    """Main extraction: parse text into structured questions."""
    lines = text.split('\n')
    sections = find_section_lines(lines)

    all_questions = []

    # Check if this is a Class 12 exemplar (uses different structure)
    is_class12_style = 'I. Multiple Choice Questions' in text or 'II. Multiple Choice Questions' in text

    if is_class12_style:
        # Class 12 exemplar structure:
        # I. Multiple Choice Questions (Type-I)
        # II. Multiple Choice Questions (Type-II)
        # III. Short Answer Type
        # IV. Long Answer Type
        # ANSWERS (at end)
        exercise_qs = parse_class12_exercises(lines)
        for eq in exercise_qs:
            if len(eq['question_text']) < 10:
                continue
            all_questions.append({
                **eq,
                'is_example': False,
                'difficulty': 'easy' if eq['question_type'] in ('MCQ', 'TRUE_FALSE', 'FILL_IN_BLANKS') else 'medium',
            })
    else:
        # Class 6-11 exemplar structure:
        # Section B: Solved Examples
        b_start = sections.get('B')
        if b_start is not None:
            b_end = sections.get('C', sections.get('D', len(lines)))
            examples = parse_solved_examples(lines, b_start, b_end)
            for ex in examples:
                all_questions.append({
                    **ex,
                    'is_example': True,
                    'difficulty': 'medium',
                })

        # Section C: Exercises
        c_start = sections.get('C')
        if c_start is not None:
            c_end = sections.get('D', len(lines))

            # Refine end: stop before "Activity 1"
            for i in range(c_start, c_end):
                decoded = decode_unicode_text(lines[i])
                if 'Activity 1' in decoded:
                    c_end = i
                    break

            exercise_qs = parse_exercise_questions(lines, c_start, c_end)
            for eq in exercise_qs:
                # Skip very short or figure-only questions
                if len(eq['question_text']) < 10:
                    continue

                all_questions.append({
                    **eq,
                    'is_example': False,
                    'difficulty': 'easy' if eq['question_type'] in ('MCQ', 'TRUE_FALSE', 'FILL_IN_BLANKS') else 'medium',
                })

    # Parse Answers section (Class 12 exemplar PDFs)
    if 'ANSWERS' in text:
        all_questions = parse_answers_section(text, all_questions)

    return all_questions


def parse_class12_exercises(lines):
    """Parse Class 12 exemplar structure (I. MCQ Type-I, II. MCQ Type-II, III. Short Answer, etc.)"""
    questions = []
    current_section = None
    current_num = None
    current_text = ''
    current_options = []
    current_type = 'SHORT_ANSWER'

    def save_current():
        nonlocal current_num, current_text, current_options, current_type
        if current_num is not None and current_text.strip():
            questions.append({
                'question_num': current_num,
                'question_text': current_text.strip(),
                'question_type': current_type,
                'options': current_options,
            })
        current_num = None
        current_text = ''
        current_options = []

    def determine_section_type(line):
        """Determine the section type from the header line."""
        if 'Multiple Choice Questions' in line:
            if 'Type-II' in line:
                return 'MCQ_TYPE2'
            return 'MCQ_TYPE1'
        elif 'Short Answer' in line:
            return 'SHORT_ANSWER'
        elif 'Long Answer' in line:
            return 'LONG_ANSWER'
        return None

    for idx, line in enumerate(lines):
        decoded = decode_unicode_text(line).strip()

        # Check for section headers
        section_type = determine_section_type(decoded)
        if section_type:
            save_current()
            current_section = section_type
            if section_type in ('MCQ_TYPE1', 'MCQ_TYPE2'):
                current_type = 'MCQ'
            elif section_type == 'SHORT_ANSWER':
                current_type = 'SHORT_ANSWER'
            elif section_type == 'LONG_ANSWER':
                current_type = 'LONG_ANSWER'
            continue

        # Check for question number
        q_match = re.match(r'^(\d+)\.\s+(.+)$', decoded)
        if q_match and current_section:
            save_current()
            current_num = int(q_match.group(1))
            current_text = q_match.group(2).strip()
            current_options = []

            # If MCQ, try to parse options
            if current_type == 'MCQ':
                opts, _ = parse_options(lines, idx + 1, len(lines))
                if opts:
                    current_options = opts
        elif current_num is not None and decoded and not is_junk(decoded):
            # Check if this is an option (A/B/C/D or i/ii/iii/iv)
            opt_match = OPTION_PATTERN.match(decoded)
            if not opt_match:
                opt_match = OPTION_PATTERN_ROMAN.match(decoded)
            if opt_match and current_type == 'MCQ':
                current_options.append(opt_match.group(2).strip())
            elif not decoded.startswith(('ANSWERS', 'UNIT-', 'EXEMPLAR')):
                current_text += ' ' + decoded

    # Save last
    save_current()
    return questions


def parse_answers_section(text, all_questions):
    """Parse the Answers section from Class 12 exemplar PDFs and match answers to questions.
    
    The Answers section has:
    - I. Multiple Choice Questions (Type-I): 1. (ii), 2. (ii), 3. (ii)...
    - II. Multiple Choice Questions (Type-II): 38. (iii), (iv)...
    - III. Short Answer Type: 54. The liquids and gases have...
    """
    lines = text.split('\n')
    
    # Find ANSWERS section
    answers_start = None
    for i, line in enumerate(lines):
        if 'ANSWERS' in line.strip():
            answers_start = i
            break
    
    if answers_start is None:
        return all_questions  # No answers section found
    
    # Parse MCQ answer keys (e.g., "1. (ii)  2. (ii)  3. (ii)")
    mcq_answers = {}
    short_answers = {}
    
    in_mcq_section = False
    in_short_section = False
    
    for i in range(answers_start, len(lines)):
        line = lines[i].strip()
        
        if 'Multiple Choice Questions' in line:
            in_mcq_section = True
            in_short_section = False
            continue
        elif 'Short Answer' in line:
            in_mcq_section = False
            in_short_section = True
            continue
        elif 'Long Answer' in line or 'Activities' in line:
            in_mcq_section = False
            in_short_section = False
            continue
        
        if in_mcq_section:
            # Parse MCQ answers: "1. (ii)  2. (ii)  3. (ii)"
            mcq_matches = re.findall(r'(\d+)\.\s*\(([ivx]+)\)', line)
            for q_num, answer in mcq_matches:
                mcq_answers[int(q_num)] = answer
        
        elif in_short_section:
            # Parse short answers: "54. The liquids and gases have..."
            sa_match = re.match(r'^(\d+)\.\s+(.+)$', line)
            if sa_match:
                q_num = int(sa_match.group(1))
                answer_text = sa_match.group(2).strip()
                # Collect continuation lines
                j = i + 1
                while j < len(lines) and j < i + 10:
                    next_line = lines[j].strip()
                    if re.match(r'^\d+\.\s+', next_line):
                        break
                    if next_line and not next_line.startswith(('Exemplar', 'UNIT', '14', '15', '16')):
                        answer_text += ' ' + next_line
                    j += 1
                short_answers[q_num] = answer_text
    
    # Match answers to questions
    # Map roman numerals to option letters: (i)->A, (ii)->B, (iii)->C, (iv)->D
    roman_to_letter = {'i': 'A', 'ii': 'B', 'iii': 'C', 'iv': 'D', 'v': 'E'}
    
    # Track question numbers by type
    mcq_count = 0
    short_count = 0
    
    for q in all_questions:
        if q.get('is_example'):
            continue  # Examples already have answers
        
        if q['question_type'] == 'MCQ':
            mcq_count += 1
            if mcq_count in mcq_answers:
                roman = mcq_answers[mcq_count]
                letter = roman_to_letter.get(roman, roman)
                # Set answer to the option letter
                q['answer_key'] = letter
                # Set explanation if available
                q['answer_explanation'] = f'Answer: Option ({roman})'
        
        elif q['question_type'] == 'SHORT_ANSWER':
            short_count += 1
            if short_count in short_answers:
                q['answer_key'] = ''
                q['answer_explanation'] = short_answers[short_count]
    
    return all_questions


def map_to_schema(questions, ch):
    """Map to exemplar JSON schema."""
    cls = int(ch['class'])
    subject_display = ch['subject'].title()

    mapped = []
    for i, q in enumerate(questions):
        prefix = 'EX' if q.get('is_example') else 'Q'
        question_id = f'NCERT-EXEMPLAR-M{cls}-CH{ch["chapter_number"]}-{prefix}{i+1}'

        mapped.append({
            'question_id': question_id,
            'board': 'NCERT',
            'class_level': cls,
            'subject': subject_display,
            'book': f'Exemplar Problems - {subject_display}',
            'chapter_number': ch['chapter_number'],
            'chapter_title': ch['chapter_title'],
            'language': 'English',
            'source_kind': 'EXEMPLAR',
            'question_type': q['question_type'],
            'question_text': q['question_text'],
            'options': q.get('options', []),
            'answer_key': q.get('answer_key', ''),
            'answer_explanation': q.get('answer_explanation', ''),
            'difficulty': q.get('difficulty', 'medium'),
            'blooms_level': 'understand',
            'source_file': ch['file'],
            'source_pages': [],
            'image_required': 'Fig.' in q.get('question_text', ''),
            'figure_ref': [],
            'provenance_excerpt': q['question_text'][:150],
            'review_state': 'approved',
            'qa_flags': [],
            'is_example': q.get('is_example', False),
        })
    return mapped


def process_chapter(ch, dry_run=False):
    pdf_path = os.path.join(EXEMPLAR_DIR, ch['file'])

    if not os.path.exists(pdf_path):
        print(f'  ⏭  {ch["file"]}: PDF not found')
        return None

    try:
        text = extract_text_from_pdf(pdf_path)
    except Exception as e:
        print(f'  ❌ {ch["file"]}: {e}')
        return None

    if len(text) < 500:
        print(f'  ⚠️  {ch["file"]}: Text too short ({len(text)} chars)')
        return None

    questions = extract_questions_from_text(text, ch)

    if not questions:
        print(f'  ⚠️  {ch["file"]}: No questions parsed')
        return None

    mapped = map_to_schema(questions, ch)

    type_counts = {}
    example_count = 0
    for q in mapped:
        type_counts[q['question_type']] = type_counts.get(q['question_type'], 0) + 1
        if q.get('is_example'):
            example_count += 1

    type_str = ', '.join(f'{k}: {v}' for k, v in sorted(type_counts.items()))
    print(f'  ✅ {ch["file"]}: {len(mapped)} questions ({type_str}, {example_count} examples)')

    if not dry_run:
        output_file = f'{ch["class"]}-{ch["subject"]}-ch{ch["chapter_number"]}.json'
        output_path = os.path.join(EXEMPLAR_DIR, output_file)
        with open(output_path, 'w') as f:
            json.dump(mapped, f, indent=2)
            f.write('\n')

    return {'total': len(mapped), 'examples': example_count, 'types': type_counts}


def main():
    args = sys.argv[1:]
    dry_run = '--dry-run' in args
    class_filter = next((a.split('=')[1] for a in args if a.startswith('--class=')), None)
    subject_filter = next((a.split('=')[1] for a in args if a.startswith('--subject=')), None)

    registry = json.load(open(REGISTRY_PATH))
    chapters = get_all_chapters(registry)
    print(f'Found {len(chapters)} chapters.\n')

    results = []
    for ch in chapters:
        if class_filter and ch['class'] != class_filter:
            continue
        if subject_filter and ch['subject'] != subject_filter:
            continue
        r = process_chapter(ch, dry_run)
        if r:
            results.append(r)

    total = sum(r['total'] for r in results)
    examples = sum(r['examples'] for r in results)
    print(f'\n{"=" * 60}')
    print(f'DONE: {len(results)} chapters, {total} questions ({examples} examples)')
    print(f'{"=" * 60}')


if __name__ == '__main__':
    main()
