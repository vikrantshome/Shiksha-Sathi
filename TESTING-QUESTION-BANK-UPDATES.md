# Manual Testing Instructions — Question Bank Updates

> **Branch:** `feature/SSA-275-student-dashboard` (or current working branch)
> **Date:** 2026-04-05
> **Status:** Phase 1 + 2 implemented, Phase 3-5 pending

---

## Prerequisites

1. `npm run dev` — start both frontend + backend
2. Login as a teacher
3. Navigate to `/teacher/question-bank`
4. Ensure at least one chapter has questions loaded (select Board → Class → Subject → Book → Chapter)

---

## 1. Question Card — Visual Changes

**What to check:**
- [ ] Each question card has a **left border** — transparent when unselected, **teal (primary)** when selected
- [ ] Each card shows **3 badges** in the meta row: **Type** (MCQ/True False/etc), **Difficulty** (Easy/Medium/Hard), and **SOURCE: NCERT** (or NCERT Exemplar / Practice)
- [ ] The **checkbox** on the right is a **circle** (not square) — fills teal when checked
- [ ] **MCQ questions** show A/B/C/D options inline in a 2-column grid
- [ ] When explanation is expanded, the **correct answer** is highlighted in teal

**How to test:**
- Browse any chapter with MCQ questions
- Verify badges appear on every card
- Click a card to select it → verify left border turns teal and checkbox fills
- Click again to deselect → verify border goes transparent

---

## 2. Difficulty Badge

**What to check:**
- Questions with **1 point** → green "Easy" badge
- Questions with **2-3 points** → grey "Medium" badge
- Questions with **4+ points** → red "Hard" badge

**How to test:**
- Find questions with different point values
- Verify the badge color and label match the rules above

---

## 3. "View Answer & Explanation" Toggle

**What to check:**
- Clicking the toggle **expands** the explanation area below the card
- Expanded area shows:
  - **Correct Answer** in teal
  - **Detailed Explanation** (if question has one)
  - **"View Step-by-Step Solution"** link with eye icon (dummy link, doesn't navigate yet)
  - **Metadata sidebar** on the right with 3 cards:
    - Weightage (points)
    - Used (N times — dummy number)
    - Source (chapter title or book name)

**How to test:**
- Click "View Answer & Explanation" on any question
- Verify all 4 sections appear in the expanded area
- Click "Hide Explanation" to collapse

---

## 4. "Add to Assignment" Button

**What to check:**
- Unselected card: button says **"Add to Assignment"** with a **+** icon
- Selected card: button says **"Added"** with a **checkmark** icon, teal background
- Button is a **rounded pill** shape

**How to test:**
- Click "Add to Assignment" on 2-3 questions
- Verify button text and icon change
- Verify the card's left border turns teal

---

## 5. Assignment Tray — Desktop (right panel)

**What to check:**
- When 0 questions selected: shows empty state with "No questions selected"
- When questions selected: shows **"Assignment Draft"** header with "In Progress" sublabel
- **Bento summary grid** (2x2):
  - Questions count (large number)
  - Total Points (large number)
  - Estimated Duration (e.g., "24 min")
- **Numbered item list** — each selected question shows:
  - Number badge (01, 02, 03...)
  - Question text (truncated)
  - Type and points (e.g., "MCQ · 2 pts")
  - **Hover reveals × remove button** on the right
- **Difficulty indicator** — "Easy", "Medium", or "Medium-High"
- **"Review Assignment"** button — gradient teal with arrow icon

**How to test:**
- Add 3+ questions to assignment
- Verify the tray appears on the right (desktop only, >1024px)
- Check bento numbers match your selections
- Hover over an item → verify × appears → click to remove
- Verify "Review Assignment" links to `/teacher/assignments/create`

---

## 6. Assignment Tray — Mobile (<1024px)

**What to check:**
- A **dark teal floating pill** appears at the bottom
- Shows: count badge (circle), "Questions Selected" text, marks + duration
- **"Clear All"** button (semi-transparent)
- **"Create Test"** button (light teal with arrow)

**How to test:**
- Resize browser to <768px width (or use Chrome DevTools mobile emulation)
- Add 2+ questions
- Verify the floating pill appears at bottom above the tab bar
- Click "Clear All" → verify tray resets to empty
- Click "Create Test" → verify navigation to `/teacher/assignments/create`

---

## 7. Source Label Formatting

**What to check:**
- `sourceKind = CANONICAL` → displays **"SOURCE: NCERT"**
- `sourceKind = DERIVED` → displays **"SOURCE: Practice"**
- Book contains "Exemplar" → displays **"SOURCE: NCERT Exemplar"**

**How to test:**
- Check questions from different sources
- Verify the label reads correctly (not raw "CANONICAL" or "DERIVED")

---

## 8. Regression Checks

**What to verify still works:**
- [ ] Board → Class → Subject → Book → Chapter navigation still works
- [ ] Search bar filters questions
- [ ] Type filter (All Types / MCQ / True/False / Fill Blanks) still works
- [ ] Empty states show correctly when no chapter selected
- [ ] Question count badge ("X curated results") shows correctly
- [ ] Clicking "Review Assignment" / "Create Test" navigates to assignment creation

---

## Files Changed

| File | Changes |
|---|---|
| `src/components/QuestionCard.tsx` | Difficulty badge, source label, usage count, view solution link, left-border accent, metadata sidebar layout |
| `src/components/AssignmentTray.tsx` | Bento summary, numbered item list, difficulty indicator, mobile floating pill, Clear All button |
