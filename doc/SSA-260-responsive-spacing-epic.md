# Responsive Spacing & Density Refinement Epic

**Epic Key:** `SSA-260`  
**Epic Name:** Responsive Spacing & Density Refinement Across Shiksha Sathi  
**Labels:** `responsive-spacing`, `density-refinement`, `uiux`, `mobile`, `tablet`, `design-system`

---

## Epic Summary

Refine the shipped Shiksha Sathi frontend so spacing and density feel intentional, balanced, and responsive across mobile, tablet, and desktop without changing product behavior, route contracts, or the established visual language.

### Objectives
- Audit current shipped UI for oversized or inconsistent spacing across breakpoints
- Tighten mobile and tablet density where desktop-scale spacing was carried over too literally
- Preserve existing design direction, route map, and backend/API behavior
- Fix shared shells, wrappers, and repeated layout primitives first
- Use route-level spacing adjustments only where shared fixes are insufficient
- Validate every touched surface at mobile, tablet, and desktop breakpoints

### Success Criteria
- No obviously oversized vertical whitespace remains on mobile
- No desktop-scale gutters carried unchanged to mobile/tablet when they feel wasteful
- No cramped or collapsed content appears after spacing reduction
- No sticky bars, trays, or shell navigation break
- Desktop still feels premium rather than compressed
- Shared spacing logic is used where practical
- No route/API regressions introduced

---

## Child Stories

### SSA-261 — Audit shared spacing and shell density
**Status:** ✅ IN PROGRESS  
**Branch:** `feature/SSA-261-spacing-audit`

**Scope:**
- Audit `src/app/teacher/layout.tsx` (teacher shell)
- Audit `src/components/AuthShell.tsx` (auth pages wrapper)
- Audit `src/app/globals.css` (design tokens)
- Identify shared spacing patterns that cause mobile/tablet bloat
- Implement shared spacing fixes in shells first

**Files to change:**
- `src/app/teacher/layout.tsx`
- `src/components/AuthShell.tsx`
- `src/app/globals.css`

**Validation:**
- `/teacher/dashboard` at 375px, 768px, 1440px
- `/teacher/classes` at 375px, 768px, 1440px
- `/login`, `/signup` at 375px, 768px, 1440px

---

### SSA-262 — Refine landing and auth responsive spacing
**Status:** ⏳ PENDING  
**Branch:** `feature/SSA-262-auth-density`

**Scope:**
- `/` (landing page) hero and section spacing
- `/login` and `/signup` form density
- AuthShell decorative elements responsive tuning

**Files to change:**
- `src/app/page.tsx`
- `src/app/login/page.tsx`
- `src/app/signup/page.tsx`

---

### SSA-263 — Refine teacher dashboard, classes, and attendance spacing
**Status:** ⏳ PENDING  
**Branch:** `feature/SSA-263-teacher-spacing`

**Scope:**
- `/teacher/dashboard` bento grid, stat cards, curriculum explorer
- `/teacher/classes` grid layout, card density
- `/teacher/classes/[id]/attendance` table/card fallback

**Files to change:**
- `src/app/teacher/dashboard/page.tsx`
- `src/app/teacher/classes/page.tsx`
- `src/app/teacher/classes/[id]/attendance/page.tsx`

---

### SSA-264 — Refine question bank, create flow, report, and profile spacing
**Status:** ⏳ PENDING  
**Branch:** `feature/SSA-264-workflow-spacing`

**Scope:**
- `/teacher/question-bank` filters, card tray
- `/teacher/assignments/create` form density
- `/teacher/assignments/[id]` report layout
- `/teacher/profile` form spacing

**Files to change:**
- `src/app/teacher/question-bank/page.tsx`
- `src/components/QuestionBankFilters.tsx`
- `src/components/AssignmentTray.tsx`
- `src/components/CreateAssignmentForm.tsx`
- `src/app/teacher/assignments/create/page.tsx`
- `src/app/teacher/assignments/[id]/page.tsx`
- `src/app/teacher/profile/page.tsx`
- `src/components/ProfileForm.tsx`

---

### SSA-265 — Refine student assignment flow spacing
**Status:** ⏳ PENDING  
**Branch:** `feature/SSA-265-student-spacing`

**Scope:**
- `/student/assignment/[linkId]` identity entry, assignment taking, results

**Files to change:**
- `src/app/student/assignment/[linkId]/page.tsx`
- `src/components/StudentAssignmentForm.tsx`

---

### SSA-266 — Run responsive QA and regression closeout
**Status:** ⏳ PENDING  
**Branch:** `feature/SSA-266-responsive-closeout`

**Scope:**
- Full responsive regression across all routes
- Cross-browser validation (Chrome, Safari, Firefox)
- Performance check (no layout thrashing from spacing changes)
- Documentation update

**Validation matrix:**
| Breakpoint | Width | Devices |
|------------|-------|---------|
| Mobile S | 375px | iPhone SE, small Android |
| Mobile L | 412px | iPhone 14/15 Pro Max |
| Tablet | 768px | iPad, small tablets |
| Tablet Pro | 1024px | iPad Pro |
| Desktop | 1440px | MacBook Pro 14" |
| Desktop Large | 1920px | External monitors |

---

## Execution Timeline

| Story | Start | End | Status |
|-------|-------|-----|--------|
| SSA-261 | 2026-03-30 | 2026-03-30 | IN PROGRESS |
| SSA-262 | 2026-03-30 | 2026-03-30 | PENDING |
| SSA-263 | 2026-03-31 | 2026-03-31 | PENDING |
| SSA-264 | 2026-03-31 | 2026-03-31 | PENDING |
| SSA-265 | 2026-04-01 | 2026-04-01 | PENDING |
| SSA-266 | 2026-04-01 | 2026-04-01 | PENDING |

---

## Design System Reference

All changes must align with:
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/design-system.md`
- `/Users/anuraagpatil/naviksha/Shiksha Sathi/doc/stitch-export-implementation-matrix.md`

### Responsive Density Targets

#### Mobile (< 768px)
- Outer page padding: `px-4` to `px-5` (16–20px)
- Section rhythm: `py-8` to `py-12` (32–48px)
- Card/container padding: `p-4` to `p-5` (16–20px)
- Internal stack gaps: `gap-3` to `gap-6` (12–24px)

#### Tablet (768px – 1023px)
- Outer page padding: `px-6` to `px-8` (24–32px)
- Section rhythm: `py-12` to `py-16` (48–64px)

#### Desktop (≥ 1024px)
- Preserve premium airy feel
- Keep larger spacing only where it reads intentional rather than empty

---

## Git/PR Conventions

**Branch naming:**
```
feature/SSA-261-spacing-audit
feature/SSA-262-auth-density
feature/SSA-263-teacher-spacing
feature/SSA-264-workflow-spacing
feature/SSA-265-student-spacing
feature/SSA-266-responsive-closeout
```

**PR title format:**
```
[SSA-261] Audit and refine shared spacing shells (auth + teacher layout)
```

**PR body must include:**
- Shared primitives adjusted
- Routes/components changed
- Validation run
- Browser QA summary
- Remaining spacing drift if any

---

## Notes

This epic does NOT:
- Change route URLs
- Alter backend/API contracts
- Redesign information architecture
- Reopen broader visual redesign debates
- Introduce speculative feature work

This epic DOES:
- Replace repeated oversized `px-*`, `py-*`, `p-*`, `gap-*`, `space-y-*` patterns with responsive scales
- Preserve minimum 44px tap targets on mobile and tablet
- Keep desktop premium and airy while removing spacing that reads empty rather than intentional
- Use systemized responsive class patterns instead of arbitrary one-off values
