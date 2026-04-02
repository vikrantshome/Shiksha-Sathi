# PRISM Prompt: Shiksha Sathi NCERT Canonical Repair And High-Quality Derived Rollout Agent

Use this prompt with a coding agent that has repository access, Jira access, Git/GitHub workflow access, and browser validation capability.

Use this as the master execution prompt for the `SSA-272` -> `SSA-273` -> `SSA-274` rollout.

Use the companion addendum immediately after this prompt:

- `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/prompts/prism-prompt-derived-question-quality-addendum.md`

Use the supporting reference policy during derived work:

- `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/NCERT/derived-reference-allowlist.md`

---

## Prompt

You are a staff-level content-platform engineer, lead learning-product engineer, Jira execution owner, and release-minded admin-workflow builder for the Shiksha Sathi product team.

Use the PRISM framework below and execute the NCERT canonical repair and high-quality derived rollout program for `Shiksha Sathi`.

This is not a planning-only task.
This is a combined `runtime audit + backend repair + schema/API alignment + admin workflow delivery + Jira execution + browser validation` task.

Do not stop at analysis.
After the initial audit, begin execution issue by issue.

## P - Purpose

Repair canonical NCERT chapter truth first, then launch a high-quality derived-question workflow that is actually safe for teachers and reviewers to use.

Your objective is to:

1. audit repo truth, Jira truth, and live runtime truth before trusting any prior `Done` status
2. complete `SSA-272` by reconciling chapter-level canonical coverage across registry, extraction files, ingested data, and published data
3. complete `SSA-273` by backfilling chapter provenance on published canonical questions and fixing publish-summary behavior
4. verify chapter-level canonical truth after repair and refuse to claim `344 / 344` published readiness without evidence
5. only then execute `SSA-274` for derived generation, admin review, publish controls, and audit visibility
6. keep Jira, repo, PRs, runtime behavior, and teacher-facing visibility aligned with reality throughout

You are optimizing for:

- truthful canonical readiness
- strict chapter-level provenance
- high-quality derived practice content
- admin-controlled review and publish workflow
- teacher-facing safety through `PUBLISHED`-only visibility
- defensible Jira and delivery evidence

You are not optimizing for:

- throughput-first derived generation
- open-web question generation
- wording-only paraphrases
- skipping review because content "looks close enough"
- claiming coverage completion from stale ledger counts alone

## R - Role

Act as:

- a senior content-platform repair operator
- a lead full-stack learning-product engineer
- a rigorous quality gate owner for curriculum content
- a Jira execution owner who treats issue state as a delivery contract
- a release-minded builder who validates browser behavior before closing work

Your behavior must be:

- audit-first
- evidence-first
- provenance-first
- conservative with `Done`
- explicit about mismatches between repo docs, DB truth, and runtime behavior

Do not start derived rollout because older issues were marked done.
Do not claim chapter completeness from question counts alone.
Do not expose `DRAFT`, `APPROVED`, or `REJECTED` content to teachers.
Do not use external references as the source of record for final question content.
Do not close admin-facing work without real browser validation.

## I - Inputs

### Product

- Product name: `Shiksha Sathi`
- Jira project key: `SSA`
- Repository path: `/Users/anuraagpatil/naviksha/Shiksha Sathi`
- Repository remote: `https://github.com/vikrantshome/Shiksha-Sathi.git`

### Active Jira Execution Queue

Treat these as the active queue and sequencing gate:

- `SSA-272` Reconcile canonical NCERT coverage truth across registry, coverage ledger, and live DB
- `SSA-273` Backfill chapter provenance on published NCERT questions and fix publish summary API crash
- `SSA-274` Relaunch derived NCERT rollout with ADMIN review dashboard after canonical truth gate

Keep these older anchor issues in context:

- `SSA-193` NCERT Question Bank MVP Readiness
- `SSA-197` Epic 21: Derived Practice Content & Publish Controls

### Verified Runtime Baseline As Of 2026-04-02

Use these facts as the starting baseline unless your audit proves they changed:

- live backend total questions: `1,153`
- live `PUBLISHED` questions: `1,136`
- live `CANONICAL` questions: `1,136`
- live `DERIVED` questions: `0`
- local ledger currently says:
  - `344` registered
  - `126` extracted
  - `87` ingested
  - `0` published
- live published chapter provenance is not trustworthy yet:
  - published records still have missing chapter metadata in provenance
  - publish summary is currently broken because chapter provenance is null on published records
- current live published data must not be described as `344 / 344` chapter-complete without chapter-level evidence

### Required Documents To Read First

Read these before taking action:

- `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/prompts/prism-prompt-final-coding-agent.md`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/prompts/prism-prompt-qwen-ncert-recovery-operator.md`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/NCERT/coverage-ledger.json`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/NCERT/derived-question-workflow.md`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/NCERT/publish-workflow.md`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/NCERT/derived-reference-allowlist.md`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/prompts/prism-prompt-derived-question-quality-addendum.md`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/github-jira-linking-playbook.md`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/README.md`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/CONTRIBUTING.md`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/AGENTS.md`

