# Design Spec: Audit Agent Enhancements (Phase 2)

## Goal
Reduce the remaining ~7,300 audit errors in the Shiksha Sathi question bank by improving data cleaning, JSON parsing robustness, and implementing a web-verified subject expert fallback.

## 1. Data Cleaning & Normalization (Preprocessing)
To improve LLM performance and reduce "fixed" questions that still contain noise, a `clean_question_data` function will be added.

### Regex Stripping Patterns
- **Legacy Metadata**: `r"(EEA BE|ACCA EE|AEBAC|AEAC|CA AE|EEE AD AEA|UNIT \d+)"`
- **Date Stamps**: `r"\d{2}-\d{2}-\d{4}"`
- **Corrupted OCR**: `r"(\u221e|\u222b|})"` when not part of a valid math expression.
- **Page Markers**: `r"(FRACTIONS AND DECIMALS \d+|Questions \d+ to \d+)"`

## 2. Robust JSON Parsing (Safety Net)
Instead of marking a question as "error" on `json.loads` failure, the agent will attempt:
1. **Auto-Closure**: Check for missing `]` or `}` and append them.
2. **Regex Extraction**: Use `re.search` to find `"status": "(.*?)"` and `"recommendation": "(.*?)"`.
3. **Fallback to Rule-Based**: If parsing fails completely, call `apply_rule_based_fixes` on the *original* question. If it returns any fixes, mark as `needs_fix_fallback`.

## 3. Web-Verified Subject Expert Fallback
When a question has no valid answer (empty or placeholder), the agent will trigger a targeted search.

### Process
1. **Identify**: Detect `empty_answer` or placeholder like "See NCERT".
2. **Search**: `crawl4ai` search with query: `site:learncbse.in OR site:doubtnut.com "Class [N] [Question Text]"`.
3. **Extraction**:
   - Extract text following "Answer:" or "Solution:".
   - Validate that the extracted answer is not another placeholder.
4. **Integration**: Update the `auto_fixes` with the web-verified answer.

## 4. Orphan Mapping
A one-time mapping script will be run to assign the 56 orphan questions to Class 10 (Math/Science) based on keyword analysis.

## 5. Junk Answer Blacklist
Explicitly detect and flag nonsensical answers like "alternating current" in non-physics contexts.

## Success Criteria
- Audit coverage: 100% for all classes.
- Error rate: < 5% of total questions (target < 500 errors total).
- No questions with legacy metadata strings in the final `fixed` text.
