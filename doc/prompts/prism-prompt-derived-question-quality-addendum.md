# PRISM Prompt Addendum: High-Quality Derived Question Policy

Use this addendum immediately after the master NCERT canonical repair and derived rollout prompt.

This addendum is mandatory whenever the agent touches `SSA-274`, derived-question generation, derived review, or admin publish controls.

---

## Addendum

Treat derived-question quality as a hard product-quality gate, not a prompt-tuning detail.

The system must prefer fewer strong derived questions over many weak ones.

### 1. Generation Unit

Derived generation is `chapter-batch` based.

Do not generate derived questions one canonical question at a time as the default operating model.

For each run:

- input is the approved canonical question set for one chapter
- output is a bounded chapter batch of derived questions
- each derived item must still link to one or more canonical source question IDs

### 2. Quality Goal

Derived questions must create additional practice value.

They must not be accepted if they are only:

- wording rewrites
- synonym swaps
- object-name swaps with identical reasoning
- format changes with no meaningful learning difference

A derived question is acceptable only if it changes at least one of:

- application context
- reasoning step
- question type
- difficulty

### 3. V1 Scope

Allowed question types in v1:

- `MCQ`
- `TRUE_FALSE`
- `FILL_IN_BLANKS`
- `SHORT_ANSWER`

Do not generate long-answer or essay derived questions in v1.

### 4. Chapter Boundary Rule

Every derived question must remain inside the approved chapter concept boundary.

Do not:

- pull in out-of-syllabus concepts
- combine multiple chapter concepts unless that combination is already supported by the chapter set
- introduce higher-grade abstractions not appropriate for the target class

### 5. Reference Policy

External retrieval is supplemental context only.

Use external references only to improve quality through:

- fresh application scenarios
- realistic examples
- terminology clarification
- reviewer fact-check support

External references must never:

- become the primary provenance for the final question
- override canonical NCERT chapter scope
- introduce unsupported facts or claims
- broaden the syllabus silently

Use only the curated reference policy defined in:

- `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/NCERT/derived-reference-allowlist.md`

If the needed reference is not on the allowlist, do not broaden sourcing.
Stay canonical-only for that chapter and note the limitation in review or Jira comments.

### 6. Required Metadata Per Derived Item

Every derived question must carry at least:

- `sourceKind = DERIVED`
- `reviewStatus = DRAFT`
- `sourceCanonicalQuestionIds[]`
- `derivedFromChapterId`
- `generationRunId`
- `generationRationale`
- reviewer metadata after approval or rejection

### 7. Generation Quality Checks

Before a generated item enters review, it must pass:

- schema completeness
- answer and explanation consistency
- allowed question-type check
- chapter/topic alignment check
- class-level language check
- duplicate and near-duplicate screening against:
  - canonical chapter questions
  - already published derived questions
  - already approved derived questions in the same chapter

Reject or regenerate any item that fails these checks.

### 8. Editorial Review Rules

Every derived item requires human review before publish.

Reviewers must approve or reject one item at a time.

Reject with notes when any of the following are true:

- the item is too close to a canonical question
- the item adds unsupported facts
- the item shifts outside the chapter boundary
- the answer is weak, ambiguous, or under-explained
- the wording is not class-appropriate
- the distractors are obviously poor

### 9. Publish Rules

Only `PUBLISHED` derived questions may be visible to teachers.

`DRAFT`, `APPROVED`, and `REJECTED` derived items must never appear in teacher-facing search, browse, or assignment flows.

### 10. Admin Dashboard Expectations

The admin workflow must make quality visible, not hidden.

The dashboard should support:

- chapter readiness queue
- generation run history
- item-by-item review workspace
- approve and reject actions
- publish approved-set controls
- reviewer notes and audit history
- counters for `DRAFT`, `APPROVED`, `REJECTED`, and `PUBLISHED`

### 11. Minimum Acceptance Standard

Do not consider derived rollout successful unless:

- generated items are meaningfully distinct from canonical content
- human reviewers can efficiently reject weak items
- teacher flows remain `PUBLISHED`-only
- provenance, reviewer history, and generation-run traceability are intact
- the resulting practice set feels educationally better, not merely larger
