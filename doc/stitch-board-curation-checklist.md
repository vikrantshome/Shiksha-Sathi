# Stitch Board Curation Checklist

Last updated: 2026-03-30
Jira issue: `SSA-247`
Stitch project: `projects/15430468290006367405`

## Current Snapshot

- `get_project` currently returns `47` total project instances.
- `42` of those instances are actual screen instances.
- `5` of those instances are design-system asset instances.
- `list_screens` currently returns `42` screens.
- Attendance and the generated tablet/mobile variants are now visible through the canonical Stitch listing.
- The remaining cleanup problem is not generation anymore. It is board curation: legacy screens and corrected screens still coexist.

## Goal

- Keep one canonical desktop screen per shipped product surface.
- Keep responsive companions grouped under the correct desktop parent.
- De-emphasize or archive superseded legacy screens.
- Move the PRD artifact out of the live UI board.

## Canonical Desktop Set

Use this as the target desktop source of truth for the live board.

| Surface | Preferred Screen Title | Screen ID | Status |
| --- | --- | --- | --- |
| Landing | `Shiksha Sathi Landing Page` | `20b31904e7e04723aab1fc45b7e49d83` | Keep |
| Teacher signup | `Teacher Signup - Refined` | `7ffee3c82322400188c0ca04d1132b7e` | Keep |
| Teacher dashboard | `Teacher Dashboard - Consolidated` | `4e482ce231044db3a3e1d4020557f2dd` | Keep |
| Classes management | `Classes Management - Refined` | `b142daef0c10488c98d0ed9c26364e8d` | Keep |
| Attendance | `Attendance Register - Shiksha Sathi` | `cb8faf139e2642fa8f3bb25d02a848f1` | Keep |
| Question bank browse/select | `Question Bank - Browse & Select` | `323196627390413da51eb50ecb7808a1` | Keep |
| Assignment review | `Review & Organize Assignment` | `c950c588ad8f4e2ca3dd9f67061dfd9d` | Keep |
| Assignment publish/share | `Publish & Share Assignment - Refined` | `85722e22eceb46f290619bea92e3ecb7` | Keep |
| Teacher assignment report | `Teacher Assignment Report` | `bd86315c40c944169da4872a36846e8f` | Keep |
| Teacher profile | `Teacher Profile - Shiksha Sathi` | `018c4922f78942078b46dc16df6a731d` | Keep |
| Student identity entry | `Identity Entry` | `734aebf282074835853172fa7c6b5629` | Keep |
| Student answer flow | `Assignment Taking` | `0d0865abeb4649c9969d6f240bfc3ba4` | Keep for now |
| Student results | `Results` | `aa690082cbd64a98bc944f09f59349c9` | Keep |

## Responsive Companions To Keep

These should sit with their matching desktop parent, not as unrelated free-floating board items.

### Dashboard

| Breakpoint | Screen Title | Screen ID |
| --- | --- | --- |
| Tablet | `Teacher Dashboard (Tablet)` | `c75219164b444feb942d0d9bd62f6a47` |
| Mobile | `Teacher Dashboard (Mobile)` | `776f47641944438ab70ccbdcf584883d` |

### Classes

| Breakpoint | Screen Title | Screen ID |
| --- | --- | --- |
| Tablet | `Classes Management (Tablet)` | `c00b0910347e4a28ad4b3e0ed4eea28e` |
| Mobile | `Classes Management (Mobile)` | `93d15fc7e494424e8a548ee513dbe22a` |

### Attendance

| Breakpoint | Screen Title | Screen ID |
| --- | --- | --- |
| Tablet | `Attendance Register (Tablet)` | `92b00504b0c944f6972417591e9a8e65` |
| Mobile | `Attendance Register (Mobile)` | `ba4a36337de941cabb99a69af666f961` |

### Question Bank

| Breakpoint | Screen Title | Screen ID |
| --- | --- | --- |
| Tablet | `Question Bank (Tablet)` | `0618054b9b214023a75826749f3f997b` |
| Mobile | `Question Bank (Mobile)` | `4564ce3f405c4fac93f76af1c15aa26b` |

### Publish And Share

