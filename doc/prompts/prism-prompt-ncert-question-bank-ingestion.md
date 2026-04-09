# PRISM Prompt: NCERT Question Bank Bulk Ingestion

Use this prompt with Claude 4.6, Gemini 3.1, or another coding agent that has repository access, Jira access, and MongoDB access.

This prompt covers creating and running a bulk ingestion script to load all 1,502 NCERT questions (1,140 canonical + 362 derived) from JSON files into the MongoDB `questions` collection.

```text
You are a senior backend engineer, data engineer, and Jira execution owner for the Shiksha Sathi product team.

Use the PRISM framework below and build the bulk NCERT question bank ingestion system.

Do not stop at planning.
After the initial audit and implementation plan, begin execution immediately.

## P — Purpose

Ingest all 1,502 NCERT questions from extraction and derived JSON files into the MongoDB `questions` collection in the `shikshasathi` database.

Current state:
- 286 canonical extraction files in `doc/NCERT/extractions/*.json` — 1,140 questions
- 22 derived question files in `doc/NCERT/derived-*.json` and subdirectories — 362 questions
- MongoDB `questions` collection has only 32 sample/test questions
- Existing ingestion scripts handle ONE file at a time (`ingest-ncert-extraction.mjs` and `ingest-derived-batch-args.mjs`)
- No bulk ingestion script exists to process ALL files at once
- No dry-run or verification mode exists

Your objective is to:

1. create a bulk ingestion script that processes ALL 308 JSON files
2. canonical questions (1,140) should be ingested with `reviewStatus: "PUBLISHED"` (already reviewed)
3. derived questions (362) should be ingested with `reviewStatus: "DRAFT"` (need teacher review)
4. add a dry-run mode to preview what would be ingested without modifying the database
5. add verification mode to count and validate questions after ingestion
6. handle duplicates gracefully (upsert by extraction_run_id or generation_run_id)
7. log progress with clear output showing counts, errors, and skip reasons

You are optimizing for:

- complete data integrity — no duplicates, no missing fields
- clear logging and progress output
- ability to re-run safely (idempotent)
- fast execution (bulk inserts, not one-by-one)
- error handling that continues on failure rather than stopping

You are not optimizing for:

- changing the existing question schema
- modifying existing ingestion scripts
- ingesting questions that don't exist in JSON files
- creating new MongoDB collections or indexes (unless strictly needed)

## R — Role

Act as:

- a senior Node.js engineer who can write efficient MongoDB bulk operations
- a data engineer who can handle large JSON file processing
- a Jira execution owner who traces all work to SSA issues

Your behavior must be:

- implementation-first
- data-integrity focused
- idempotent (safe to re-run)
- explicit about error handling
- disciplined about dry-run verification before actual ingestion

Do not redesign the question schema.
Do not modify existing single-file ingestion scripts.
Do not ingest questions without dry-run verification first.

## I — Inputs

### Product

- Product name: `Shiksha Sathi`
- Jira project key: `SSA`
- Repository path: `/Users/anuraagpatil/naviksha/Shiksha Sathi`
- Repository remote: `https://github.com/vikrantshome/Shiksha-Sathi.git`

### Source Data

**Canonical Questions (1,140):**
- Location: `doc/NCERT/extractions/*.json`
- Files: 286 JSON files
- Structure per file:
  ```json
  {
    "provenance": {
      "board": "NCERT",
      "class": "8",
      "subject": "Mathematics",
      "book": "Ganita Prakash",
      "chapterNumber": 7,
      "chapterTitle": "Algebraic Expressions and Identities",
      "sourceFile": "hegp107.pdf"
    },
    "questions": [
      {
        "sourceKind": "CANONICAL",
        "section": "Exercise",
        "pageNumber": 128,
        "text": "An expression with two terms is called:",
        "type": "MCQ",
        "options": ["Monomial", "Binomial", "Trinomial", "Polynomial"],
        "correctAnswer": "Binomial",
        "explanation": "A binomial has two terms..."
      }
    ]
  }
  ```

**Derived Questions (362):**
- Location: `doc/NCERT/derived-*.json` and `doc/NCERT/class*/derived*.json`
- Files: 22 JSON files
- Structure: array of questions at top level
  ```json
  [
    {
      "sourceKind": "DERIVED",
      "reviewStatus": "DRAFT",
      "generationRunId": "class8-science-offline-gen",
      "subjectId": "Science",
      "chapter": "Chapter 1: The Cell: Basic Unit of Life",
      "derivedFromChapterId": "Chapter 1: The Cell: Basic Unit of Life",
      "generationRationale": "Shifted to comparing plant and animal cells...",
      "sourceCanonicalQuestionIds": ["69c778a46bfcc2d1f3968ece"],
      "type": "TRUE_FALSE",
      "text": "Unlike animal cells, plant cells possess a cell wall...",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "explanation": "Plant cells have a rigid cell wall...",
      "points": 1,
      "provenance": { ... }
    }
  ]
  ```

### Existing Scripts to Read

- `scripts/ingest-ncert-extraction.mjs` — single-file canonical ingestion
- `scripts/ingest-derived-batch-args.mjs` — single-file derived ingestion
- `scripts/lib/question-points.mjs` — point resolution helper

### MongoDB Connection

- Connection string: from `.env.local` (`MONGODB_URI`)
- Database: `shikshasathi`
- Collection: `questions`

### Question Type Distribution (Canonical)

| Type | Count | % |
|------|-------|---|
| MCQ | 298 | 26.1% |
| TRUE_FALSE | 284 | 24.9% |
| FILL_IN_BLANKS | 284 | 24.9% |
| SHORT_ANSWER | 274 | 24.0% |

### Coverage

- 286 chapters across Classes 6–12
- Subjects: Maths, Science, English, Social Science, ICT, Computer Science, Physics, Chemistry, Biology, Geography

## S — Steps

Follow these steps in order:

1. **Audit** the existing ingestion scripts and question schema
2. **Read** the Question entity model to understand field mapping
3. **Create Jira stories** for the ingestion work:
   - `SSA-293`: Story — Bulk ingest all 1,502 NCERT questions into MongoDB
   - `SSA-294`: Subtask — Create bulk canonical ingestion script (1,140 questions)
   - `SSA-295`: Subtask — Create bulk derived ingestion script (362 questions)
   - `SSA-296`: Subtask — Add dry-run and verification modes
   - `SSA-297`: Subtask — Run ingestion and verify data integrity
4. **Create bulk ingestion script** (`scripts/bulk-ingest-ncert.mjs`):
   - Glob all canonical files from `doc/NCERT/extractions/*.json`
   - Glob all derived files from `doc/NCERT/derived-*.json` and `doc/NCERT/class*/derived*.json`
   - For each canonical file:
     - Parse JSON
     - Map fields to Question schema (subject_id, chapter, correct_answer, points, provenance, etc.)
     - Set `reviewStatus: "PUBLISHED"` (these are reviewed NCERT extractions)
     - Generate `extraction_run_id` from provenance metadata
     - Skip if `extraction_run_id` already exists (idempotent)
     - Bulk insert in chunks of 500
   - For each derived file:
     - Parse JSON array
     - Map fields to Question schema
     - Keep `reviewStatus: "DRAFT"` (need teacher review)
     - Skip if `generation_run_id` already exists
     - Bulk insert in chunks of 500
   - Log progress: `[1/286] Ingested 4 canonical questions from class8-maths-ch7-v1.json`
   - Log skips: `[15/286] Skipped class9-science-ch3-v1.json: 12 questions already exist`
   - Log errors: `[ERROR] Failed to parse class10-maths-ch5-v1.json: unexpected end of JSON`
5. **Add CLI flags**:
   - `--dry-run` — count files and questions, show what WOULD be ingested, no DB changes
   - `--canonical-only` — ingest only canonical questions
   - `--derived-only` — ingest only derived questions
   - `--verify` — count questions in DB, compare to source files, report discrepancies
   - `--force` — delete existing questions with matching run IDs before re-ingesting
6. **Add question points resolution** using `scripts/lib/question-points.mjs`
7. **Run dry-run first** to verify file counts and question counts match expectations:
   - Expected: 286 canonical files, 1,140 questions
   - Expected: 22 derived files, 362 questions
   - Expected: 308 total files, 1,502 total questions
8. **Run actual ingestion** (after dry-run confirms counts)
9. **Run verification** to confirm:
   - 1,140 canonical questions in DB with `sourceKind: "CANONICAL"`
   - 362 derived questions in DB with `sourceKind: "DERIVED"`
   - Total: 1,502 questions
   - No duplicate extraction_run_ids or generation_run_ids
   - All questions have required fields (text, type, correctAnswer, points, provenance)
10. **Create branch, commit, and PR** following Jira-linked conventions

## Architecture

### Bulk Ingestion Script (`scripts/bulk-ingest-ncert.mjs`)

```javascript
import fs from 'fs';
import path from 'path';
import { MongoClient, BulkWriteError } from 'mongodb';
import dotenv from 'dotenv';
import { resolveQuestionPoints } from './lib/question-points.mjs';

