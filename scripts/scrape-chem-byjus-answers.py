#!/usr/bin/env python3
"""
Scrape Chemistry MCQ answers from BYJU'S exemplar solution pages.
BYJU'S has answers directly in the markdown output.
"""

import asyncio, json, os, re
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig

EXEMPLAR_DIR = 'doc/Exemplar'

# BYJU'S URLs for Class 11-12 Chemistry exemplar
BYJUS_URLS = {
    '11-chemistry-ch2': 'https://byjus.com/ncert-exemplar-class-11-chemistry-chapter-2-structure-of-atom/',
    '11-chemistry-ch5': 'https://byjus.com/ncert-exemplar-class-11-chemistry-chapter-5-states-of-matter/',
    '11-chemistry-ch6': 'https://byjus.com/ncert-exemplar-class-11-chemistry-chapter-6-thermodynamics/',
    '11-chemistry-ch7': 'https://byjus.com/ncert-exemplar-class-11-chemistry-chapter-7-equilibrium/',
    '11-chemistry-ch8': 'https://byjus.com/ncert-exemplar-class-11-chemistry-chapter-8-redox-reactions/',
    '12-chemistry-ch1': 'https://byjus.com/ncert-exemplar-class-12-chemistry-chapter-1-solid-state/',
    '12-chemistry-ch2': 'https://byjus.com/ncert-exemplar-class-12-chemistry-chapter-2-solutions/',
    '12-chemistry-ch3': 'https://byjus.com/ncert-exemplar-class-12-chemistry-chapter-3-electrochemistry/',
    '12-chemistry-ch4': 'https://byjus.com/ncert-exemplar-class-12-chemistry-chapter-4-chemical-kinetics/',
    '12-chemistry-ch5': 'https://byjus.com/ncert-exemplar-class-12-chemistry-chapter-5-surface-chemistry/',
    '12-chemistry-ch6': 'https://byjus.com/ncert-exemplar-class-12-chemistry-chapter-6-general-principles-and-processes-of-isolation-of-elements/',
    '12-chemistry-ch9': 'https://byjus.com/ncert-exemplar-class-12-chemistry-chapter-9-coordination-compounds/',
    '12-chemistry-ch10': 'https://byjus.com/ncert-exemplar-class-12-chemistry-chapter-10-haloalkanes-and-haloarenes/',
    '12-chemistry-ch11': 'https://byjus.com/ncert-exemplar-class-12-chemistry-chapter-11-alcohols-phenols-and-ethers/',
    '12-chemistry-ch14': 'https://byjus.com/ncert-exemplar-class-12-chemistry-chapter-14-biomolecules/',
}


async def scrape(url, crawler):
    try:
        result = await crawler.arun(url, config=CrawlerRunConfig(page_timeout=20000, word_count_threshold=100, delay_before_return_html=3))
        return result.markdown.raw_markdown if result and result.markdown else None
    except:
        return None


def extract_byjus_answers(markdown):
    """Extract MCQ answers from BYJU'S markdown.
    
    BYJU'S format: Question text followed by "Correct Answer: Option (X)" or similar patterns.
    """
    answers = []
    
    # Split by question blocks - look for answer patterns
    # Pattern 1: "Answer: Option (C)" or "Correct Answer: (C)"
    answer_patterns = [
        r'[Cc]orrect\s+[Aa]nswer.*?:\s*\(?([a-dA-D])\)?',
        r'[Aa]nswer.*?:\s*Option\s*\(?([a-dA-D])\)?',
        r'Option\s*\(?([a-dA-D])\)?\s+is\s+(the\s+)?[Cc]orrect',
        r'The\s+correct\s+option\s+is\s*\(?([a-dA-D])\)?',
        r'[Cc]orrect\s+answer\s+is\s*Option\s*\(?([a-dA-D])\)?',
        r'∴\s*\(?([a-dA-D])\)?\s+is\s+the\s+correct\s+option',
        r'[Hh]ence\s+option\s*\(?([a-dA-D])\)?\s+is\s+correct',
    ]
    
    # Split by numbered questions
    questions = re.split(r'\n\s*###\s+Q\.?\s*\d+\.?\s*', markdown)
    
    for q_block in questions:
        answer = None
        for pattern in answer_patterns:
            m = re.search(pattern, q_block)
            if m:
                answer = m.group(1).upper()
                break
        answers.append(answer)
    
    return [a for a in answers if a is not None]


def match_and_answer(json_path, byjus_answers, mcq_offset=0):
    """Match BYJU'S answers to unanswered MCQs in JSON file."""
    if not os.path.exists(json_path):
        return 0, 0
    
    with open(json_path) as f:
        data = json.load(f)
    
    if not isinstance(data, list):
        return 0, 0
    
    unanswered = [(i, q) for i, q in enumerate(data) 
                  if isinstance(q, dict) and q.get('question_type') == 'MCQ' and not q.get('answer_key')]
    
    matched = 0
    for idx, (data_idx, q) in enumerate(unanswered):
        answer_idx = idx + mcq_offset
        if answer_idx < len(byjus_answers):
            answer = byjus_answers[answer_idx]
            q['answer_key'] = answer
            q['answer_explanation'] = f'Answer: Option ({answer.lower()})'
            matched += 1
    
    if matched > 0:
        with open(json_path, 'w') as f:
            json.dump(data, f, indent=2)
            f.write('\n')
    
    return matched, len(unanswered) - matched


async def process_chapter(fname, url, crawler):
    json_path = os.path.join(EXEMPLAR_DIR, f'{fname}.json')
    
    if not os.path.exists(json_path):
        return 0, 0
    
    # Check if there are unanswered MCQs
    with open(json_path) as f:
        data = json.load(f)
    
    mcqs = [q for q in data if isinstance(q, dict) and q.get('question_type') == 'MCQ' and not q.get('answer_key')]
    if not mcqs:
        return 0, 0
    
    markdown = await scrape(url, crawler)
    if not markdown:
        return 0, len(mcqs)
    
    byjus_answers = extract_byjus_answers(markdown)
    if not byjus_answers:
        return 0, len(mcqs)
    
    matched, remaining = match_and_answer(json_path, byjus_answers)
    return matched, remaining


async def main():
    async with AsyncWebCrawler() as crawler:
        total_matched = 0
        total_remaining = 0
        
        for fname, url in BYJUS_URLS.items():
            matched, remaining = await process_chapter(fname, url, crawler)
            total_matched += matched
            total_remaining += remaining
            print(f'{fname}.json: {matched} answered, {remaining} remaining')
        
        print(f'\nTotal: {total_matched} answered, {total_remaining} remaining')


if __name__ == '__main__':
    asyncio.run(main())
