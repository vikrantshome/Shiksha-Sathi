# Stitch Export Implementation Matrix

> Maps every shipped route to its canonical local export folder, responsive companions, current repo status, and implementing Jira story.

Last updated: 2026-03-30
Epic: `SSA-248`

---

## Route → Export Mapping

| Route | Canonical Export Folder(s) | Desktop | Tablet | Mobile | Repo File(s) | Jira Story | Status |
|---|---|---|---|---|---|---|---|
| `/` | `shiksha_sathi_landing_page` | ✅ | — | — | `src/app/page.tsx` | SSA-251 | ⏳ Needs audit |
| `/login` | `teacher_signup_refined` (mirrored) | ✅ | `teacher_signup_tablet` | `teacher_signup_mobile` | `src/app/login/page.tsx`, `src/components/AuthShell.tsx` | SSA-251 | ⏳ Needs audit |
| `/signup` | `teacher_signup_refined` | ✅ | `teacher_signup_tablet` | `teacher_signup_mobile` | `src/app/signup/page.tsx`, `src/components/AuthShell.tsx` | SSA-251 | ⏳ Needs audit |
| `/teacher` (redirect) | — | — | — | — | `src/app/teacher/page.tsx` | — | N/A |
| `/teacher/dashboard` | `teacher_dashboard_consolidated` | ✅ | `teacher_dashboard_tablet` | `teacher_dashboard_mobile` | `src/app/teacher/dashboard/page.tsx` | SSA-252 | ⏳ Needs audit |
| `/teacher/classes` | `classes_management_refined` | ✅ | `classes_management_tablet` | `classes_management_mobile` | `src/app/teacher/classes/page.tsx` | SSA-252 | ⏳ Needs audit |
| `/teacher/classes/[id]/attendance` | `attendance_register_shiksha_sathi` | ✅ | `attendance_register_tablet` | `attendance_register_mobile` | `src/app/teacher/classes/[id]/attendance/page.tsx` | SSA-252 | ⏳ Needs audit |
| `/teacher/question-bank` | `question_bank_browse_select` | ✅ | `question_bank_tablet` | `question_bank_mobile` | `src/app/teacher/question-bank/page.tsx`, `src/components/QuestionBankFilters.tsx`, `src/components/QuestionCard.tsx`, `src/components/AssignmentTray.tsx` | SSA-253 | ✅ Tailwind done |
| `/teacher/assignments/create` | `review_organize_assignment` | ✅ | — | — | `src/app/teacher/assignments/create/page.tsx`, `src/components/CreateAssignmentForm.tsx` | SSA-253 | ✅ Tailwind done |
| `/teacher/assignments/[id]` | `teacher_assignment_report` | ✅ | `assignment_report_tablet` | `assignment_report_mobile` | `src/app/teacher/assignments/[id]/page.tsx` | SSA-254 | ⏳ Needs audit |
| `/teacher/profile` | `teacher_profile_shiksha_sathi_1` | ✅ | `teacher_profile_tablet` | `teacher_profile_mobile` | `src/app/teacher/profile/page.tsx`, `src/components/ProfileForm.tsx` | SSA-254 | ✅ Tailwind done |
| `/student/assignment/[linkId]` | `identity_entry`, `assignment_taking`, `results` | ✅ | — | — | `src/app/student/assignment/[linkId]/page.tsx`, `src/components/StudentAssignmentForm.tsx` | SSA-255 | ✅ Tailwind done |

---

## Shared Infrastructure

| Surface | Canonical Export Folder | Repo File(s) | Jira Story | Status |
|---|---|---|---|---|
| Design system tokens | `the_digital_atelier` + `design-system.md` | `src/app/globals.css`, `design-system.md` | SSA-249 | ⏳ Needs audit |
| Teacher shell (layout) | `teacher_dashboard_consolidated` (nav shell) | `src/app/teacher/layout.tsx` | SSA-249 | ⏳ Needs legacy cleanup |
| Publish/Share flow | `publish_share_assignment_refined` | `src/components/CreateAssignmentForm.tsx` (publish step) | SSA-253 | ⏳ Needs audit |

---

## Legacy Items To Remove From Teacher Shell

Per PRISM prompt section "Architecture And Implementation Rules":

| Item | Currently Found In | Action |
|---|---|---|
| Settings link (`href="#"`) | `src/app/teacher/layout.tsx` L309-315 | **Remove** — no Settings route exists |
| Support/Help link (`href="#"`) | `src/app/teacher/layout.tsx` L316-322 | **Remove** — no Support route exists |
| Analytics tab (mobile bottom bar) | `src/app/teacher/layout.tsx` L371-378 | **Remove** — no analytics-only destination |
| `IconAnalytics`, `IconSettings`, `IconHelp` components | `src/app/teacher/layout.tsx` L69-98 | **Remove** — unused after nav cleanup |

---

## Execution Order

1. **SSA-249** — Align design tokens + teacher shell cleanup
2. **SSA-250** — Lock canonical export matrix (this document)
3. **SSA-251** — Landing page + auth shell refresh
4. **SSA-252** — Dashboard + classes + attendance
5. **SSA-253** — Question bank + review + publish workflow
6. **SSA-254** — Assignment report + profile
7. **SSA-255** — Student assignment journey
8. **SSA-256** — Responsive regression closeout

---

## Non-Canonical Exports (Do Not Implement From)

| Folder | Reason |
|---|---|
| `teacher_dashboard` | Superseded by `teacher_dashboard_consolidated` |
| `teacher_dashboard_shiksha_sathi` | Superseded by `teacher_dashboard_consolidated` |
| `question_bank` | Superseded by `question_bank_browse_select` |
| `question_bank_select_questions` | Superseded by `question_bank_browse_select` |
| `review_and_organize_assignment` | Superseded by `review_organize_assignment` |
| `publish_share_assignment` | Superseded by `publish_share_assignment_refined` |
| `publish_and_share_assignment` | Superseded by `publish_share_assignment_refined` |
| `teacher_signup_shiksha_sathi` | Superseded by `teacher_signup_refined` |
| `classes_management_shiksha_sathi_1` | Older duplicate |
| `classes_management_shiksha_sathi_2` | Older duplicate |
| `teacher_profile_shiksha_sathi_2` | Older duplicate |
| `answer_questions` | Superseded by `assignment_taking` |
| `product_requirements_document.md` | Non-UI artifact |
