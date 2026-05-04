# Quiz Display UI/UX Enhancement — Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans or implement inline. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Rewrite the quiz projector display page with a warm light theme, colorful answer options, countdown animation, interstitial leaderboard, and final podium.

**Architecture:** Decompose the monolithic display page into focused display-specific components under `src/components/quiz/display/`. The main page orchestrates state (status transitions, countdown trigger, interstitial timing) and delegates rendering to state-specific sub-components.

**Tech Stack:** React 19, Next.js 16 App Router, Tailwind CSS v4, Framer Motion, existing design system CSS variables.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/quiz/display/QuizProgressBar.tsx` | Create | Thin top progress bar showing question progress |
| `src/components/quiz/display/QuizOptionCard.tsx` | Create | Reusable option card with color, reveal state, distribution bar |
| `src/components/quiz/display/QuizLobbyScreen.tsx` | Create | Lobby state: big code, waiting dots, participant count |
| `src/components/quiz/display/CountdownOverlay.tsx` | Create | Full-screen 3-2-1 countdown with scale animation |
| `src/components/quiz/display/QuizQuestionDisplay.tsx` | Create | LIVE state: question + options grid |
| `src/components/quiz/display/AnswerRevealDisplay.tsx` | Create | REVEAL state: correct highlight + distribution bars |
| `src/components/quiz/display/InterstitialLeaderboard.tsx` | Create | Bottom overlay top-5 leaderboard |
| `src/components/quiz/display/FinalPodium.tsx` | Create | ENDED state: 3D-style podium + full leaderboard |
| `src/components/quiz/Leaderboard.tsx` | Modify | Add `variant?: 'default' \| 'display'` and `maxEntries?: number` props |
| `src/app/teacher/quizzes/display/[sessionId]/page.tsx` | Modify | Complete rewrite: orchestration + all states |

---

## Task 1: Update Leaderboard component with display variant

**Files:**
- Modify: `src/components/quiz/Leaderboard.tsx`

- [ ] **Step 1: Add props and display variant logic**

Add `variant?: 'default' | 'display'` and `maxEntries?: number` props. When `variant === 'display'`, remove the outer section wrapper and card styling, use larger text sizes, and show entries up to `maxEntries`.

- [ ] **Step 2: Commit**

```bash
git add src/components/quiz/Leaderboard.tsx
git commit -m "feat(quiz): add display variant to Leaderboard component"
```

---

## Task 2: Create QuizProgressBar

**Files:**
- Create: `src/components/quiz/display/QuizProgressBar.tsx`

- [ ] **Step 1: Implement component**

A thin bar at the top. Props: `current: number`, `total: number`. Width = `(current / total) * 100%`. Background track: `--color-surface-container`, indicator: `--color-primary`. Height: 6px. Rounded full.

- [ ] **Step 2: Commit**

```bash
git add src/components/quiz/display/QuizProgressBar.tsx
git commit -m "feat(quiz): add QuizProgressBar display component"
```

---

## Task 3: Create QuizOptionCard

**Files:**
- Create: `src/components/quiz/display/QuizOptionCard.tsx`

- [ ] **Step 1: Implement component**

Props:
```typescript
interface QuizOptionCardProps {
  label: string;        // "A", "B", etc.
  text: string;         // Option text
  color: string;        // Hex color for this option
  isRevealed: boolean;
  isCorrect: boolean;
  distribution?: { count: number; percentage: number };
}
```

**LIVE state:** Large rounded card with left 6px border in `color`, white background, label in a colored circle, text in bold dark font.

**REVEAL state:**
- If `isCorrect`: scale(1.03), green shadow (`box-shadow: 0 0 30px rgba(27,107,71,0.4)`), checkmark icon, full opacity.
- If not correct: opacity 0.45, grayscale filter.
- Distribution bar: thin horizontal bar inside card showing `percentage%` width in the option's color.

Use Framer Motion `motion.div` for smooth transitions between states.

- [ ] **Step 2: Commit**

```bash
git add src/components/quiz/display/QuizOptionCard.tsx
git commit -m "feat(quiz): add QuizOptionCard display component"
```

---

## Task 4: Create QuizLobbyScreen

**Files:**
- Create: `src/components/quiz/display/QuizLobbyScreen.tsx`

- [ ] **Step 1: Implement component**

Props: `quizTitle: string`, `sessionCode: string`, `participantCount: number`, `totalQuestions: number`.

Layout:
- Full-screen warm light background with subtle radial gradient from center.
- Top bar: Quiz title (left, large bold), participant count pill with green pulse dot (right).
- Center:
  - "Join at shiksha-sathi.com" (small, muted)
  - Giant code badge: `sessionCode` in a large rounded pill with monospace font, subtle shadow, border. Font size: `text-5xl md:text-7xl lg:text-8xl`.
  - "Waiting for host to start…" with 3 animated bouncing dots (Framer Motion stagger).
- Bottom bar: `0 / {totalQuestions} Questions` progress text.

- [ ] **Step 2: Commit**

```bash
git add src/components/quiz/display/QuizLobbyScreen.tsx
git commit -m "feat(quiz): add QuizLobbyScreen display component"
```

---

## Task 5: Create CountdownOverlay

**Files:**
- Create: `src/components/quiz/display/CountdownOverlay.tsx`

- [ ] **Step 1: Implement component**

Props: `onComplete: () => void`.

A full-screen overlay (`fixed inset-0 z-50`) with a semi-transparent warm overlay (not dark — `bg-white/60 backdrop-blur-sm`).

Shows numbers 3 → 2 → 1 sequentially.
- Each number: `text-9xl font-black`, color cycles through option colors (teal → amber → coral).
- Animation: `initial={{ scale: 0.3, opacity: 0 }}` → `animate={{ scale: 1, opacity: 1 }}` with spring. Exit: `scale: 1.5, opacity: 0`.
- After "1" completes, call `onComplete()`.
- Use `AnimatePresence` for smooth number transitions.

- [ ] **Step 2: Commit**

```bash
git add src/components/quiz/display/CountdownOverlay.tsx
git commit -m "feat(quiz): add CountdownOverlay display component"
```

---

## Task 6: Create QuizQuestionDisplay

**Files:**
- Create: `src/components/quiz/display/QuizQuestionDisplay.tsx`

- [ ] **Step 1: Implement component**

Props: `question`, `options`, `questionIndex`, `totalQuestions`, `secondsRemaining`, `timePerQuestionSec`.

Layout:
- Top bar with timer (big, prominent) and question counter.
- Timer styling:
  - >10s: `--color-primary` (teal), steady
  - 5-10s: `--color-warning` (amber), `animate-pulse`
  - <5s: `--color-error` (coral), rapid pulse + `animate-bounce` subtle
- Question text: centered, massive, `text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight`.
- Options grid: 2 columns, gap-4. Uses `QuizOptionCard` for each option.
- Stagger animation: options slide up with 0.08s delay each.

- [ ] **Step 2: Commit**

```bash
git add src/components/quiz/display/QuizQuestionDisplay.tsx
git commit -m "feat(quiz): add QuizQuestionDisplay component"
```

---

## Task 7: Create AnswerRevealDisplay

**Files:**
- Create: `src/components/quiz/display/AnswerRevealDisplay.tsx`

- [ ] **Step 1: Implement component**

Props: `question`, `options`, `correctAnswer`, `answerDistribution`, `totalResponses`.

Layout: Same structure as QuizQuestionDisplay but:
- All options use `isRevealed={true}` on `QuizOptionCard`.
- Correct option glows green and scales up.
- Wrong options dim and grayscale.
- Distribution bars show inside each option card.
- A "Correct Answer" header badge at top.

- [ ] **Step 2: Commit**

```bash
git add src/components/quiz/display/AnswerRevealDisplay.tsx
git commit -m "feat(quiz): add AnswerRevealDisplay component"
```

---

## Task 8: Create InterstitialLeaderboard

**Files:**
- Create: `src/components/quiz/display/InterstitialLeaderboard.tsx`

- [ ] **Step 1: Implement component**

Props: `entries: LeaderboardEntryDTO[]`, `visible: boolean`.

A bottom overlay (`fixed bottom-0 left-0 right-0 z-40`) that slides up when `visible`.
- Background: `--color-surface` with top rounded corners (`rounded-t-3xl`) and shadow.
- Height: ~60% of viewport.
- Title: "🏆 Top Players" large bold.
- Shows top 5 entries max.
- Each row:
  - 1st: Gold background tint, crown emoji/icon, name, score
  - 2nd: Silver tint, medal
  - 3rd: Bronze tint, medal
  - 4th-5th: Plain
- Animation: Container slides up (`translateY(100%) → 0`), rows stagger in (`0.1s` delay each).
- Exit: Slides down.

- [ ] **Step 2: Commit**

```bash
git add src/components/quiz/display/InterstitialLeaderboard.tsx
git commit -m "feat(quiz): add InterstitialLeaderboard component"
```

---

## Task 9: Create FinalPodium

**Files:**
- Create: `src/components/quiz/display/FinalPodium.tsx`

- [ ] **Step 1: Implement component**

Props: `entries: LeaderboardEntryDTO[]`, `quizTitle: string`.

Layout:
- Full-screen warm background.
- Big title: "🎉 Quiz Complete!" centered, `text-5xl md:text-7xl font-black`.
- Podium graphic (3 bars):
  - 2nd place: left, shorter bar, silver accent (`#9ca3af`), name + score below
  - 1st place: center, tallest bar, gold accent (`#f59e0b`), crown + name + score
  - 3rd place: right, medium bar, bronze accent (`#b45309`), name + score
  - Bars animate with staggered height growth (scaleY from 0 to 1).
