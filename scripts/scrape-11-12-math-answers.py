#!/usr/bin/env python3
"""
Scrape Class 11-12 Math exemplar answers from Shaalaa.com.

For MCQs that couldn't be answered manually, scrape the solution pages
from Shaalaa.com and extract the correct answer.

Usage:
    .venv/bin/python scripts/scrape-11-12-math-answers.py
"""

import asyncio
import json
import os
import re
import sys
from difflib import SequenceMatcher

from crawl4ai import AsyncWebCrawler, CrawlerRunConfig

EXEMPLAR_DIR = 'doc/Exemplar'

# Shaalaa URL patterns for Class 11-12 Math exemplar
SHAALAA_BASE = "https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-mathematics-english-class-{cls}-chapter-{chapter_slug}_{id}"

# Known Shaalaa chapter IDs for Class 11-12 Math
CHAPTER_MAP = {
    ('11', 1): {'slug': '1-sets', 'id': '7108'},
    ('11', 2): {'slug': '2-relations-and-functions', 'id': '7109'},
    ('11', 3): {'slug': '3-trigonometric-functions', 'id': '7110'},
    ('11', 4): {'slug': '4-principle-of-mathematical-induction', 'id': '7111'},
    ('11', 5): {'slug': '5-complex-numbers-and-quadratic-equations', 'id': '7112'},
    ('11', 6): {'slug': '6-linear-inequalities', 'id': '7113'},
    ('11', 7): {'slug': '7-permutations-and-combinations', 'id': '7114'},
    ('11', 8): {'slug': '8-binomial-theorem', 'id': '7115'},
    ('11', 9): {'slug': '9-sequence-and-series', 'id': '7116'},
    ('11', 10): {'slug': '10-straight-lines', 'id': '7117'},
    ('11', 11): {'slug': '11-conic-sections', 'id': '7118'},
    ('11', 12): {'slug': '12-introduction-to-three-dimensional-geometry', 'id': '7119'},
    ('11', 13): {'slug': '13-limits-and-derivatives', 'id': '7120'},
    ('11', 14): {'slug': '14-mathematical-reasoning', 'id': '7121'},
    ('11', 15): {'slug': '15-statistics', 'id': '7122'},
    ('11', 16): {'slug': '16-probability', 'id': '7123'},
    ('12', 1): {'slug': '1-relations-and-functions', 'id': '6989'},
    ('12', 2): {'slug': '2-inverse-trigonometric-functions', 'id': '6990'},
    ('12', 3): {'slug': '3-matrices', 'id': '6991'},
    ('12', 4): {'slug': '4-determinants', 'id': '6992'},
    ('12', 5): {'slug': '5-continuity-and-differentiability', 'id': '6993'},
    ('12', 6): {'slug': '6-application-of-derivatives', 'id': '6994'},
    ('12', 7): {'slug': '7-integrals', 'id': '6995'},
    ('12', 8): {'slug': '8-application-of-integrals', 'id': '6996'},
    ('12', 9): {'slug': '9-differential-equations', 'id': '6997'},
    ('12', 10): {'slug': '10-vector-algebra', 'id': '6998'},
    ('12', 11): {'slug': '11-three-dimensional-geometry', 'id': '6999'},
    ('12', 12): {'slug': '12-linear-programming', 'id': '7000'},
    ('12', 13): {'slug': '13-probability', 'id': '7001'},
}


def clean_text(text):
    """Clean extracted text."""
    text = re.sub(r'[\uf000-\uf8ff]', '', text)
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()


def text_similarity(text1, text2):
    """Calculate text similarity ratio."""
    t1 = clean_text(text1).lower()[:200]
    t2 = clean_text(text2).lower()[:200]
    return SequenceMatcher(None, t1, t2).ratio()


async def scrape_page(url, crawler):
    """Scrape a single page."""
    try:
        result = await crawler.arun(
            url,
            config=CrawlerRunConfig(page_timeout=15000, word_count_threshold=100)
        )
        if result and result.markdown and result.markdown.raw_markdown:
            return result.markdown.raw_markdown
        return None
    except Exception:
        return None