dotenv.config({ path: '.env.local' });

// CLI parsing
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const canonicalOnly = args.includes('--canonical-only');
const derivedOnly = args.includes('--derived-only');
const verifyOnly = args.includes('--verify');
const force = args.includes('--force');

async function globFiles(pattern) {
  // Use fs/promises + glob or fast-glob to find matching files
}

async function ingestCanonical(client, filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const { provenance, questions } = data;
  const extractionRunId = `${provenance.class}-${provenance.subject}-${provenance.book.replace(/\s+/g, '-').toLowerCase()}-ch${provenance.chapterNumber}-v1`;

  const db = client.db("shikshasathi");
  const collection = db.collection("questions");

  // Check existing
  const existingCount = await collection.countDocuments({
    "provenance.extraction_run_id": extractionRunId
  });

  if (existingCount > 0 && !force) {
    return { skipped: existingCount, inserted: 0, file: path.basename(filePath) };
  }

  if (force && existingCount > 0) {
    await collection.deleteMany({ "provenance.extraction_run_id": extractionRunId });
  }

  const mappedQuestions = questions.map(q => ({
    ...q,
    correct_answer: q.correctAnswer ?? q.correct_answer ?? null,
    points: resolveQuestionPoints(q),
    subject_id: provenance.subject,
    chapter: `Chapter ${provenance.chapterNumber}: ${provenance.chapterTitle}`,
    provenance: { ...provenance, extraction_run_id: extractionRunId },
    review_status: "PUBLISHED",
    created_at: new Date(),
    updated_at: new Date()
  }));

  if (dryRun) {
    return { dryRun: true, count: mappedQuestions.length, file: path.basename(filePath) };
  }

  // Bulk insert in chunks
  const chunkSize = 500;
  let inserted = 0;
  for (let i = 0; i < mappedQuestions.length; i += chunkSize) {
    const chunk = mappedQuestions.slice(i, i + chunkSize);
    const result = await collection.insertMany(chunk, { ordered: false });
    inserted += result.insertedCount;
  }

  return { inserted, skipped: 0, file: path.basename(filePath) };
}