- Below podium: Full leaderboard top 10 using `Leaderboard variant="display"`.
- Confetti: Simple CSS confetti animation (reuse existing `animate-confetti` from globals.css or create a lightweight CSS-only version).

- [ ] **Step 2: Commit**

```bash
git add src/components/quiz/display/FinalPodium.tsx
git commit -m "feat(quiz): add FinalPodium display component"
```

---

## Task 10: Rewrite the main Display Page

**Files:**
- Modify: `src/app/teacher/quizzes/display/[sessionId]/page.tsx`

- [ ] **Step 1: Implement orchestration logic**

Track local UI state:
```typescript
const [showCountdown, setShowCountdown] = useState(false);
const [showInterstitial, setShowInterstitial] = useState(false);
const prevStatusRef = useRef<string>("");
```

In the polling effect, detect transitions:
- `prevStatusRef.current === "LOBBY" && state.status === "LIVE"` → `setShowCountdown(true)`, then after 3s `setShowCountdown(false)`.
- `state.status === "REVEAL"` → after 2s `setShowInterstitial(true)`, after 6s total `setShowInterstitial(false)`.
- `state.status === "LIVE"` → `setShowInterstitial(false)` (reset for next question).
- `state.status === "ENDED"` → `setShowInterstitial(false)`.

