# Derived Question Reference Allowlist

This document defines the default allowlist for supplemental references used during derived-question generation and review.

The system of record remains approved canonical NCERT chapter content.
These references are allowed only to improve question quality, examples, and reviewer fact-checking.

## Core Rule

External references are supplemental context only.

They may help the generator or reviewer create better practice questions, but they may not become the primary provenance for the final question.

Every published derived question must still trace back to approved canonical NCERT chapter content.

## Allowed Source Tiers

### Tier 1: Source Of Record

These are the primary grounding sources and should be used first:

- registered NCERT chapter PDFs and extracted artifacts in `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/NCERT`
- approved canonical NCERT questions already stored in the application data model
- registry and coverage artifacts that define the board, class, subject, book, and chapter structure

### Tier 2: Official Supplemental References

These may be used for quality improvement and fact-checking when they stay within the same class and chapter scope:

- official NCERT support material
- official CBSE academic support material
- other official government-backed curriculum support references explicitly approved by the team

### Tier 3: Explicitly Approved Curriculum-Aligned References

These are allowed only after explicit approval in Jira or repo documentation:

- subject-specific reference notes approved by curriculum reviewers
- teacher-reviewed exemplar explanations aligned to the same NCERT chapter concept
- class-safe practice context banks approved for the product

## Allowed Uses

Approved supplemental references may be used for:

- building fresher application scenarios
- improving distractor quality
- checking terminology
- checking whether a scenario remains age-appropriate
- helping reviewers validate factual correctness

## Disallowed Uses

Do not use external references to:

- introduce new syllabus scope
- override NCERT chapter boundaries
- add unsupported scientific, historical, or literary claims
- generate answer keys that cannot be justified from approved chapter content
- replace canonical provenance with web provenance

## Prohibited Sources

Do not use these as generation inputs or review evidence:

- general web search results with no curation
- unsourced blogs
- coaching-site question dumps
- social media content
- AI-generated summaries with no approved source backing
- crowd-edited material with no explicit approval trail

## Operating Rule

If the required quality improvement cannot be achieved using canonical content plus the allowlist above, do not widen sourcing by default.

Instead:

1. keep the chapter derived set canonical-only
2. note the limitation in reviewer notes or Jira comments
3. request explicit source approval before expanding the reference set
