# Shiksha Sathi — Manual Testing Instructions

**Version:** 3.0
**Date:** March 30, 2026
**Build:** `main` (`f9e156a`)
**Design System:** The Digital Atelier (Stitch Export Bundle)
**Epic:** SSA-248 (Done)

---

## Table of Contents

1. [Prerequisites & Setup](#-prerequisites--setup)
2. [Automated Validation](#-automated-validation)
3. [Landing Page](#1-landing-page---)
4. [Authentication — Login & Signup](#2-authentication--login--signup)
5. [Teacher Dashboard](#3-teacher-dashboard)
6. [Classes Management](#4-classes-management)
7. [Question Bank — Browse & Select](#5-question-bank--browse--select)
8. [Assignment Creation — Review & Publish](#6-assignment-creation--review--publish)
9. [Assignment Report](#7-assignment-report)
10. [Teacher Profile](#8-teacher-profile)
11. [Student Assignment Journey](#9-student-assignment-journey)
12. [Design System & Visual Regression](#10-design-system--visual-regression)
13. [Responsive Breakpoints](#11-responsive-breakpoints)
14. [Cross-Browser Matrix](#12-cross-browser-matrix)
15. [API Smoke Tests](#13-api-smoke-tests)
16. [Production Readiness Checklist](#-production-readiness-checklist)

---

## 🔧 Prerequisites & Setup

### Requirements

| Dependency | Minimum Version |
|---|---|
| Node.js | 18+ |
| Java (backend) | 21+ |
| MongoDB Atlas | Configured via `.env.local` |

### Environment Setup

```bash
# 1. Clone and install
cd "/Users/anuraagpatil/naviksha/Shiksha Sathi"
npm install

# 2. Configure environment (NEVER commit this file)
cp .env.local.example .env.local
# Edit .env.local with your MongoDB URI and JWT secret

# 3. Start backend (Terminal 1)
cd backend
./gradlew bootRun

# 4. Start frontend (Terminal 2)
cd "/Users/anuraagpatil/naviksha/Shiksha Sathi"
npm run dev
```

### Access Points

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Production Frontend | https://shiksha-sathi.vercel.app |
| Production Backend | https://shiksha-sathi-backend-eyfdit56la-el.a.run.app |

### Test Accounts

| Email | Password | Role |
|---|---|---|
| `teacher@test.com` | `password123` | Teacher |
| `teacher2@test.com` | `password123` | Teacher |

> **Note:** Student access is via shareable assignment links — no student login is required.

---

## 🤖 Automated Validation

Run these **before** starting manual testing to confirm a clean baseline.

```bash
# Lint (expect: 0 errors)
npm run lint

# Unit tests (expect: 47/47 pass)
npm run test -- --run

# Production build (expect: exit 0, all routes compiled)
npm run build
```

**Expected build output** — all 13 routes:
```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /login
├ ○ /signup
├ ƒ /student/assignment/[linkId]
├ ○ /teacher
├ ƒ /teacher/assignments/[id]
├ ƒ /teacher/assignments/create
├ ƒ /teacher/classes
├ ƒ /teacher/classes/[id]/attendance
├ ƒ /teacher/dashboard
├ ƒ /teacher/profile
└ ƒ /teacher/question-bank
```

---

## Manual Test Scenarios

### 1. Landing Page — `/`

**Design Source:** `shiksha_sathi_landing_page`
**Jira:** SSA-251

#### Steps

1. Open http://localhost:3000
2. Verify the page loads without errors in the console

#### Visual Checklist

| Element | Expected |
|---|---|
| Navigation bar | Glassmorphism top bar with "Shiksha Sathi" wordmark, navigation links (Features, How It Works, About), "Teacher Login" text link, "Create Free Account" gradient button |
| Hero section | Large headline with Manrope font, subheading, "Get Started for Free" gradient CTA button, hero image (Next.js `<Image>`) |
| Features section | Bento-grid card layout, each card with icon + title + description |
| Trust/How-It-Works section | Side-by-side image and content with bullet points |
| CTA banner | Full-width gradient background (`--color-primary` → `--color-primary-dim`) with "Join Thousands of Indian Teachers" text |
| Footer | Links, copyright notice |
| Font rendering | Geist Sans body, Manrope for headlines — verify no FOUT on load |

#### Interaction Checklist

- [ ] "Teacher Login" → navigates to `/login`
- [ ] "Create Free Account" → navigates to `/signup`
- [ ] "Get Started for Free" → navigates to `/signup`
- [ ] Mobile hamburger menu toggles open/close with animation
- [ ] Mobile menu gradient button renders correctly
- [ ] Scroll animations (framer-motion) trigger on viewport entry

---

### 2. Authentication — Login & Signup

**Design Source:** `teacher_signup_refined` (mirrored for login)
**Jira:** SSA-251

#### Login — `/login`

1. Navigate to http://localhost:3000/login
2. Verify split-panel layout: left info panel (gradient) + right form panel

| Element | Expected |
|---|---|
| Left panel | Deep teal gradient, "Welcome Back" messaging, decorative blurred circles |
| Right panel | White/surface background, "Sign In" heading, email + password inputs, "Sign In" button, "Don't have an account? Sign up" link |
| Inputs | Rounded borders, subtle outline on focus, no placeholder clipping |

**Happy path:**
- [ ] Enter `teacher@test.com` / `password123` → click "Sign In"
- [ ] Redirects to `/teacher/dashboard`
- [ ] Auth cookie is set (check DevTools → Application → Cookies)

**Error path:**
- [ ] Enter wrong password → red error banner appears inline
- [ ] Empty fields → browser validation prevents submission

#### Signup — `/signup`

1. Navigate to http://localhost:3000/signup
2. Verify same split-panel layout as login (mirrored)

| Element | Expected |
|---|---|
| Heading | "Create Account" |
| Fields | Name, Email, Password |
| CTA | "Create Account" button |
| Link | "Already have an account? Sign in" → `/login` |

**Happy path:**
- [ ] Fill all fields → click "Create Account"
- [ ] Redirects to `/teacher/dashboard` on success

---

### 3. Teacher Dashboard

**Design Source:** `teacher_dashboard_consolidated`
**Jira:** SSA-252

#### Prerequisites
- Logged in as teacher

#### Steps
1. Navigate to http://localhost:3000/teacher/dashboard (or arrive via login redirect)

#### Visual Checklist

| Element | Expected |
|---|---|
| Shell layout | Persistent left rail navigation on desktop, glassmorphism-blur top bar, bottom tab bar on mobile |
| Nav items (desktop) | Dashboard, Classes, Question Bank, Assignments, Profile — exactly 5, no "Settings", no "Support", no "Analytics" |
| Welcome card | "Welcome back, [Name]" greeting |
| Stats cards | Active Assignments, Total Submissions, Average Score — bento-grid layout |
| Recent assignments table | Table with columns: Title, Class, Submissions (with progress mini-bar), Avg Score, link to report |
| Progress bars | Use CSS variable `--bar-w` pattern (no bare `style={{ width }}`) |
| Quick actions | "Create Assignment" and "View Question Bank" links |

#### Interaction Checklist

- [ ] Clicking each nav item navigates correctly
- [ ] "Create Assignment" → `/teacher/assignments/create`
- [ ] Row links in table → `/teacher/assignments/[id]`
- [ ] Logout button clears auth cookie and redirects to `/login`

---

### 4. Classes Management

**Design Source:** `classes_management_refined`
**Jira:** SSA-252

#### Steps
1. Navigate to http://localhost:3000/teacher/classes

#### Visual Checklist

| Element | Expected |
|---|---|
| Page heading | "My Classes" |
| Class cards | Card per class with name, section, student count |
| Add class form | Modal or inline form with name + section fields |

#### Interaction Checklist

- [ ] "Add Class" opens creation form
- [ ] Submit with valid data → class appears in list
- [ ] Click class card → navigates to attendance view

---

### 5. Question Bank — Browse & Select

**Design Source:** `question_bank_browse_select`
**Jira:** SSA-253

#### Steps
1. Navigate to http://localhost:3000/teacher/question-bank

#### Visual Checklist

| Element | Expected |
|---|---|
| Filter bar | Board → Class → Subject → Book → Chapter cascade dropdowns |
| Question cards | Each shows: question text, type badge (MCQ/True-False/Short Answer/Fill-in-Blanks), marks, add-to-tray checkbox |
| Preview | Expandable section with correct answer (green), explanation, provenance metadata |
| Assignment tray | Sticky sidebar/bottom bar showing selected questions count + total marks |

#### Filter Smoke Test

| Board | Class | Subject | Book | Expected Question Count |
|---|---|---|---|---|
| NCERT | 6 | Science | Curiosity | 28 |
| NCERT | 7 | Science | Curiosity | 32 |
| NCERT | 9 | Mathematics | Mathematics | 32 |
| NCERT | 11 | Physics | Physics Part I | 36 |
| NCERT | 12 | Mathematics | Mathematics | 36 |

#### Interaction Checklist

- [ ] Cascade works: selecting Board populates Class, selecting Class populates Subject, etc.
- [ ] Click "Preview" → expands with answer + explanation + metadata
- [ ] Click "Preview" again → collapses
- [ ] Check a question → tray counter updates
- [ ] Uncheck → tray counter decrements
- [ ] "Continue to Publish" button in tray → navigates to `/teacher/assignments/create`

---

### 6. Assignment Creation — Review & Publish

**Design Source:** `review_organize_assignment`
**Jira:** SSA-253

#### Prerequisites
- At least 1 question added to assignment tray from Question Bank

#### Steps
1. Navigate to http://localhost:3000/teacher/assignments/create

#### Visual Checklist

| Element | Expected |
|---|---|
| Stage indicator | If no questions selected: "Browse Question Bank" CTA card. If questions selected: review list + publish form |
| Review list | Selected questions with marks, reorder capability |
| Publish form | Title, Class/Section dropdown, Due Date input (dark `color-scheme` for date picker) |
| Date picker | Renders with dark theme (Tailwind `[color-scheme:dark]` class, **not** inline style) |

#### Interaction Checklist

- [ ] Fill title, select class, pick due date → submit
- [ ] Success: shows shareable link with "Copy Link" button
- [ ] Copy Link writes to clipboard
- [ ] Assignment appears in dashboard table

---

### 7. Assignment Report

**Design Source:** `teacher_assignment_report`
**Jira:** SSA-254

#### Steps
1. Navigate to http://localhost:3000/teacher/assignments/[id] (use a real assignment ID from dashboard)

#### Visual Checklist

| Element | Expected |
|---|---|
| Header | Assignment title, due date, class/section |
| Summary cards | Total submissions, average score, completion rate |
| Question analysis | Per-question cards with correctness percentage bar |
| Progress bars | Use CSS variable `--bar-w` with dynamic color (`statusColor`) |
| Submissions table | Student name, score, submission time |

---

### 8. Teacher Profile

**Design Source:** `teacher_profile_shiksha_sathi_1`
**Jira:** SSA-254

#### Steps
1. Navigate to http://localhost:3000/teacher/profile

#### Visual Checklist

| Element | Expected |
|---|---|
| Profile strength card | Gradient background, progress bar using CSS var `--strength-w` |
| Teacher insight card | Tertiary-container background |
| Profile form | Name, email, school, board, class fields |
| Save button | Functional, shows success/error feedback |

#### Interaction Checklist

- [ ] Edit fields → Save → reload → changes persist
- [ ] Profile strength bar width reflects completion %

---

### 9. Student Assignment Journey

**Design Source:** `identity_entry` → `assignment_taking` → `results`
**Jira:** SSA-255

#### Prerequisites
- A published assignment with a shareable link

#### Steps
1. Open the assignment link in an **incognito** window (no teacher cookie)
2. Expected: Identity entry screen appears

#### Phase 1 — Identity Entry

| Element | Expected |
|---|---|
| Screen | "Enter Your Name" form with student name input |
| Submit | Begins assignment, transitions to answer phase |

#### Phase 2 — Answer Questions

| Element | Expected |
|---|---|
| Progress bar | Shows "X of Y answered" — uses CSS var `--progress-percent` |
| Question cards | Bento-style cards with question text, MCQ options as radio buttons, marks badge |
| Navigation | Scroll through all questions on single page |
| Submit | "Submit Assignment" button at bottom |

#### Phase 3 — Results

| Element | Expected |
|---|---|
| Score display | "You scored X / Y" |
| Question review | Each question shows selected answer, correct answer (highlighted), explanation |
| No edit | Student cannot modify answers after submission |

---

### 10. Design System & Visual Regression

**Design Source:** `the_digital_atelier` + `design-system.md`
**Jira:** SSA-249

This checks that the design system tokens in `globals.css` are consistently applied.

#### Token Verification

| Token | Expected Value | Where to Verify |
|---|---|---|
| `--color-primary` | `#446371` (Deep Teal) | CTA buttons, nav active states, progress bars |
| `--color-surface` | `#faf9f5` (Warm off-white) | Page backgrounds |
| `--color-on-surface` | `#30332f` | Body text |
| `--font-geist-sans` | "Geist Sans" | Body text, UI labels |
| `--font-manrope` | "Manrope" | Headlines, hero sections |
| `--radius-sm` / `--radius-md` | `0.125rem` / `0.375rem` | Button and card corners |

#### Anti-Regression Checks

- [ ] **No bare `<img>` tags** — all images use Next.js `<Image>` component
- [ ] **No `btn-primary` CSS class** — removed from `globals.css`, all replaced with Tailwind utilities
- [ ] **No gradient inline styles** — all use `bg-gradient-to-br from-[var(...)] to-[var(...)]`
- [ ] **No `fontFamily` inline styles** — all use `font-[family-name:var(...)]` class
- [ ] **Dynamic widths use CSS variable pattern** — `w-[var(--bar-w)]` with `style={{ '--bar-w': value } as React.CSSProperties}`
- [ ] **Teacher shell has exactly 5 nav items** — Dashboard, Classes, Question Bank, Assignments, Profile (no Settings, Support, or Analytics)
- [ ] **Teacher layout comment** references `doc/stitch-export-bundle (Canonical Export)` (line 12)

---

### 11. Responsive Breakpoints

Test each page at these widths using Chrome DevTools device toolbar (Cmd+Opt+M):

| Breakpoint | Width | Device Equivalent |
|---|---|---|
| Mobile | 375px | iPhone 12/13/14 |
| Tablet | 768px | iPad |
| Desktop | 1440px | Standard monitor |

#### Per-Breakpoint Checks

**Mobile (375px):**
- [ ] Landing page: hamburger menu, stacked sections, no horizontal overflow
- [ ] Login/Signup: single-column layout (info panel hidden or stacked above)
- [ ] Teacher shell: bottom tab bar visible (5 tabs), left rail hidden
- [ ] Question cards: full-width, stacked
- [ ] CTA buttons: full-width

**Tablet (768px):**
- [ ] Landing page: two-column hero, features grid adjusts
- [ ] Login/Signup: split-panel visible
- [ ] Teacher shell: left rail may collapse or remain, top bar visible

**Desktop (1440px):**
- [ ] Landing page: three-column features grid, hero side-by-side
- [ ] Login/Signup: full split-panel with gradient left / form right
- [ ] Teacher shell: persistent left rail navigation, content area fills width
- [ ] Question bank: filter bar + cards + tray sidebar side by side

---

### 12. Cross-Browser Matrix

| Browser | Version | Priority |
|---|---|---|
| Chrome | Latest | P0 — primary |
| Safari | Latest | P0 — macOS/iOS users |
| Firefox | Latest | P1 |
| Edge | Latest | P2 |

**Key things to verify per browser:**
- [ ] CSS custom properties (`var(--color-primary)`) render
- [ ] `backdrop-filter: blur()` works (glassmorphism)
- [ ] Framer Motion animations play smoothly
- [ ] `bg-gradient-to-br` renders correctly
- [ ] Date input with `[color-scheme:dark]` displays properly

---

### 13. API Smoke Tests

Run from terminal against backend at http://localhost:8080:

```bash
# 1. Health check
curl -s http://localhost:8080/api/v1/questions/boards | python3 -m json.tool
# Expected: ["NCERT"]

# 2. Classes for NCERT
curl -s "http://localhost:8080/api/v1/questions/classes?board=NCERT" | python3 -m json.tool
# Expected: ["6","7","8","9","10","11","12"]

# 3. Subjects
curl -s http://localhost:8080/api/v1/questions/subjects | python3 -m json.tool
# Expected: ["Biology","English","Mathematics","Physics","Science","Social Science"]

# 4. Search questions
curl -s "http://localhost:8080/api/v1/questions/search?board=NCERT&classLevel=6&visibleOnly=true" | python3 -m json.tool
# Expected: JSON array of PUBLISHED question objects

# 5. Teacher signup
curl -s -X POST http://localhost:8080/api/v1/teachers/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"testapi@test.com","password":"password123"}'
# Expected: 200 or 409 (already exists)

# 6. Teacher login
curl -s -X POST http://localhost:8080/api/v1/teachers/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@test.com","password":"password123"}'
# Expected: 200 with JWT token
```

---

## ✅ Production Readiness Checklist

### Automated Tests
- [x] `npm run lint` — 0 errors
- [x] `npm run test` — 47/47 tests passing
- [x] `npm run build` — exit 0, all 13 routes compiled

### Functional Coverage

| Journey | Route(s) | Status |
|---|---|---|
| Landing page | `/` | ✅ |
| Teacher login | `/login` | ✅ |
| Teacher signup | `/signup` | ✅ |
| Dashboard overview | `/teacher/dashboard` | ✅ |
| Class management | `/teacher/classes` | ✅ |
| Attendance register | `/teacher/classes/[id]/attendance` | ✅ |
| Question bank browse | `/teacher/question-bank` | ✅ |
| Assignment creation | `/teacher/assignments/create` | ✅ |
| Assignment report | `/teacher/assignments/[id]` | ✅ |
| Teacher profile | `/teacher/profile` | ✅ |
| Student assignment | `/student/assignment/[linkId]` | ✅ |

### Design System Compliance
- [x] All routes aligned to canonical Stitch export bundle
- [x] Legacy nav items removed (Settings, Support, Analytics)
- [x] Custom `.btn-primary` CSS class removed
- [x] All gradient backgrounds use Tailwind utilities
- [x] All dynamic progress bars use CSS variable pattern
- [x] Images use Next.js `<Image>` component
- [x] Design source comment updated in teacher layout

### Deployment
- [x] Vercel: `dpl_CNL1mSr4M4XaZcHL3AWzJrUErMLU` — production, READY
- [x] Cloud Run: `shiksha-sathi-backend` — asia-south1, live
- [x] Git: `main` clean at `f9e156a`, pushed to origin

### Jira
- [x] SSA-248 (Epic) — Done
- [x] SSA-247 (Sprint Story) — Done
- [x] SSA-249 through SSA-256 — All Done

---

## 📊 NCERT Question Bank Data

**Total Questions:** 1,136

| Class | Questions | Status |
|---|---|---|
| Class 6 | 124 | ✅ PUBLISHED |
| Class 7 | 184 | ✅ PUBLISHED |
| Class 8 | 152 | ✅ PUBLISHED |
| Class 9 | 244 | ✅ PUBLISHED |
| Class 10 | 232 | ✅ PUBLISHED |
| Class 11 | 120 | ✅ PUBLISHED |
| Class 12 | 80 | ✅ PUBLISHED |

---

## 📞 Support

| Resource | Location |
|---|---|
| Jira project | SSA board |
| Design matrix | `doc/stitch-export-implementation-matrix.md` |
| Design system doc | `design-system.md` (project root) |
| API docs | http://localhost:8080/swagger-ui.html |
| MongoDB | Use MCP or Compass with `.env.local` URI |

---

**Last Updated:** March 30, 2026
**Build:** `main` (`f9e156a`)
**Status:** ✅ Production Ready — Stitch UI Modernization Complete