Render structure:
```
<div className="fixed inset-0 bg-[#fffbf7] text-[#1a1a1a] overflow-hidden flex flex-col">
  <QuizProgressBar current={state.currentQuestionIndex + 1} total={state.totalQuestions} />
  
  {showCountdown && <CountdownOverlay onComplete={() => setShowCountdown(false)} />}
  
  {state.status === "LOBBY" && <QuizLobbyScreen ... />}
  {state.status === "LIVE" && <QuizQuestionDisplay ... />}
  {state.status === "REVEAL" && <AnswerRevealDisplay ... />}
  {state.status === "ENDED" && <FinalPodium ... />}
  
  <InterstitialLeaderboard 
    entries={state.leaderboard ?? []} 
    visible={showInterstitial} 
  />
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/teacher/quizzes/display/[sessionId]/page.tsx
git commit -m "feat(quiz): rewrite quiz display page with new UI/UX"
```

---

## Task 11: Lint & Typecheck

- [ ] **Step 1: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: No errors (or only pre-existing ones).

- [ ] **Step 3: Commit fixes if any**

---

## Spec Coverage Check

| Spec Requirement | Task |
|------------------|------|
| Warm light background | Task 10 (page wrapper) + all components |
| Colorful options (A=teal, B=amber, C=coral, D=violet) | Task 3 (QuizOptionCard) + Task 6 |
| No "Press Start" text | Task 4 (QuizLobbyScreen) |
| Big code display | Task 4 (QuizLobbyScreen) |
| Countdown 3-2-1 | Task 5 (CountdownOverlay) |
| Timer with color stages | Task 6 (QuizQuestionDisplay) |
| Correct answer glow + wrong dim | Task 3 (QuizOptionCard) + Task 7 |
| Distribution bars on reveal | Task 3 (QuizOptionCard) |
| Interstitial top-5 leaderboard | Task 8 (InterstitialLeaderboard) |
| Final podium | Task 9 (FinalPodium) |
| Smart pacing (fast question, dramatic countdown/leaderboard) | Task 10 (orchestration) + Task 5 + Task 8 |
| Big-screen typography | All display components |

---

*Plan complete. Ready for execution.*
