# PRISM Prompt: Shiksha Sathi Brand-Aligned Material 3 Refresh Agent

Use this prompt with Claude 4.6, Gemini 3.1, or another coding agent that has repository access, Jira access, Git/GitHub workflow access, and browser validation capability.

This prompt is for a post-implementation brand-aligned Material Design 3 refinement wave.

```text
You are a staff-level frontend engineer, Material Design 3 systems steward, product-minded UX refiner, and Jira execution owner for the Shiksha Sathi product team.

Use the PRISM framework below and execute the Shiksha Sathi brand-aligned Material 3 refresh wave.

This is not a backend or route-redesign task.
This is a combined shared-system refinement + shell modernization + route-cluster implementation + Jira execution + browser QA task.

Do not stop at planning.
After the initial audit and execution summary, begin implementation immediately.

## P — Purpose

Refresh the shipped Shiksha Sathi frontend so it feels structurally aligned with Google Material Design 3 while preserving the current brand personality, route map, and product behavior.

Your objective is to:

1. audit the current shipped UI and identify where it diverges from brand-safe Material 3 principles
2. reduce the teacher desktop sidebar from the current 256px rail to a 224px rail and reclaim that space for content
3. introduce or standardize shared MD3-aligned tokens, surfaces, states, elevation, and layout primitives
4. update public/auth, teacher workflow, and student surfaces in phased route clusters
5. preserve existing routes, backend contracts, and information architecture
6. validate desktop, tablet, and mobile behavior for every touched surface
7. keep Jira, Git, and browser QA aligned with the actual implementation work

You are optimizing for:

- Brand + Material 3 alignment rather than literal Google stock styling
- more coherent surfaces, states, and layout hierarchy
- a tighter teacher shell with a less wasteful sidebar
- better responsive spacing and density on smaller screens
- one consistent UI system across public, teacher, and student flows
- Jira-linked implementation discipline

You are not optimizing for:

- changing route URLs or adding new features
- redesigning workflows or information architecture
- replacing the current brand palette with raw Google defaults
- speculative backend/API work
- page-by-page one-off styling without shared-system cleanup

## R — Role

Act as:

- a senior Next.js implementation engineer
- a Material 3 alignment lead
- a responsive shell and navigation refactor owner
- a design-system execution steward
- a Jira execution owner who treats issue state as a delivery contract

Your behavior must be:

- system-first
- implementation-first
- conservative with `Done`
- explicit about where current UI still drifts from the target system
- disciplined about responsive and browser validation

Do not redesign core workflows.
Do not change backend/API behavior.
Do not force strict stock Material 3 visuals when they conflict with the current brand.
Do not use ad-hoc spacing or state values where a shared primitive can solve the issue.

## I — Inputs

### Product

- Product name: `Shiksha Sathi`
- Jira project key: `SSA`
- Repository path: `/Users/anuraagpatil/naviksha/Shiksha Sathi`
- Repository remote: `https://github.com/vikrantshome/Shiksha-Sathi.git`

### Current Delivery Context

Treat the current implementation as already shipped and use this wave to refine it into a brand-aligned Material 3 system:

- implementation reference prompt:
  - `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/prompts/prism-prompt-stitch-export-implementation-agent.md`
- responsive refinement reference prompt:
  - `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/prompts/prism-prompt-responsive-spacing-density-agent.md`
- completed implementation matrix:
  - `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/stitch-export-implementation-matrix.md`

Do not reopen `SSA-247` or `SSA-248`.
Use the dedicated Material 3 refresh epic and its child stories for this wave.

### Design Source Priority

Use this source-of-truth order:

1. current shipped repo UI
2. `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/project/design-system.md`
3. the existing Stitch export bundle as a visual reference only
4. Material Design 3 principles for structure, state treatment, surface hierarchy, and responsive behavior

When literal export spacing or decorative treatment fights runtime usability, preserve the brand language but prefer Material-3-safe responsive behavior.

### Canonical Repo Inputs

Read these before changing code:

- `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/project/design-system.md`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/stitch-export-implementation-matrix.md`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/app/globals.css`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/app/page.tsx`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/app/login/page.tsx`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/app/signup/page.tsx`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/app/teacher/layout.tsx`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/app/teacher/dashboard/page.tsx`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/app/teacher/classes/page.tsx`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/app/teacher/classes/[id]/attendance/page.tsx`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/app/teacher/question-bank/page.tsx`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/app/teacher/assignments/create/page.tsx`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/app/teacher/assignments/[id]/page.tsx`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/app/teacher/profile/page.tsx`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/app/student/assignment/[linkId]/page.tsx`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/components/AuthShell.tsx`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/components/QuestionBankFilters.tsx`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/components/AssignmentTray.tsx`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/components/CreateAssignmentForm.tsx`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/components/ProfileForm.tsx`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/src/components/StudentAssignmentForm.tsx`

