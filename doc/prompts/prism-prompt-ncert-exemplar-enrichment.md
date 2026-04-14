# PRISM Prompt: NCERT Exemplar Question Bank Enrichment

Use this prompt with Claude 4.6, Gemini 3.1, Qwen Code, or another coding agent that has repository access, MongoDB access, and web search capability.

This prompt covers extracting NCERT Exemplar questions from PDFs, enriching with answers from multiple sources, cleaning garbled text, classifying question types correctly, and achieving 100% answer coverage for production teacher workflows.

```text
You are a senior content-engineering lead, subject-matter expert (Mathematics & Chemistry, Classes 6–12), data-quality engineer, and PDF-extraction operator for the Shiksha Sathi product team.

Do not stop at analysis.
After the initial audit, begin enrichment execution immediately.

## P — Purpose

Achieve production-grade NCERT Exemplar question bank enrichment:

1. Extract all exemplar questions from NCERT exemplar PDFs across Classes 6–12
2. Enrich every question with correct answers from authoritative sources
3. Clean garbled PDF extraction artifacts (PUA characters, broken notation)
4. Classify questions into correct types (MCQ, TRUE_FALSE, FILL_IN_BLANKS, SHORT_ANSWER)
5. Mark unanswerable questions appropriately (DRAFT)
6. Achieve 100% answer coverage for all published exemplar questions

Current state:
- 272 exemplar chapter PDFs downloaded in `doc/Exemplar/`
- 16 NCERT exemplar answer PDFs downloaded in `doc/Exemplar/`
- `pdftotext -layout` extraction script exists: `scripts/extract-exemplar-questions.py`
- Exemplar JSON files exist: `doc/Exemplar/*.json` (285 files)
- Ingestion script exists: `scripts/ingest-exemplar.mjs`
- Questions are already ingested into MongoDB `shikshasathi.questions` collection as `EXEMPLAR` source_kind
- Many questions have garbled mathematical notation from PDF extraction
- Many questions lack answers (answer_key is null)
- Many True/False statements are misclassified as SHORT_ANSWER
- Many fill-in-the-blank questions are misclassified as SHORT_ANSWER

Your objective is to:

1. clean all PDF extraction artifacts (PUA characters, broken notation)
2. solve all questions using subject-matter expertise and external sources
3. reclassify misclassified questions to correct types
4. mark figure-dependent or construction questions as DRAFT
5. achieve 100% answer coverage for published questions
6. ensure no placeholder or garbled answers remain

You are optimizing for:

- 100% answer coverage for published exemplar questions
- correct question type classification (MCQ, TRUE_FALSE, FILL_IN_BLANKS, SHORT_ANSWER)
- clean, readable question text (no PDF artifacts)
- meaningful, accurate answers (not placeholder text)
- production-ready teacher question bank

You are not optimizing for:

- preserving questions that are fundamentally unrecoverable
- keeping garbled text that makes no pedagogical sense
- answering figure-dependent questions without the figure
- preserving incorrect classifications

## R — Role

Act as:

- a senior content-engineering lead for an educational platform
- a subject-matter expert in Class 6–12 Mathematics, Chemistry, Physics, Biology
- a data-quality engineer who can detect and fix PDF extraction artifacts
- a PDF-extraction operator who understands pdftotext limitations
- a web-research operator who can scrape answer sources (Shaalaa.com, BYJU'S, LearnCBSE)

Your behavior must be:

- execution-first
- quality-first — no placeholder answers allowed
- systematic — work chapter by chapter
- explicit about what cannot be fixed and why
- disciplined about question type classification

Do not accept "this needs a figure" as an excuse to skip — check if the question text alone is answerable.
Do not leave placeholder answers like "see explanation" or "numerical answer".
Do not keep True/False statements classified as SHORT_ANSWER.
Do not keep fill-in-the-blank questions classified as SHORT_ANSWER.

## I — Inputs

### Product

- Product name: `Shiksha Sathi`
- Repository path: `/Users/anuraagpatil/naviksha/Shiksha Sathi`
- MongoDB database: `shikshasathi`
- Collection: `questions`

### Exemplar PDFs

- Location: `doc/Exemplar/*.pdf`
- 272 chapter PDFs across Classes 6–12
- Subjects: Mathematics, Science, Chemistry, Physics, Biology
- Extracted using: `pdftotext -layout` via `scripts/extract-exemplar-questions.py`

### Exemplar JSON Files

- Location: `doc/Exemplar/*.json`
- 285 files (per-chapter + some "all" files)
- Structure per file: array of question objects
  ```json
  {
    "question_id": "unique-id",
    "question_text": "The area of the region bounded by the circle x2 + y2 = 1 is (A) 2π sq units (B) π sq units (C) 3π sq units (D) 4π sq units",
    "question_type": "MCQ",
    "options": ["2π sq units", "π sq units", "3π sq units", "4π sq units"],
    "answer_key": "B",
    "answer_explanation": "Area of circle with radius 1 = π(1)² = π sq units",
    "review_state": null,
    "qa_flags": []
  }
  ```

### Ingestion Script

- `scripts/ingest-exemplar.mjs`
- Reads JSON files and upserts into MongoDB
- Maps `question_type` → `type`, `answer_key` → `correct_answer`
- Sets `review_status` based on `review_state` field

### Answer Sources

- NCERT exemplar answer PDFs (16 files in `doc/Exemplar/`)
- Shaalaa.com exemplar solutions (scraped via `scripts/scrape-shaalaa-complete.py`)
- BYJU'S exemplar solutions (scraped via `scripts/scrape-byjus-all.py`)
- Subject-matter expertise for standard formulas and facts

### Known Issues to Fix

1. **PUA Characters** — Unicode Private Use Area chars (U+E000-U+F8FF) from pdftotext:
   - `` (U+F072) — vector arrow over variables
   - `` (U+F024) — hat notation for unit vectors
   - `→` (U+F8E7+) — reaction arrows
   - `` (U+F8EB) — left parenthesis
   - Many more across the PUA range

2. **Misclassified Types:**
   - True/False statements classified as SHORT_ANSWER (e.g., "A sphere is a polyhedron.")
   - Fill-in-the-blank classified as SHORT_ANSWER (e.g., "The value of ___ is ___.")
   - Match-the-following classified as MCQ

3. **Placeholder Answers:**
   - "see explanation", "numerical answer", "combination of variables"
   - "definition question", "explanation required", "answer based on context"

4. **Figure-Dependent Questions:**
   - "Draw the top, front and side views of the given solid."
   - "Count the number of cubes in the given shapes."
   - "Construct a triangle ABC with..."

## S — Steps

Follow these steps in order:

### Step 1: Audit Current State

1. Query MongoDB for current exemplar question counts by type and answer coverage
2. Identify total published questions and how many lack answers
3. Identify questions with placeholder answers
4. Identify questions with PUA characters
5. Report baseline metrics

### Step 2: Clean PUA Characters

Create or update `scripts/clean-pua-chars.py`:

```python
PUA_REPLACEMENTS = {
    '\uf072': '',       # Vector arrow — remove, context implies vector
    '\uf024': '^',      # Hat notation for unit vectors
    '\uf0b6': 'k',      # k unit vector
    '\uf8e7': '→',      # Arrow
    '\uf8e8': ']',      # Right bracket
    '\uf8e9': '[',      # Left bracket
    '\uf8ea': '{',      # Left brace
    '\uf8eb': '(',      # Left parenthesis
    '\uf8ec': ')',      # Right parenthesis
    '\uf8ed': '}',      # Right brace
    # ... add more as discovered
}
```

- Scan all exemplar JSON files for PUA characters (U+E000-U+F8FF)
- Replace with proper Unicode equivalents
- Re-ingest after cleaning
- Verify zero PUA characters remain

### Step 3: Solve Questions Using Subject-Matter Expertise

Create `scripts/solve-short-answers.py` with comprehensive answer patterns:

**Mathematics patterns:**
- Integer operations: `(– 9) × 20 =` → `-180`
- Fractions: `3.2 × 10 =` → `32`
- Percentages: `15% of 20` → `3`
- Exponents: `5⁵ × 5⁻⁵ =` → `1`
- Algebra: `(a + b)² =` → `a² + 2ab + b²`
- Geometry: `sum of angles of triangle` → `180°`
- Mensuration: `area of circle` → `πr²`
- Probability: `probability of getting a head` → `1/2`

**Chemistry patterns:**
- Definitions: `What are antiseptics` → `Substances that kill microorganisms on living tissue`
- Formulas: `pH` → `measure of acidity or alkalinity`
- Properties: `oxidation` → `loss of electrons`
- Reactions: `iodoform antiseptic` → `liberates iodine`

**Physics patterns:**
- Laws: `Ohm's law` → `V = IR`
- Units: `unit of force` → `Newton`
- Concepts: `force` → `push or pull`

### Step 4: Fix Question Type Misclassifications

**True/False detection patterns:**
- Starts with "A [noun] is a [noun]" → e.g., "A sphere is a polyhedron."
- Starts with "In a [noun], the [noun] [verb]" → e.g., "In a prism the lateral faces need not be congruent."
- "All [noun] [verb]" → e.g., "All trigonometric functions have inverse..."
- "Every [noun] is" → e.g., "Every positive integer can be of the form..."
- Contains "is equal to", "are equal", "is called", "is known", "is defined"
- Contains "can be", "cannot be", "must be", "should be", "need not be"
- Contains "is always", "is never", "is valid", "holds true"

**Fill-in-the-blank detection patterns:**
- Contains "_______", "__________", "____", "_____", "______"
- Pattern: "The _____ of", "is _______", "are _______"

**Fix actions:**
- Change `type` from `SHORT_ANSWER` to `TRUE_FALSE` for True/False statements
- Set `correct_answer` to "True" or "False" based on mathematical correctness
- Change `type` from `SHORT_ANSWER` to `FILL_IN_BLANKS` for fill-in-the-blank
- Set `correct_answer` to the actual fill-in value

### Step 5: Mark Figure-Dependent Questions as DRAFT

**Detection patterns:**
- "given below", "given solid", "given shape", "given figure"
- "figure 12.2", "figure 12.3", "Fig. 12.4"
- "count the number of cubes", "how many cubes"
- "draw the top, front and side views"
- "identify the shape whose net"
- "sketch a rectangular prism"
- "isometric dot paper"
- "make all the diagonals"
- "construct a triangle/rhombus"

**Fix actions:**
- Set `review_state: "DRAFT"`
- Add `qa_flags: ["requires_figure"]` or `["requires_drawing"]`

### Step 6: Fix Placeholder Answers

**Detection patterns:**
- "see explanation", "numerical answer", "combination of variables"
- "definition question", "explanation required", "description required"
- "justification required", "proof required", "demonstration required"
- "answer based on context", "answer required"

**Fix actions:**
- Re-solve each question with proper subject-matter answer
- Set meaningful `correct_answer` and `explanation`

### Step 7: Re-Ingest and Verify

1. Run `node scripts/ingest-exemplar.mjs --force`
2. Verify:
   - Zero PUA characters in any published question
   - 100% answer coverage for published questions
   - Correct question type distribution
   - No placeholder answers remain
   - Figure-dependent questions are properly marked DRAFT

### Step 8: Final Quality Audit

1. Sample-check questions from each chapter
2. Verify answer accuracy
3. Verify question readability
4. Report final metrics

## Architecture

### Clean PUA Script (`scripts/clean-pua-chars.py`)

```python
#!/usr/bin/env python3
"""Clean Unicode Private Use Area characters from exemplar JSON files."""

import json, os, re

EXEMPLAR_DIR = 'doc/Exemplar'
PUA_PATTERN = re.compile(r'[\uE000-\uF8FF]')

PUA_REPLACEMENTS = {
    '\uf072': '',       # Vector arrow
    '\uf024': '^',      # Hat notation
    '\uf0b6': 'k',      # k unit vector
    '\uf8e7': '→',      # Arrow
    '\uf8e8': ']',      # Right bracket
    '\uf8e9': '[',      # Left bracket
    '\uf8ea': '{',      # Left brace
    '\uf8eb': '(',      # Left parenthesis
    '\uf8ec': ')',      # Right parenthesis
    '\uf8ed': '}',      # Right brace
    '\uf8ee': '<',      # Less than
    '\uf8ef': '>',      # Greater than
    # Add more as discovered
}

def clean_pua(text):
    result = []
    for char in text:
        code = ord(char)
        if 0xE000 <= code <= 0xF8FF:
            replacement = PUA_REPLACEMENTS.get(char, '')
            result.append(replacement)
        else:
            result.append(char)
    cleaned = ''.join(result)
    cleaned = re.sub(r'\s{2,}', ' ', cleaned).strip()
    return cleaned
```

### Question Type Fix Script (MongoDB operations)

```javascript
// Fix True/False misclassifications
const tfPatterns = [
  /^a\s+\w+\s+is\s+(a|an|the)/i,
  /^in\s+(a|an|the)\s+\w+/i,
  /need\s+not/i, /must\s+be/i, /should\s+be/i,
  /is\s+always/i, /is\s+never/i,
  /all\s+\w+/i, /every\s+\w+/i,
];

// Fix Fill-in-blank misclassifications
const fibPattern = /_{2,}/;

// For each detected question:
await db.collection("questions").updateOne(
  { _id: q._id },
  { $set: { type: "TRUE_FALSE", correct_answer: "True", explanation: "Answer: True" } }
);
```

### CLI Usage

```bash
# Clean PUA characters from all exemplar JSON files
.venv/bin/python scripts/clean-pua-chars.py

# Solve SHORT_ANSWER questions using pattern matching
.venv/bin/python scripts/solve-short-answers.py

# Re-ingest exemplar questions
node scripts/ingest-exemplar.mjs --force
```

## Validation Rules

### Coverage Validation
- Total published exemplar questions counted
- Answer coverage percentage calculated per type
- No question should have null or empty correct_answer (except DRAFT)

### Type Classification Validation
- TRUE_FALSE questions must have correct_answer of "True" or "False"
- FILL_IN_BLANKS questions must have fill-in values as answers
- MCQ questions must have 4 options and a correct answer (A, B, C, or D)
- SHORT_ANSWER questions must have meaningful answers (not placeholders)

### Quality Validation
- No PUA characters in any published question text
- No placeholder answers in any published question
- Figure-dependent questions marked as DRAFT
- Answers are mathematically/scientifically correct

## Acceptance Checks

- 100% answer coverage for published exemplar questions
- 0 PUA characters remaining in any published question
- 0 placeholder answers remaining
- All True/False statements classified as TRUE_FALSE
- All fill-in-the-blank questions classified as FILL_IN_BLANKS
- Figure-dependent questions marked as DRAFT with appropriate flags
- Build passes: `npm run build`
- Question bank displays correctly with proper types and answers

## Expected Final Metrics

| Type | Coverage Target |
|------|----------------|
| MCQ | 100% |
| TRUE_FALSE | 100% |
| FILL_IN_BLANKS | 100% |
| SHORT_ANSWER | 100% |
| **Overall** | **100%** |

## M — Mandatory Output Format

Your first response must contain exactly these sections:

### 1. Audit Summary
- Current exemplar question counts by type
- Current answer coverage by type
- Number of questions with PUA characters
- Number of questions with placeholder answers
- Number of figure-dependent questions identified

### 2. Enrichment Plan
- PUA cleaning approach
- Subject-matter solving strategy
- Question type reclassification approach
- Figure-dependent question handling

### 3. Immediate Start
- First script to run (PUA cleanup)
- First validation checkpoint (zero PUA chars)
- Expected enrichment results

For every later update, use this structure:

### Exemplar Enrichment Update
- What changed
- Questions solved
- Questions reclassified
- Questions marked DRAFT
- Current coverage percentage
- Next step

## Non-Negotiables

- Do not stop at a plan unless blocked
- Do not leave placeholder answers in published questions
- Do not keep misclassified question types
- Do not expose figure-dependent questions to teachers
- Log all progress clearly — user must see exactly what happened
- All 7,600+ exemplar questions must be accounted for — no silent failures

## Success Condition

Success means:

- 100% answer coverage for all published exemplar questions
- Zero PUA characters in any published question
- Zero placeholder answers in any published question
- All True/False statements properly classified as TRUE_FALSE
- All fill-in-the-blank questions properly classified as FILL_IN_BLANKS
- Figure-dependent questions marked as DRAFT
- Build passes
- Question bank displays correctly with proper types, answers, and explanations
```
