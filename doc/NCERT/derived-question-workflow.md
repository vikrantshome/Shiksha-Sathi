# Derived Practice Question Generation Workflow

This document defines the target workflow for generating high-quality derived practice questions from approved canonical NCERT content.

## Overview

**Derived questions** are additional practice questions generated from approved canonical NCERT chapter content.

They must:

- add practice value beyond the canonical set
- remain inside the same approved chapter concept boundaries
- carry explicit canonical source linkage
- stay invisible to teachers until they are explicitly `PUBLISHED`

Derived generation is not a paraphrasing exercise.
It is a chapter-level content-quality workflow.

## Preconditions

Do not start derived rollout until these conditions are true:

- chapter-level canonical coverage truth has been reconciled
- canonical provenance required by publish and coverage logic is present
- teacher-facing visibility semantics are `PUBLISHED` only
- the chapter selected for derived generation has approved canonical source coverage

## Review State Machine

Derived content must use this state machine:

- `DRAFT`
- `APPROVED`
- `REJECTED`
- `PUBLISHED`

Teacher-facing flows must show `PUBLISHED` content only.

## Generation Principles

### 1. Chapter-Batch Generation

The default unit of generation is the approved canonical question set for one chapter.

Do not generate derived content question-by-question as the primary operating model.

Each generation run should:

- take one approved canonical chapter set as input
- produce a bounded derived batch for that chapter
- record one generation run ID for auditability

### 2. Canonical Source Linkage

Every derived question must trace back to approved canonical NCERT content with:

- `sourceCanonicalQuestionIds[]`
- `derivedFromChapterId`
- `generationRunId`
- `generationRationale`

### 3. Meaningful Novelty

A derived question is acceptable only if it changes at least one of:

- application context
- reasoning step
- question type
- difficulty

Reject items that are only:

- wording rewrites
- synonym swaps
- object-name swaps with the same reasoning
- format changes that add no learning value

### 4. Scope And Type Rules

Allowed derived types in v1:

- `MCQ`
- `TRUE_FALSE`
- `FILL_IN_BLANKS`
- `SHORT_ANSWER`

Do not generate long-answer or essay derived questions in v1.

### 5. Reference Policy

External retrieval is supplemental context only.

It may be used to improve:

- examples and scenarios
- distractor quality
- terminology clarity
- reviewer fact-check support

It may not:

- become the primary provenance for a derived question
- override approved NCERT chapter scope
- introduce unsupported or out-of-syllabus facts

Use only approved supplemental references from:

- `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/NCERT/derived-reference-allowlist.md`

## Workflow

### Step 1: Verify Chapter Eligibility

Eligible source chapter requirements:

- canonical questions exist for the chapter
- canonical questions are approved for derived generation
- provenance metadata is complete enough for review and publish traceability

### Step 2: Build Chapter Input

For the selected chapter:

- load the approved canonical question set
- identify concept coverage gaps and weak practice areas
- optionally load curated supplemental references allowed by policy

### Step 3: Generate Derived Batch

Generate a bounded chapter batch that:

- stays inside the same chapter concept boundaries
- uses class-appropriate language
- produces meaningfully distinct practice
- includes answer keys and explanations

### Step 4: Pre-Review Validation

Before human review, every generated item must pass:

- schema completeness
- allowed type validation
- answer and explanation consistency
- chapter/topic alignment
- class-level language appropriateness
- duplicate and near-duplicate screening against canonical and derived content

### Step 5: Store As Draft

Each derived question is stored as:

```json
{
  "sourceKind": "DERIVED",
  "reviewStatus": "DRAFT",
  "sourceCanonicalQuestionIds": ["canonical-question-id"],
  "derivedFromChapterId": "chapter-id",
  "generationRunId": "run-id",
  "generationRationale": "short explanation of novelty and concept coverage",
  "provenance": { "...": "same chapter lineage as canonical source" }
}
```

### Step 6: Editorial Review

Reviewers must inspect each derived item individually.

Approve only if the item:

- is meaningfully distinct from canonical content
- has a clear and correct answer
- stays within the approved chapter scope
- uses grade-appropriate language
- adds real practice value

Reject with notes if any of those checks fail.

### Step 7: Publish

Only approved derived items can be published.

Teacher-facing browse, search, and assignment creation must show only:

- canonical `PUBLISHED`
- derived `PUBLISHED`

## Target Admin Workflow

The admin workflow should include:

- chapter readiness queue
- generation run history
- item-by-item review workspace
- approve and reject controls
- publish approved-set controls
- reviewer notes and audit history

## Target API Surface

Recommended admin-only contracts:

### Generate Derived Batch

```
POST /api/v1/admin/derived-questions/generate
Body: {
  "chapterId": "string",
  "count": 25
}
```

### List Derived Questions

```
GET /api/v1/admin/derived-questions?chapterId=...&status=DRAFT
```

### Approve Or Reject

```
POST /api/v1/admin/derived-questions/{id}/approve
POST /api/v1/admin/derived-questions/{id}/reject
```

### Publish Approved Set

```
POST /api/v1/admin/derived-questions/publish
Body: {
  "chapterId": "string",
  "generationRunId": "string"
}
```

## Success Metrics

- generated items survive human review because they are genuinely distinct and useful
- reviewers can reject weak paraphrases quickly
- teachers can distinguish canonical and derived content when both are published
- all derived items remain fully traceable to approved canonical chapter content