// Similar for ingestDerived...

// Main execution
async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  if (verifyOnly) {
    await verifyIngestion(client);
    await client.close();
    return;
  }

  const canonicalFiles = await globFiles('doc/NCERT/extractions/*.json');
  const derivedFiles = [
    ...await globFiles('doc/NCERT/derived-*.json'),
    ...await globFiles('doc/NCERT/class*/derived*.json')
  ];

  console.log(`📋 Found ${canonicalFiles.length} canonical files, ${derivedFiles.length} derived files`);

  if (dryRun) {
    console.log('🔍 DRY RUN — no changes will be made\n');
  }

  // Process canonical
  if (!derivedOnly) {
    for (const file of canonicalFiles) {
      const result = await ingestCanonical(client, file);
      // Log result
    }
  }

  // Process derived
  if (!canonicalOnly) {
    for (const file of derivedFiles) {
      const result = await ingestDerived(client, file);
      // Log result
    }
  }

  // Summary
  console.log('\n✅ Ingestion complete!');

  await client.close();
}

main().catch(console.error);
```

### CLI Usage

```bash
# Dry run — preview what will be ingested
node scripts/bulk-ingest-ncert.mjs --dry-run

# Ingest all questions
node scripts/bulk-ingest-ncert.mjs

# Ingest only canonical questions
node scripts/bulk-ingest-ncert.mjs --canonical-only

# Ingest only derived questions
node scripts/bulk-ingest-ncert.mjs --derived-only

# Force re-ingestion (deletes existing matching run IDs first)
node scripts/bulk-ingest-ncert.mjs --force

# Verify ingestion counts
node scripts/bulk-ingest-ncert.mjs --verify
```

### Expected Dry-Run Output

```
📋 Found 286 canonical files, 22 derived files
🔍 DRY RUN — no changes will be made

📊 Summary:
  Canonical: 286 files, 1,140 questions
  Derived:   22 files, 362 questions
  Total:     308 files, 1,502 questions

✅ Dry run complete. Run without --dry-run to ingest.
```

### Expected Ingestion Output

```
📋 Found 286 canonical files, 22 derived files

[1/286] ✅ Ingested 4 canonical questions from class8-maths-ch7-v1.json
[2/286] ✅ Ingested 6 canonical questions from class8-science-ch7-v1.json
[3/286] ⚠️  Skipped class8-maths-ch11-v1.json: 5 questions already exist
...
[286/286] ✅ Ingested 3 canonical questions from class12-maths-ch8-v1.json

[1/22] ✅ Ingested 18 derived questions from derived-class8-science.json
[2/22] ⚠️  Skipped derived-class7-english.json: 12 questions already exist
...
[22/22] ✅ Ingested 15 derived questions from derived-class12-physics.json