def extract_mcq_answers(markdown):
    """Extract MCQ answers from Shaalaa chapter page.
    
    Shaalaa format: "Q 1. | Page 1\nQuestion text\nSolution:\nThe correct answer is (B)..."
    """
    answers = {}
    
    # Find all MCQ blocks
    # Pattern: Q 1. | Page X followed by solution with answer letter
    q_blocks = re.findall(
        r'Q\s*(\d+)\s*\|\s*Page\s*\d+\s*\n(.+?)(?=Q\s*\d+\s*\||$)',
        markdown, re.DOTALL
    )
    
    for q_num_str, block in q_blocks:
        q_num = int(q_num_str)
        block_lower = block.lower()
        
        # Look for answer patterns
        # "correct option is (b)" or "correct answer is (b)"
        match = re.search(r'correct\s+(?:option|answer)\s+is\s*\(([a-d])\)', block_lower)
        if match:
            answers[q_num] = match.group(1).upper()
            continue
        
        # "(b) is the correct option"
        match = re.search(r'\(([a-d])\)\s+is\s+the\s+correct\s+(?:option|answer)', block_lower)
        if match:
            answers[q_num] = match.group(1).upper()
            continue
        
        # "hence (c) is the correct answer"
        match = re.search(r'hence\s*\(([a-d])\)\s+is\s+the\s+correct', block_lower)
        if match:
            answers[q_num] = match.group(1).upper()
            continue
        
        # "option (a) is correct"
        match = re.search(r'option\s*\(([a-d])\)\s+is\s+correct', block_lower)
        if match:
            answers[q_num] = match.group(1).upper()
            continue
        
        # "therefore (d) is correct"
        match = re.search(r'therefore\s*\(([a-d])\)\s+is\s+correct', block_lower)
        if match:
            answers[q_num] = match.group(1).upper()
            continue
    
    return answers


async def process_chapter(cls, chapter_num, unanswered_mcqs, crawler, dry_run=False):
    """Process a single chapter: scrape Shaalaa, match answers."""
    key = (cls, chapter_num)
    chapter_info = CHAPTER_MAP.get(key)
    if not chapter_info:
        return 0, 0
    
    url = f"https://www.shaalaa.com/textbook-solutions/c/ncert-exemplar-solutions-mathematics-english-class-{cls}-chapter-{chapter_info['slug']}_{chapter_info['id']}"
    
    markdown = await scrape_page(url, crawler)
    if not markdown:
        return 0, len(unanswered_mcqs)
    
    # Extract answers from Shaalaa
    shaalaa_answers = extract_mcq_answers(markdown)
    
    if not shaalaa_answers:
        return 0, len(unanswered_mcqs)
    
    # Match by question text similarity
    matched = 0
    for mcq in unanswered_mcqs:
        q_text = clean_text(mcq.get('question_text', '')).lower()[:100]
        
        # Try position-based matching first
        mcq_idx = unanswered_mcqs.index(mcq)
        if (mcq_idx + 1) in shaalaa_answers:
            answer = shaalaa_answers[mcq_idx + 1]
            if not dry_run:
                mcq['answer_key'] = answer
                mcq['answer_explanation'] = f'Answer: Option ({answer.lower()})'
            matched += 1
            continue
    
    return matched, len(unanswered_mcqs) - matched


async def main():
    args = sys.argv[1:]
    dry_run = '--dry-run' in args
    
    async with AsyncWebCrawler() as crawler:
        total_matched = 0
        total_remaining = 0
        
        for cls in ['11', '12']:
            for ch_file in sorted(os.listdir(EXEMPLAR_DIR)):
                if not ch_file.startswith(f'{cls}-mathematics-ch') or not ch_file.endswith('.json'):
                    continue
                
                path = os.path.join(EXEMPLAR_DIR, ch_file)
                with open(path) as f:
                    data = json.load(f)
                
                if not isinstance(data, list):
                    continue
                
                # Find unanswered MCQs
                unanswered = [q for q in data 
                             if isinstance(q, dict) 
                             and q.get('question_type') == 'MCQ' 
                             and not q.get('answer_key')]
                
                if not unanswered:
                    continue
                
                ch_match = re.match(r'(\d+)-mathematics-ch(\d+)\.json', ch_file)
                if not ch_match:
                    continue
                
                chapter_num = int(ch_match.group(2))
                
                matched, remaining = await process_chapter(
                    cls, chapter_num, unanswered, crawler, dry_run
                )
                total_matched += matched
                total_remaining += remaining
                
                mode = '[DRY] ' if dry_run else ''
                print(f'{mode}{ch_file}: {matched} matched, {remaining} remaining')
    
    print(f'\n{"=" * 60}')
    mode = 'DRY RUN: ' if dry_run else ''
    print(f'{mode}Matched: {total_matched}, Still remaining: {total_remaining}')
    print(f'{"=" * 60}')


if __name__ == '__main__':
    asyncio.run(main())
