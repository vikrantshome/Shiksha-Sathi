# Shiksha Sathi — Manual Testing Instructions

**Version:** 4.0 — SSA-260 Responsive Spacing Update
**Date:** March 30, 2026
**Build:** `main` (`7d01f77`)
**Design System:** The Digital Atelier (Stitch Export Bundle)
**Epic:** SSA-260 (Responsive Spacing & Density Refinement — Complete)

---

## Table of Contents

1. [Prerequisites & Setup](#-prerequisites--setup)
2. [Automated Validation](#-automated-validation)
3. [Test Credentials](#-test-credentials)
4. [Landing Page](#1-landing-page---)
5. [Authentication — Login & Signup](#2-authentication--login--signup)
6. [Teacher Dashboard](#3-teacher-dashboard)
7. [Classes Management](#4-classes-management)
8. [Question Bank — Browse & Select](#5-question-bank--browse--select)
9. [Assignment Creation — Review & Publish](#6-assignment-creation--review--publish)
10. [Assignment Report](#7-assignment-report)
11. [Teacher Profile](#8-teacher-profile)
12. [Student Assignment Journey](#9-student-assignment-journey)
13. [Design System & Visual Regression](#10-design-system--visual-regression)
14. [Responsive Breakpoints](#11-responsive-breakpoints)
15. [Cross-Browser Matrix](#12-cross-browser-matrix)
16. [API Smoke Tests](#13-api-smoke-tests)
17. [Production Readiness Checklist](#-production-readiness-checklist)

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
| Frontend (Local) | http://localhost:3000 |
| Backend API (Production) | https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1 |
| Frontend (Production) | https://shiksha-sathi.vercel.app (if deployed) |

---

## 🔑 Test Credentials

### Teacher Accounts

| Email | Password | Name | Purpose |
|-------|----------|------|---------|
| `qa_teacher_1@example.com` | `password123` | QA Teacher 1 | Primary QA Testing |
| `teacher@test.com` | `password123` | Test Teacher | API Testing |
| `testapi@test.com` | `password123` | Test API User | API Testing |

> **⚠️ IMPORTANT:** 
> - Signup requires `"role": "TEACHER"` field
> - Login may fail with "Role null" error for existing accounts
> - **Fix:** See `BACKEND-AUTH-FIX.md` for database migration script
> - **Workaround:** Create new account with signup including role field

### Student Access
Student access is via shareable assignment links — no student login is required.

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

Run from terminal against **production backend API**:

```bash
# Base URL
API_URL="https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1"

# 1. Health check (Public - No Auth)
curl -s $API_URL/questions/boards | python3 -m json.tool
# Expected: ["NCERT"]

# 2. Classes for NCERT (Public - No Auth)
curl -s "$API_URL/questions/classes?board=NCERT" | python3 -m json.tool
# Expected: ["6","7","8","9","10","11","12"]

# 3. Subjects (Public - No Auth)
curl -s $API_URL/questions/subjects | python3 -m json.tool
# Expected: ["Biology","English","Mathematics","Physics","Science","Social Science"]

# 4. Search questions (Public - No Auth)
curl -s "$API_URL/questions/search?board=NCERT&classLevel=6&visibleOnly=true" | python3 -m json.tool
# Expected: JSON array of PUBLISHED question objects

# 5. Teacher signup (Create test account)
# ⚠️ IMPORTANT: Must include "role": "TEACHER"
curl -s -X POST $API_URL/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"QA Teacher","email":"qa_teacher_1@example.com","password":"password123","phone":"+919876543210","role":"TEACHER"}'
# Expected: 200 with JWT token OR 409 (already exists)

# 6. Teacher login (Get auth token)
# ⚠️ NOTE: If login fails with Role null error, see BACKEND-AUTH-FIX.md
curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"qa_teacher_1@example.com","password":"password123"}'
# Expected: 200 with JWT token
# Response: {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","user":{...}}

# 7. Get teacher profile (Authenticated)
# Replace YOUR_TOKEN with actual token from step 6
curl -s -X GET $API_URL/teachers/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
# Expected: 200 with profile data

# 8. Update teacher profile (Authenticated)
curl -s -X PUT $API_URL/teachers/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"school":"Test School","board":"CBSE"}'
# Expected: 200 OK
```

> **⚠️ IMPORTANT:** Use `/teachers/login` endpoint, NOT `/auth/login` (which doesn't exist)

---

## ✅ Production Readiness Checklist

### Automated Tests
- [x] `npm run lint` — 0 errors (1 warning in coverage, unrelated)
- [x] `npm run test` — 47/47 tests passing
- [x] `npm run build` — exit 0, all 13 routes compiled

### SSA-260 Responsive Spacing Validation

**Mobile (< 768px):**
- [x] Outer page padding: `px-4` (16px)
- [x] Section rhythm: `py-8` to `py-10` (32-40px)
- [x] Card padding: `p-4` to `p-5` (16-20px)
- [x] Grid gaps: `gap-3` to `gap-4` (12-16px)
- [x] Tap targets ≥44px maintained

**Tablet (768px-1023px):**
- [x] Outer page padding: `px-6` (24px)
- [x] Section rhythm: `py-12` (48px)
- [x] Card padding: `p-5` to `p-6` (20-24px)
- [x] Grid gaps: `gap-4` to `gap-6` (16-24px)

**Desktop (≥ 1024px):**
- [x] Premium feel preserved
- [x] `lg:p-8`, `lg:py-16` for major surfaces
- [x] Intentional whitespace maintained

### Functional Coverage

| Journey | Route(s) | SSA-260 Status |
|---|---|---|
| Landing page | `/` | ✅ Refined |
| Teacher login | `/login` | ✅ Refined |
| Teacher signup | `/signup` | ✅ Refined |
| Dashboard overview | `/teacher/dashboard` | ✅ Refined |
| Class management | `/teacher/classes` | ✅ Refined |
| Attendance register | `/teacher/classes/[id]/attendance` | ✅ Refined |
| Question bank browse | `/teacher/question-bank` | ✅ Refined |
| Assignment creation | `/teacher/assignments/create` | ✅ Complete |
| Assignment report | `/teacher/assignments/[id]` | ✅ Complete |
| Teacher profile | `/teacher/profile` | ✅ Refined |
| Student assignment | `/student/assignment/[linkId]` | ✅ Refined |

### Design System Compliance
- [x] All routes aligned to canonical Stitch export bundle
- [x] Legacy nav items removed (Settings, Support, Analytics) — SSA-249
- [x] Custom `.btn-primary` CSS class removed
- [x] All gradient backgrounds use Tailwind utilities
- [x] All dynamic progress bars use CSS variable pattern
- [x] Images use Next.js `<Image>` component
- [x] Design source comment updated in teacher layout
- [x] Responsive utilities added: `.section-spacing`, `.page-gutter`, `.card-padding`

### Deployment
- [x] Vercel: Ready for deployment
- [x] Cloud Run: `shiksha-sathi-backend` — asia-south1, live
- [x] Git: `main` clean at `7d01f77`, pushed to origin

### Jira
- [x] SSA-260 (Epic) — Complete
- [x] SSA-261 through SSA-266 — All Complete

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

## 📞 Support & Documentation

| Resource | Location |
|---|---|
| Backend Auth Fix | `BACKEND-AUTH-FIX.md` |
| Test Credentials | `TEST-CREDENTIALS.md` |
| Login Issue Fix | `LOGIN-ISSUE-FIX.md` |
| SSA-260 Epic Summary | `doc/SSA-260-COMPLETE-SUMMARY.md` |
| Browser Validation Guide | `doc/SSA-266-browser-validation-guide.md` |
| Jira Closeout Guide | `doc/SSA-266-JIRA-CLOSEOUT-EXECUTION.md` |
| Design System | `design-system.md` |
| Stitch Implementation Matrix | `doc/stitch-export-implementation-matrix.md` |

### Responsive Testing Tools

**Browser DevTools:**
- Chrome DevTools: Cmd+Shift+M (Mac) / Ctrl+Shift+M (Windows)
- Firefox Responsive Design Mode: Cmd+Opt+M (Mac)
- Safari Responsive Design Mode: Develop > Enter Responsive Design Mode

**Recommended Test Viewports:**
- Mobile S: 375px × 667px (iPhone SE)
- Mobile L: 412px × 896px (iPhone 14/15 Pro Max)
- Tablet: 768px × 1024px (iPad)
- Tablet Pro: 1024px × 1366px (iPad Pro)
- Desktop: 1440px × 900px (MacBook Pro 14")
- Desktop Large: 1920px × 1080px (External Monitor)

### Common Issues & Solutions

**Issue:** Login returns "Invalid credentials"  
**Solution:** Use `/teachers/login` endpoint, not `/auth/login` (see `LOGIN-ISSUE-FIX.md`)

**Issue:** Mobile layout looks cramped  
**Solution:** Clear browser cache, rebuild: `npm run build && npm run dev`

**Issue:** Bottom nav overlaps content on mobile  
**Solution:** Ensure `pb-24` class is present on main content wrapper

**Issue:** Tables overflow on mobile  
**Solution:** Tables should degrade to card view on mobile (< 768px)

---

## 🎉 SSA-260 Responsive Spacing Refinement — Complete

All routes have been refined with responsive spacing improvements:

- **Mobile density improved:** ~25-50% reduction in excessive whitespace
- **Tablet transitions:** Smoother responsive breakpoints
- **Desktop preserved:** Premium airy feel maintained

**Documentation:** See `doc/SSA-260-*` files for complete epic details.

**Last Updated:** March 30, 2026  
**Version:** 4.0 (SSA-260)  
**Build:** `7d01f77`

---