✅ Ingestion complete!
  Canonical: 1,140 questions ingested (286 files)
  Derived:   362 questions ingested (22 files)
  Total:     1,502 questions
  Skipped:   0 (already existed)
  Errors:    0
```

### Verification Output

```
🔍 Verifying ingestion...

  Canonical questions: 1,140 ✅ (expected 1,140)
  Derived questions:   362  ✅ (expected 362)
  Total:               1,502 ✅ (expected 1,502)

  By type:
    MCQ:              298 ✅
    TRUE_FALSE:       284 ✅
    FILL_IN_BLANKS:   284 ✅
    SHORT_ANSWER:     274 ✅
    DERIVED (MCQ):    ... 
    DERIVED (T/F):    ...
    DERIVED (FIB):    ...
    DERIVED (SA):     ...

  Missing required fields: 0 ✅
  Duplicate extraction_run_ids: 0 ✅
  Duplicate generation_run_ids: 0 ✅

✅ Verification passed — all questions ingested correctly.
```

## Jira, Git And PR Discipline

Branch naming:

- `feature/SSA-293-ncert-question-bank-ingestion`

Commit examples:

- `SSA-293 create bulk NCERT question ingestion script`
- `SSA-294 add canonical ingestion with upsert logic`
- `SSA-295 add derived ingestion with draft status`
- `SSA-296 add dry-run and verification modes`
- `SSA-297 ingest 1,502 questions and verify data integrity`

PR title: `SSA-293: Bulk ingest all 1,502 NCERT questions into MongoDB`

PR body must include:

- Source file counts (286 canonical + 22 derived = 308)
- Question counts (1,140 canonical + 362 derived = 1,502)
- Dry-run output
- Actual ingestion output
- Verification output
- Any errors or skips encountered
- Command to re-run if needed

Jira rules:

- create the story and subtasks before coding
- update issue status as work progresses
- add Jira comment with PR link when closing

## Validation Rules

- `node scripts/bulk-ingest-ncert.mjs --dry-run` must show correct counts
- `node scripts/bulk-ingest-ncert.mjs --canonical-only` must ingest exactly 1,140 questions
- `node scripts/bulk-ingest-ncert.mjs --derived-only` must ingest exactly 362 questions
- `node scripts/bulk-ingest-ncert.mjs --verify` must confirm all 1,502 questions
- Re-running without `--force` must skip all questions (idempotent)
- Re-running with `--force` must delete and re-insert (safe re-run)

### Acceptance Checks

- 1,140 canonical questions in DB with `sourceKind: "CANONICAL"` and `reviewStatus: "PUBLISHED"`
- 362 derived questions in DB with `sourceKind: "DERIVED"` and `reviewStatus: "DRAFT"`
- Total: 1,502 questions
- No duplicate extraction_run_ids or generation_run_ids
- All questions have required fields (text, type, correctAnswer, points, provenance)
- Dry-run mode works without modifying the database
- Verification mode confirms data integrity
- Script handles malformed JSON files gracefully (logs error, continues)

## M — Mandatory Output Format

Your first response must contain exactly these sections:

### 1. Audit Summary
- Existing ingestion scripts and their limitations
- Question schema field mapping
- Source file structure and counts

### 2. Implementation Plan
- Bulk ingestion script structure
- Dry-run and verification modes
- CLI argument parsing

### 3. Jira And Git Plan
- Stories to create
- Branch names
- PR title draft

### 4. Immediate Start
- First artifact to create (bulk ingestion script)
- First validation checkpoint (dry-run output)
- Expected ingestion results

For every later update, use this structure:

### NCERT Ingestion Delivery Update
- Jira story advanced
- What changed
- Files touched (scripts)
- Validation performed (dry-run/actual counts)
- Data integrity notes
- Next step

## Non-Negotiables

- Do not stop at a plan unless blocked
- Do not modify existing single-file ingestion scripts
- Do not change the question schema
- Do not ingest questions without dry-run verification first
- Keep the script idempotent (safe to re-run)
- Log all progress clearly — user must see exactly what happened
- Handle malformed JSON files gracefully (log error, continue)
- All 1,502 questions must be accounted for — no silent failures

## Success Condition

Success means:

- A single script (`scripts/bulk-ingest-ncert.mjs`) that ingests all 1,502 questions
- Dry-run mode confirms 286 canonical files (1,140 questions) + 22 derived files (362 questions)
- Actual ingestion loads all 1,502 questions with correct field mapping
- Verification mode confirms data integrity
- Script is idempotent — re-running skips existing questions
- All work is traceable to Jira SSA issues
```