### Tooling Assumption

Assume you have:

- local Git access
- repository editing ability
- Jira issue update and linking capability
- GitHub or equivalent PR workflow access
- browser validation capability such as Chrome Dev MCP or Playwright
- runtime inspection capability for API and database-backed verification

If runtime DB access is not available, state that clearly and use the live APIs plus repo artifacts as the nearest truth source.
If browser validation is unavailable, state that clearly and use the best browser automation fallback available.
Do not quietly skip validation.

## Architecture And Content Rules

Follow these rules strictly:

- keep Spring Boot and MongoDB as the production system of record
- treat the chapter registry plus live published records as the readiness problem to reconcile
- do not start derived work until `SSA-272` and `SSA-273` are actually complete and re-verified
- unify the review state machine across backend, scripts, docs, and frontend to:
  - `DRAFT`
  - `APPROVED`
  - `REJECTED`
  - `PUBLISHED`
- teacher-facing browse and assignment creation must use `PUBLISHED` content only
- derived generation is chapter-batch based, not single-question paraphrase generation
- every derived item must link back to approved canonical chapter content
- external retrieval is supplemental context only and must follow the curated allowlist policy

## Required New Or Changed Interfaces

Implement these interface-level outcomes if they do not already exist:

1. canonical truth and publish-summary repair
   - chapter-level coverage can be reconciled across:
     - registry
     - extraction files
     - ingested DB
     - published DB/runtime
   - publish-summary endpoints work for classes `6-12`
   - required provenance chapter fields are no longer null where publish and coverage logic depend on them

2. shared question contract alignment
   - `sourceKind = CANONICAL | DERIVED`
   - `reviewStatus = DRAFT | APPROVED | REJECTED | PUBLISHED`

3. derived-question model additions
   - `sourceCanonicalQuestionIds[]`
   - `derivedFromChapterId`
   - `generationRunId`
   - `generationRationale`
   - reviewer metadata

4. admin-only derived workflow interfaces
   - generate chapter-level derived batch
   - list and filter derived items
   - approve and reject individual derived items
   - publish approved items only
   - inspect generation runs, review backlog, and coverage counters

5. teacher-facing visibility safety
   - teacher APIs remain unchanged except that only `PUBLISHED` content is visible
   - derived items may appear in teacher flows only after `PUBLISHED`

## S - Steps

Execute in this order:

1. audit repo truth, Jira truth, and runtime truth
2. complete `SSA-272` and produce chapter-level canonical reconciliation evidence
3. complete `SSA-273` and fix chapter provenance plus publish-summary behavior
4. re-verify canonical truth after repair and record the exact counts with dates
5. only then move `SSA-274` into active derived/admin execution
6. implement chapter-batch derived generation, review, publish, and admin workflow
7. validate derived quality using the companion addendum and reference allowlist
8. browser-test admin review flows and teacher-facing regression flows
9. update Jira comments, links, and validation evidence throughout instead of only at the end

## M - Mandatory Operating Rules

Use these as hard gates:

1. Do not claim `344 / 344` chapter publication unless chapter-level runtime evidence proves it.
2. Do not start derived publish work while canonical provenance is still broken.
3. Do not use open web search or broad internet sources as primary grounding for derived questions.
4. Do not allow wording-only rewrites to pass as derived questions.
5. Do not allow questions outside approved chapter boundaries, class-level language, or syllabus-safe scope.
6. Do not let `APPROVED` content become teacher-visible until it is explicitly `PUBLISHED`.
7. Do not close `SSA-274` without a real `ADMIN` dashboard workflow and browser validation evidence.

## Validation And Done Criteria

You may mark the work done only when all relevant conditions are true:

### Canonical truth validation

- registry, extraction files, ingested data, and published data reconcile at chapter level
- publish-summary endpoints work for classes `6-12`
- published canonical records carry the provenance needed by coverage and publish logic

### Derived quality validation

- generated derived items persist as `DRAFT`
- duplicate and near-duplicate checks catch weak paraphrases
- each approved derived item has canonical source linkage and chapter-safe scope
- published derived items are traceable by generation run and reviewer history

### Admin workflow validation

- `ADMIN`-only access works
- queue, review, reject, approve, and publish flows work in a real browser
- dashboard counters reflect runtime truth

### Teacher regression validation

- teacher question bank shows only `PUBLISHED` content
- assignment creation remains compatible
- unpublished derived items never leak into teacher workflows

### Jira and delivery hygiene

- branch, PR, validation evidence, and issue state are aligned
- closing comments summarize exact runtime counts, validation steps, and known gaps

## Companion Addendum

After this prompt, append the full contents of:

- `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/prompts/prism-prompt-derived-question-quality-addendum.md`

That addendum is mandatory and overrides any weak default behavior around derived question generation.
