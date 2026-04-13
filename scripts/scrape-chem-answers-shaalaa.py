#!/usr/bin/env python3
"""Scrape remaining Chemistry MCQ answers from Shaalaa.com."""

import asyncio, json, os, re
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig

EXEMPLAR_DIR = 'doc/Exemplar'

# Shaalaa URLs for Class 11-12 Chemistry exemplar
CHEM_URLS = {
    '11-chemistry-ch2': 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-chemistry-english-class-11-chapter-2-structure-of-atom_7068',
    '11-chemistry-ch5': 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-chemistry-english-class-11-chapter-5-states-of-matter_7071',
    '11-chemistry-ch6': 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-chemistry-english-class-11-chapter-6-thermodynamics_7072',
    '11-chemistry-ch7': 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-chemistry-english-class-11-chapter-7-equilibrium_7073',
    '11-chemistry-ch8': 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-chemistry-english-class-11-chapter-8-redox-reactions_7074',
    '12-chemistry-ch1': 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-chemistry-english-class-12-chapter-1-solid-state_6987',
    '12-chemistry-ch2': 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-chemistry-english-class-12-chapter-2-solutions_6988',
    '12-chemistry-ch3': 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-chemistry-english-class-12-chapter-3-electrochemistry_6989',
    '12-chemistry-ch4': 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-chemistry-english-class-12-chapter-4-chemical-kinetics_6990',
    '12-chemistry-ch5': 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-chemistry-english-class-12-chapter-5-surface-chemistry_6991',
    '12-chemistry-ch6': 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-chemistry-english-class-12-chapter-6-general-principles-and-processes-of-isolation-of-elements_6992',
    '12-chemistry-ch9': 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-chemistry-english-class-12-chapter-9-coordination-compounds_6995',
    '12-chemistry-ch10': 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-chemistry-english-class-12-chapter-10-haloalkanes-and-haloarenes_6996',
    '12-chemistry-ch11': 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-chemistry-english-class-12-chapter-11-alcohols-phenols-and-ethers_6997',
    '12-chemistry-ch14': 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-chemistry-english-class-12-chapter-14-biomolecules_7000',
}


async def scrape(url, crawler):
    try:
        result = await crawler.arun(url, config=CrawlerRunConfig(page_timeout=15000))
        return result.markdown.raw_markdown if result and result.markdown else None
    except:
        return None


def find_answer(markdown, q_text, mcq_idx):
    """Try to find answer by position-based matching first, then text similarity."""
    q_clean = ' '.join(q_text.lower().split())[:60]
    
    # Find question in markdown
    idx = markdown.lower().find(q_clean[:30])
    if idx >= 0:
        block = markdown[idx:idx+600].lower()
        patterns = [
            r'correct\s+(?:option|answer)\s+is\s*\(([a-d])\)',
            r'\(([a-d])\)\s+is\s+the\s+correct',
            r'hence\s*\(([a-d])\)',
            r'therefore\s*\(([a-d])\)',
            r'option\s*\(([a-d])\)\s+is\s+correct',
            r'answer\s*\:\s*\(?([a-d])\)?',
        ]
        for p in patterns:
            m = re.search(p, block)
            if m:
                return m.group(1).upper()
    
    return None


async def process_chapter(json_path, url, crawler):
    if not os.path.exists(json_path):
        return 0, 0
    
    with open(json_path) as f:
        data = json.load(f)
    
    mcqs = [q for q in data if isinstance(q, dict) and q.get('question_type') == 'MCQ' and not q.get('answer_key')]
    if not mcqs:
        return 0, 0
    
    markdown = await scrape(url, crawler)
    if not markdown:
        return 0, len(mcqs)
    
    matched = 0
    for i, q in enumerate(mcqs):
        text = q.get('question_text', '')
        answer = find_answer(markdown, text, i)
        if answer:
            q['answer_key'] = answer
            q['answer_explanation'] = f'Answer: Option ({answer.lower()})'
            matched += 1
    
    if matched > 0:
        with open(json_path, 'w') as f:
            json.dump(data, f, indent=2)
            f.write('\n')
    
    return matched, len(mcqs) - matched


async def main():
    async with AsyncWebCrawler() as crawler:
        total_matched = 0
        total_remaining = 0
        
        for fname, url in CHEM_URLS.items():
            json_path = os.path.join(EXEMPLAR_DIR, f'{fname}.json')
            matched, remaining = await process_chapter(json_path, url, crawler)
            total_matched += matched
            total_remaining += remaining
            print(f'{fname}.json: {matched} matched, {remaining} remaining')
        
        print(f'\nTotal: {total_matched} matched, {total_remaining} remaining')


if __name__ == '__main__':
    asyncio.run(main())
