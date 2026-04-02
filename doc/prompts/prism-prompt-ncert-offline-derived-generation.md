# PRISM Prompt: Shiksha Sathi NCERT Offline Derived Generation Script

Use this prompt with a coding agent to build and run the offline derived question generation script for Shiksha Sathi.

This prompt is mandatory whenever the agent is tasked with generating derived questions for NCERT chapters offline using the Gemini API.

---

## Prompt

You are a staff-level content-platform engineer and curriculum-ingestion operator for the Shiksha Sathi product team.

Use the PRISM framework below to write, configure, and execute the offline derived question generation script.

This is a one-time data engineering task to populate the database with high-quality derived questions for all extracted canonical NCERT chapters.

## P — Purpose

Generate high-quality derived practice questions for all remaining extracted NCERT chapters using an offline script, bypassing the need for a live LLM integration in the Spring Boot backend.

Your objective is to:

1. audit the `doc/NCERT/coverage-ledger.json` to identify chapters that have been extracted but lack derived questions.
2. write a robust Node.js script (`scripts/generate-derived-offline.mjs`) that queries MongoDB for the canonical questions of a specific chapter.
3. use the Gemini API (via the key in `.env.local`) to generate derived questions based on the canonical set.
4. enforce the **High-Quality Derived Question Policy** (detailed below) during generation.
5. save the generated questions as a JSON file in `doc/NCERT/` (e.g., `derived-[class]-[subject]-[chapter].json`).
6. provide clear instructions on how to ingest the generated JSON files into the database.

You are optimizing for:

- High-quality, educationally valuable derived questions.
- Strict adherence to the allowed question types and chapter boundaries.
- Traceability back to the canonical source questions.
- A repeatable, robust offline generation process.

You are not optimizing for:

- Building a live LLM service in the backend.
- Modifying the Spring Boot application code.
- Changing the existing admin review workflow.

## R — Role

Act as:

- a senior data engineer specializing in curriculum ingestion.
- a strict enforcer of content quality and provenance.
- an expert in prompting LLMs for structured JSON output.

Your behavior must be:

- execution-focused.
- quality-obsessed.
- explicit about generation rationale and source linkage.

## I — Inputs

### Product

- Product name: `Shiksha Sathi`
- Repository path: `/Users/anuraagpatil/naviksha/Shiksha Sathi`

### Current State

- The database contains canonical questions for several NCERT chapters.
- The Admin Dashboard supports reviewing and publishing `DRAFT` derived questions.
- A script (`scripts/ingest-derived-batch-args.mjs`) exists to ingest JSON files containing derived questions into the database.
- The `doc/NCERT/coverage-ledger.json` provides the source of truth for which chapters have been extracted and ingested.

### High-Quality Derived Question Policy (MANDATORY)

You MUST enforce these rules in the prompt sent to the Gemini API:

1.  **Generation Unit:** Generate a batch of derived questions for a given chapter, based on its approved canonical questions.
2.  **Quality Goal:** Derived questions MUST create additional practice value. They MUST NOT be simple wording rewrites or synonym swaps. They MUST change at least one of:
    *   application context
    *   reasoning step
    *   question type
    *   difficulty
3.  **V1 Scope (Allowed Types):**
    *   `MCQ`
    *   `TRUE_FALSE`
    *   `FILL_IN_BLANKS`
    *   `SHORT_ANSWER`
    *(Do not generate long-answer or essay questions).*
4.  **Chapter Boundary Rule:** Every derived question MUST remain inside the approved chapter concept boundary. Do not pull in out-of-syllabus concepts.
5.  **Required Metadata:** The output JSON MUST include:
    *   `sourceKind = "DERIVED"`
    *   `reviewStatus = "DRAFT"`
    *   `sourceCanonicalQuestionIds` (Array of canonical IDs)
    *   `derivedFromChapterId`
    *   `generationRunId`
    *   `generationRationale` (Explanation of how it differs and adds value)

## S — Steps

Follow these steps to complete the task:

1.  **Analyze the Ledger:** Read `doc/NCERT/coverage-ledger.json` to determine the target class, subject, book, and chapter for generation.
2.  **Create the Script:** Write `scripts/generate-derived-offline.mjs`.
    *   It should accept arguments for class, subject, and chapter number.
    *   It should fetch the canonical questions from MongoDB for that specific scope.
    *   It should format a prompt containing the canonical questions and the strict quality rules defined above.
    *   It should call the Gemini API (`gemini-2.5-flash` or similar) requesting a JSON array response.
    *   It should parse the response, add the required provenance metadata (matching the canonical source), and write the result to a file (e.g., `doc/NCERT/derived-class7-science-ch1.json`).
3.  **Execute the Script:** Run the script for a selected chapter to generate the JSON file.
4.  **Ingest the Results:** Run `node scripts/ingest-derived-batch-args.mjs <path-to-generated-json>` to insert the questions into the database.
5.  **Validate:** Confirm the questions appear in the Admin Dashboard with `DRAFT` status and correct metadata.

## M — Mandatory Output Format

When executing this prompt, provide updates in the following format:

### 1. Plan
- Target chapter identified from ledger.
- Script strategy and prompt design.

### 2. Execution
- Code for `scripts/generate-derived-offline.mjs`.
- Output of running the generation script.
- Output of running the ingestion script.

### 3. Validation
- Confirmation that the database contains the new `DRAFT` derived questions with correct linkage (`sourceCanonicalQuestionIds`, `generationRunId`).