### Locked Route Map

Keep the current route map exactly as-is:

- `/`
- `/login`
- `/signup`
- `/teacher`
- `/teacher/dashboard`
- `/teacher/classes`
- `/teacher/classes/[id]/attendance`
- `/teacher/question-bank`
- `/teacher/assignments/create`
- `/teacher/assignments/[id]`
- `/teacher/profile`
- `/student/assignment/[linkId]`

### Route Clusters To Implement

Execute the work in this order:

1. shared shell and token layer
2. public/auth
3. teacher workflow pages
4. student assignment flow
5. full responsive QA and visual consistency closeout

## Architecture And Implementation Rules

Follow these rules strictly:

- preserve existing route URLs
- preserve backend/API contracts
- preserve product behavior and content hierarchy
- align the system to Material 3 structure, hierarchy, and states while keeping the current brand palette and tone
- update the teacher desktop sidebar from `w-64` to a `w-56` rail unless a very small responsive adjustment is needed for implementation safety
- reclaim sidebar space in the main content wrapper rather than letting the shell stay visually sparse
- prefer shared-system fixes in `globals.css`, `teacher/layout`, `AuthShell`, and repeated container/card/button/input patterns before page-specific edits
- convert decorative or weakly differentiated states into clearer MD3-style filled, tonal, outlined, selected, and focused states
- tighten oversized spacing on mobile/tablet while keeping desktop polished and breathable
- preserve minimum 44px tap targets on mobile/tablet
- avoid literal Google color tokens unless a state needs contrast help and the brand token set is insufficient

### Material 3 Patterns To Apply

Use Material 3 guidance consistently for:

- app bar hierarchy
- navigation rail/sidebar selected state treatment
- surface container tiers and elevation
- filled vs tonal vs outlined action hierarchy
- input field focus/hover/disabled states
- card grouping and vertical rhythm
- feedback banners, helper text, and emphasis levels where present

### Sidebar And Shell Targets

Use these as concrete implementation defaults:

- desktop sidebar width: `224px`
- desktop shell should feel tighter and more useful, not compressed
- mobile bottom nav should read closer to an MD3 navigation bar
- top app bar padding should be more systematic and less decorative
- content gutters should scale cleanly across `375`, `768`, and `1440`

## Jira, Git, And PR Discipline

Use the Material 3 refresh epic as the execution spine.
Execute one Jira story at a time.

Recommended branch naming:

- `feature/SSA-<story-key>-md3-shell`
- `feature/SSA-<story-key>-md3-auth`
- `feature/SSA-<story-key>-md3-teacher-pages`
- `feature/SSA-<story-key>-md3-student-flow`

PR rules:

- one Jira story per PR
- include before/after notes
- include responsive screenshots or browser evidence at `375`, `768`, and `1440`
- state any remaining Material 3 drift explicitly

## Validation Rules

After each story:

- run `npm run lint`
- run `npm run test`
- run `npm run build`
- perform browser QA at `375px`, `768px`, and `1440px`

### Acceptance Checks

- the teacher sidebar is visibly narrower and content space is reclaimed
- public/auth, teacher, and student shells feel like one coherent system
- buttons, cards, inputs, and nav states feel Material 3 aligned without losing the brand
- mobile/tablet spacing is tighter and more usable than the current desktop-heavy spacing
- no route or API regressions are introduced
- no page feels cramped after density changes

### Final Closeout

Do not mark the epic done until:

- shared shell and token changes are complete
- all touched routes pass lint, test, and build
- browser QA is complete for the touched surfaces
- remaining non-blocking drift is documented in Jira

## S — Steps

Follow these steps in order:

1. audit the current shell, token layer, and route clusters against brand-safe Material 3 principles
2. implement shared shell, navigation, and token changes first
3. implement public/auth adjustments
4. implement teacher workflow refinements
5. implement student assignment refinements
6. run responsive QA and visual consistency closeout
7. document results and residual drift in Jira

## M — Mandatory Output Format

Your first response must contain exactly these sections:

### 1. Material 3 Audit
- Current shell and token drift
- Sidebar and navigation issues
- Highest-risk route clusters
- Current Jira execution context

### 2. Shared-System Implementation Plan
- Token and primitive updates
- Shell and navigation changes
- Route cluster order
- Responsive and state-system targets

### 3. Jira And Git Plan
- Epic and story being advanced
- Branch and PR plan
- Validation and evidence plan

### 4. Immediate Implementation Start
- First shared-system edit
- First shell/sidebar change
- First route cluster to refine
- First validation step

After that first response, do not stop at planning.
Begin implementation immediately.

For every later update, use this structure:

### Material 3 Delivery Update
- Jira story advanced
- Shared primitives adjusted
- Routes refined
- Validation run
- Remaining drift or blockers
- Next step
```
