# Shiksha Sathi Brand-Aligned Material 3 Jira Plan

## Summary

This planning note is the Jira-ready execution spine for the Shiksha Sathi Brand-Aligned Material 3 refresh wave.

It is intentionally narrower than the full Stitch export implementation wave:

- keep the current route map and backend contracts
- keep the current brand palette and voice
- bring layout, navigation, states, elevation, and responsive density closer to Material Design 3
- reduce the teacher desktop sidebar from `256px` to `224px`

## Epic

- Summary: `Brand-Aligned Material 3 UI Refresh Across Shiksha Sathi`
- Issue type: `Epic`
- Labels:
  - `brand-md3`
  - `material-3`
  - `uiux`
  - `responsive`
  - `design-system`
  - `teacher-workflow`
  - `student-experience`

### Epic Description

Implement a brand-safe Material Design 3 refinement wave across the shipped Shiksha Sathi frontend.

This epic should:

- align shared shells, navigation, spacing, surfaces, elevation, and component states to Material 3 principles
- preserve the current route map, backend contracts, and workflow order
- reduce desktop shell waste by tightening the teacher sidebar to 224px
- improve mobile and tablet density without making desktop feel compressed
- keep the current Shiksha Sathi brand personality rather than adopting raw Google visual defaults

## Story Breakdown

### 1. Audit shared shell, tokens, and Material 3 drift

- Issue type: `Story`
- Suggested summary: `Audit shared shell, tokens, and Material 3 drift`
- Labels:
  - `brand-md3`
  - `material-3`
  - `uiux`
  - `design-system`
- Description:
  - audit `globals.css`, `teacher/layout`, `AuthShell`, and the current page wrapper/card/button/input patterns
  - identify the exact gaps between the current implementation and brand-safe Material 3 structure
  - record the shared primitives that must change before page-level work begins
- Done when:
  - the audit comment lists current shell drift, state drift, spacing drift, and the route-cluster order

### 2. Tighten teacher shell and align shared tokens to brand-safe Material 3

- Issue type: `Story`
- Suggested summary: `Tighten teacher shell and align shared tokens to brand-safe Material 3`
- Labels:
  - `brand-md3`
  - `material-3`
  - `uiux`
  - `design-system`
  - `teacher-workflow`
- Description:
  - reduce the desktop teacher sidebar from `w-64` to `w-56`
  - refine sidebar item spacing and selected state
  - improve top app bar spacing and action hierarchy
  - align shell surfaces, container tiers, elevation, and content gutters to Material 3 principles
- Done when:
  - the teacher shell is the system baseline for the rest of the app
  - content space is visibly reclaimed from the old sidebar width

### 3. Refresh public and auth surfaces to brand-aligned Material 3

- Issue type: `Story`
- Suggested summary: `Refresh public and auth surfaces to brand-aligned Material 3`
- Labels:
  - `brand-md3`
  - `material-3`
  - `uiux`
  - `responsive`
- Description:
  - align landing, login, and signup to the updated shell and token system
  - improve form-field states, button hierarchy, spacing, and card/container structure
  - tighten mobile/tablet density where the current implementation still feels oversized
- Done when:
  - `/`, `/login`, and `/signup` feel system-consistent with the new shell and states

### 4. Refresh teacher workflow pages to Material 3 structure and responsive density

- Issue type: `Story`
- Suggested summary: `Refresh teacher workflow pages to Material 3 structure and responsive density`
- Labels:
  - `brand-md3`
  - `material-3`
  - `uiux`
  - `responsive`
  - `teacher-workflow`
- Description:
  - update dashboard, classes, attendance, question bank, assignment create, assignment report, and profile surfaces
  - align card grouping, action hierarchy, table/list density, and multi-column behavior to the shared system
  - fix remaining desktop-heavy spacing at tablet/mobile widths
- Done when:
  - teacher route cluster feels coherent and MD3-aligned without changing existing workflows

### 5. Refresh student assignment flow to Material 3-responsive patterns

- Issue type: `Story`
- Suggested summary: `Refresh student assignment flow to Material 3-responsive patterns`
- Labels:
  - `brand-md3`
  - `material-3`
  - `uiux`
  - `responsive`
  - `student-experience`
- Description:
  - update identity, active assignment, and results surfaces to the shared token/state system
  - improve progress, answer area spacing, result cards, and mobile comfort
  - keep tap targets >= 44px and preserve the current flow order
- Done when:
  - the student route feels visually consistent with the rest of the app and works cleanly on mobile/tablet

### 6. Run full responsive QA and visual consistency closeout

- Issue type: `Story`
- Suggested summary: `Run full responsive QA and visual consistency closeout for Material 3 refresh`
- Labels:
  - `brand-md3`
  - `material-3`
  - `uiux`
  - `responsive`
  - `design-system`
- Description:
  - run `npm run lint`, `npm run test`, and `npm run build`
  - validate all touched surfaces at `375px`, `768px`, and `1440px`
  - capture any residual drift and either fix it or log it explicitly
- Done when:
  - the refresh is validated across public, teacher, and student surfaces and residual drift is documented

## Jira Execution Rules

- Do not reopen `SSA-247` or `SSA-248`.
- Use one story at a time.
- Move the active story to `In Progress` before touching code.
- Add a start comment with:
  - route cluster
  - shared primitives being updated
  - responsive breakpoints to validate
- Add a closeout comment with:
  - files/surfaces touched
  - validation run
  - residual drift, if any

## Branch And PR Rules

- Branch naming:
  - `feature/SSA-<story-key>-md3-shell`
  - `feature/SSA-<story-key>-md3-auth`
  - `feature/SSA-<story-key>-md3-teacher-pages`
  - `feature/SSA-<story-key>-md3-student-flow`
- PR scope:
  - one story per PR
  - include before/after notes
  - include browser evidence for `375`, `768`, and `1440`
  - note any residual drift explicitly

## Validation Checklist

- `npm run lint`
- `npm run test`
- `npm run build`
- browser QA at:
  - `375px`
  - `768px`
  - `1440px`

### Visual Acceptance

- teacher desktop sidebar is clearly narrower and less wasteful
- content area gains useful space after shell changes
- public/auth, teacher, and student surfaces read as one system
- buttons, cards, inputs, and nav states feel Material 3 aligned
- mobile/tablet density improves without feeling cramped
- no route/API regressions are introduced