| Breakpoint | Screen Title | Screen ID |
| --- | --- | --- |
| Tablet | `Publish & Share (Tablet)` | `3b5d26ad32d04cab9c9a1fcb3423df83` |
| Mobile | `Publish & Share (Mobile)` | `6b09a993448846d1b505604a167f7a5f` |

### Signup

| Breakpoint | Screen Title | Screen ID |
| --- | --- | --- |
| Tablet | `Teacher Signup (Tablet)` | `c5adce8d626a4fce89420f310d896887` |
| Mobile | `Teacher Signup (Mobile)` | `ff0efae91ee84ebfb06f657124354344` |

### Profile

| Breakpoint | Screen Title | Screen ID |
| --- | --- | --- |
| Tablet | `Teacher Profile (Tablet)` | `695a3e9ec6934ef1b50e464a2fab776b` |
| Mobile | `Teacher Profile (Mobile)` | `cf357dc206cb48f08b20b92db9ebc531` |

### Assignment Report

| Breakpoint | Screen Title | Screen ID |
| --- | --- | --- |
| Tablet | `Assignment Report (Tablet)` | `df18d603982049d1b6b8bb7a16b7bdf9` |
| Mobile | `Assignment Report (Mobile)` | `84e9f6230c2a4b8a8e27c6db135fba95` |

## Legacy Screens To De-Emphasize Or Archive

These are the main candidates to remove from the visible product-parity board once the corrected set is promoted.

| Legacy Screen Title | Screen ID | Reason |
| --- | --- | --- |
| `Teacher Dashboard` | `bf8c69e2fffb40748df3240f0dd411cd` | Superseded by consolidated dashboard |
| `Teacher Dashboard - Shiksha Sathi` | `064d53c0434749c898bd60aed2e610f0` | Superseded by consolidated dashboard |
| `Question Bank` | `0d04d982c7da43b1899e9627bd67df7c` | Superseded by browse-and-select artifact |
| `Question Bank - Select Questions` | `0108925018704dd293a3985ed4501451` | Superseded by browse-and-select artifact |
| `Review and Organize Assignment` | `3d601b61ce0f42aea6763ff3374ffd98` | Superseded by corrected review screen |
| `Publish and Share Assignment` | `50aed12f8b6f430298b92a6cb078b378` | Superseded by refined publish screen |
| `Answer Questions` | `9f7e5710b2984cc1a23d29b6cf71d3d0` | Still implies unsupported student affordances |
| `Teacher Signup - Shiksha Sathi` | `bfcd337a872b4e1799204e84cafee5bb` | Superseded by refined signup screen |
| `Classes Management - Shiksha Sathi` | `9b917c0c2a524290a22b99560b7653a6` | Older duplicate classes screen |
| `Classes Management - Shiksha Sathi` | `b4a13b0ea62d4fdf84f21017c795a095` | Older duplicate classes screen |
| `Teacher Profile - Shiksha Sathi` | `72919d9ec45f49bebbe9389b116ade3f` | Older duplicate profile screen |

## Non-UI Artifact To Remove From Product Board

| Artifact | Screen ID | Action |
| --- | --- | --- |
| `Product Requirements Document` | `9275e2bea19f4bb1a3ffe2dce3785e84` | Move out of live UI board or relabel as documentation |

## Final Validation Checklist

- [ ] One desktop screen remains for each shipped product surface.
- [ ] `Teacher Dashboard - Consolidated` is the visible teacher dashboard reference.
- [ ] `Question Bank - Browse & Select` is the visible question-bank reference.
- [ ] `Publish & Share Assignment - Refined` is the visible publish/share reference.
- [ ] `Teacher Signup - Refined` is the visible signup reference.
- [ ] `Classes Management - Refined` is the visible classes reference.
- [ ] `Attendance Register - Shiksha Sathi` is visible on the board.
- [ ] `Teacher Assignment Report` is visible on the board.
- [ ] Tablet/mobile companions are grouped with their desktop parent.
- [ ] PRD artifact is no longer mixed into the live UI board.
- [ ] Old dashboard/question-bank/review/publish/classes/profile variants are archived or clearly de-emphasized.

## Current Limitation

The Stitch MCP tools available in this session can generate and retrieve screens, but they do not expose delete, archive, reorder, or pin controls. This checklist is meant to drive the final board cleanup step in the Stitch UI or another control surface with board-management actions.
