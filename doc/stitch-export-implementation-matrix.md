# Stitch Export Implementation Matrix

Last updated: 2026-03-30 (wave started)
Implementation epic: `SSA-248` (In Progress)
Parity record: `SSA-247`
Canonical export root: `Shiksha Sathi/doc/stitch_shiksha_sathi_ui_refresh`

## Story Map

| Jira Story | Scope | Branch | Status |
|-----------|-------|--------|--------|
| `SSA-257` | Canon checklist lock + matrix update | `feature/SSA-257-canonical-export-checklist` | ✅ In Progress |
| `SSA-258` | Token cleanup + Stitch color palette sync | `feature/SSA-258-teacher-shell-tokens` | ⬜ Queued |
| `SSA-259` | Landing page + auth shell refresh | `feature/SSA-259-landing-auth-refresh` | ⬜ Queued |
| `SSA-260` | Dashboard + classes + attendance | `feature/SSA-260-dashboard-classes-attendance` | ⬜ Queued |
| `SSA-261` | Question bank + publish flow | `feature/SSA-261-question-bank-publish-flow` | ⬜ Queued |
| `SSA-262` | Assignment report + teacher profile | `feature/SSA-262-report-profile` | ⬜ Queued |
| `SSA-263` | Student assignment journey | `feature/SSA-263-student-assignment-journey` | ⬜ Queued |
| `SSA-264` | Responsive regression closeout | `feature/SSA-264-responsive-regression-closeout` | ⬜ Queued |

## Confirmed Implementation Decisions

- **Color palette**: Sync to Stitch export (primary: `#12423f`), not design-system.md v1 teal
- **Hero image**: Use Google CDN image URLs from export HTML as-is
- **Token authority**: Export HTML `tailwind.config` is the color source of truth for this wave

## Purpose

This matrix freezes the canonical Stitch export set for the current coding wave so implementation agents can work from one stable reference without reopening design-direction decisions.

## Rules

- Use only the canonical export folders in this file for implementation.
- Treat all legacy duplicate exports as comparison-only unless a new curation pass explicitly changes the set.
- Keep the existing route map and backend contracts stable.
- Mirror `teacher_signup_refined` for `/login` because the latest export bundle does not include a dedicated login screen.
- Use `assignment_taking`, not `answer_questions`, for the student answer-stage reference.

## Route To Export Map

| Route / Surface | Canonical Desktop Export | Tablet Export | Mobile Export | Notes |
| --- | --- | --- | --- | --- |
| `/` | `shiksha_sathi_landing_page` | — | — | Use current route; no new route required. |
| `/login` | `teacher_signup_refined` | `teacher_signup_tablet` | `teacher_signup_mobile` | Mirror signup shell with login-specific copy and fields. |
| `/signup` | `teacher_signup_refined` | `teacher_signup_tablet` | `teacher_signup_mobile` | Primary auth-shell source. |
| `/teacher` and `/teacher/dashboard` | `teacher_dashboard_consolidated` | `teacher_dashboard_tablet` | `teacher_dashboard_mobile` | Remove unsupported shell promises while preserving real teacher flows. |
| `/teacher/classes` | `classes_management_refined` | `classes_management_tablet` | `classes_management_mobile` | Keep class creation/manage/archive/delete behavior. |
| `/teacher/classes/[id]/attendance` | `attendance_register_shiksha_sathi` | `attendance_register_tablet` | `attendance_register_mobile` | Keep real attendance statuses only: Present, Absent, Late. |
| `/teacher/question-bank` | `question_bank_browse_select` | `question_bank_tablet` | `question_bank_mobile` | Workflow remains browse -> select. |
| `/teacher/assignments/create` review state | `review_organize_assignment` | — | — | Main review state for assignment assembly. |
| `/teacher/assignments/create` publish/share state | `publish_share_assignment_refined` | `publish_share_tablet` | `publish_share_mobile` | Share must remain link-based. |
| `/teacher/assignments/[id]` | `teacher_assignment_report` | `assignment_report_tablet` | `assignment_report_mobile` | Teacher report surface. |
| `/teacher/profile` | `teacher_profile_shiksha_sathi_1` | `teacher_profile_tablet` | `teacher_profile_mobile` | `teacher_profile_shiksha_sathi_2` is legacy. |
| `/student/assignment/[linkId]` identity stage | `identity_entry` | — | — | Same route, staged UI. |
| `/student/assignment/[linkId]` answer stage | `assignment_taking` | — | — | Do not use `answer_questions`. |
| `/student/assignment/[linkId]` results stage | `results` | — | — | Keep result feedback aligned with current grading contracts. |

## Legacy Exports To Ignore For This Wave

- `teacher_dashboard`
- `teacher_dashboard_shiksha_sathi`
- `question_bank`
- `question_bank_select_questions`
- `review_and_organize_assignment`
- `publish_share_assignment`
- `publish_and_share_assignment`
- `teacher_signup_shiksha_sathi`
- `classes_management_shiksha_sathi_1`
- `classes_management_shiksha_sathi_2`
- `teacher_profile_shiksha_sathi_2`
- `answer_questions`
- `product_requirements_document.md`

## Shared Implementation Notes

- Canonical supporting docs:
  - `Shiksha Sathi/design-system.md`
  - `Shiksha Sathi/doc/stitch-board-curation-checklist.md`
  - `Shiksha Sathi/doc/stitch-manual-cleanup-playbook.md`
- Reuse current component boundaries where possible:
  - `QuestionBankFilters`
  - `AssignmentTray`
  - `CreateAssignmentForm`
  - `StudentAssignmentForm`
  - `ProfileForm`
- Remove unsupported legacy affordances from touched pages even if older code still contains them:
  - analytics/stats-only destinations
  - settings/support destinations presented as shipped routes
  - live-class scheduling cues
  - Google Classroom publishing
  - off-brand labels like `The Academic Curator`

## Validation Gate

For any touched surface, implementation is not complete until:

- `npm run lint` passes
- `npm run test` passes
- `npm run build` passes
- browser checks pass at `1440px`, `768px`, and `375px`
- the shipped route matches the canonical export intent more closely than any legacy duplicate export
