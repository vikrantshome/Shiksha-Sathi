#!/usr/bin/env python3
"""
Scrape remaining Class 11-12 Math MCQ answers from Shaalaa.com.
Uses position-based matching within each chapter.
"""

import asyncio
import json
import os
import re
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig

EXEMPLAR_DIR = 'doc/Exemplar'

CHAPTER_MAP = {
    ('11', 4): 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-mathematics-english-class-11-chapter-4-principle-of-mathematical-induction_7111',
    ('11', 7): 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-mathematics-english-class-11-chapter-7-permutations-and-combinations_7114',
    ('11', 8): 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-mathematics-english-class-11-chapter-8-binomial-theorem_7115',
    ('11', 13): 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-mathematics-english-class-11-chapter-13-limits-and-derivatives_7120',
    ('11', 16): 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-mathematics-english-class-11-chapter-16-probability_7123',
    ('12', 7): 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-mathematics-english-class-12-chapter-7-integrals_6995',
    ('12', 10): 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-mathematics-english-class-12-chapter-10-vector-algebra_6998',
    ('12', 11): 'https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-mathematics-english-class-12-chapter-11-three-dimensional-geometry_6999',
}


async def scrape_page(url, crawler):
    try:
        result = await crawler.arun(url, config=CrawlerRunConfig(page_timeout=15000))
        if result and result.markdown:
            return result.markdown.raw_markdown
    except:
        pass
    return None


def extract_answers(markdown, mcq_texts):
    """Extract answers by matching MCQ text and finding answer pattern."""
    answers = {}
    
    for i, q_text in enumerate(mcq_texts):
        q_clean = ' '.join(q_text.lower().split())[:80]
        # Find question in markdown
        idx = markdown.lower().find(q_clean[:40])
        if idx < 0:
            continue
        
        # Look at next 500 chars for answer
        block = markdown[idx:idx+800].lower()
        
        # Answer patterns
        patterns = [
            r'correct\s+(?:option|answer)\s+is\s*\(([a-d])\)',
            r'\(([a-d])\)\s+is\s+the\s+correct',
            r'hence\s*\(([a-d])\)',
            r'therefore\s*\(([a-d])\)',
            r'option\s*\(([a-d])\)\s+is\s+correct',
        ]
        for p in patterns:
            m = re.search(p, block)
            if m:
                answers[i] = m.group(1).upper()
                break
    
    return answers


async def process_chapter(ch_key, json_path, crawler):
    """Process one chapter."""
    if not os.path.exists(json_path):
        return 0, 0
    
    with open(json_path) as f:
        data = json.load(f)
    
    mcqs = [q for q in data if isinstance(q, dict) and q.get('question_type') == 'MCQ' and not q.get('answer_key')]
    if not mcqs:
        return 0, 0
    
    # Try scraping
    url = CHAPTER_MAP.get(ch_key)
    if not url:
        return 0, len(mcqs)
    
    markdown = await scrape_page(url, crawler)
    if not markdown:
        return 0, len(mcqs)
    
    mcq_texts = [q.get('question_text', '') for q in mcqs]
    answers = extract_answers(markdown, mcq_texts)
    
    matched = 0
    for i, q in enumerate(mcqs):
        if i in answers:
            q['answer_key'] = answers[i]
            q['answer_explanation'] = f'Answer: Option ({answers[i].lower()})'
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
        
        for ch_key, url in CHAPTER_MAP.items():
            cls, ch = ch_key
            json_path = os.path.join(EXEMPLAR_DIR, f'{cls}-mathematics-ch{ch}.json')
            
            matched, remaining = await process_chapter(ch_key, json_path, crawler)
            total_matched += matched
            total_remaining += remaining
            
            basename = os.path.basename(json_path)
            print(f'{basename}: {matched} matched, {remaining} remaining')
    
    print(f'\nTotal: {total_matched} matched, {total_remaining} remaining')


if __name__ == '__main__':
    asyncio.run(main())
