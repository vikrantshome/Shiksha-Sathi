# Quiz Display UI/UX Enhancement — Design Spec

**Date:** 2026-05-04  
**Scope:** `/teacher/quizzes/display/[sessionId]/page.tsx` + new components  
**Approach:** Hybrid Vibrant (warm light bg + colorful options + smart pacing)

---

## 1. Problem Statement

The current quiz projector display uses a black background with white text (`bg-black text-white`). This is:
- Hard to read in lit classrooms or on video calls (Zoom/Google Meet)
- Bland and uninspiring for students
- Missing key engagement moments: countdown, interstitial leaderboard, final podium
- Shows host-facing text ("Press Start on host console") to students

---

## 2. Theme & Visual Identity

### 2.1 Background
- Warm light surface: `#fffbf7` (existing `--color-surface`)
- Projector-friendly: high readability in both dark and lit rooms

### 2.2 Answer Option Colors (4 options, projector-optimized)
| Option | Hex | Role |
|--------|-----|------|
| A | `#0d5a54` | Brand primary (teal) |
| B | `#c67b2a` | Warm amber |
| C | `#c44a3a` | Coral red |
| D | `#6b4c9a` | Regal violet |

All colors are high-saturation, hue-distinct, and pass WCAG AA for large text on white.

### 2.3 Typography Scale (big-screen optimized)
| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Quiz title | 1.875rem | 3rem | 3.75rem |
| Question | 1.5rem | 2.25rem | 3rem |
| Option text | 1.25rem | 1.875rem | 2.25rem |
| Timer | 3rem | 4.5rem | 6rem |
| Countdown | 6rem | 8rem | 10rem |
| Code | 1.5rem | 2.25rem | 3rem |

### 2.4 Layout
- Full viewport (`fixed inset-0`)
- No scroll, everything centered
- Minimal chrome — content is the UI

---

## 3. Quiz States & Screen Designs

### 3.1 LOBBY — "Waiting Room"
- **Background:** Warm light with subtle gradient
- **Top bar:** Quiz title (left), participant count with pulse dot (right)
- **Center:** Giant animated code in a pill badge with monospace font
  - `Code: JCGR57` — 3rem+ font, tracking-widest, inside a rounded pill with subtle shadow
- **Below code:** "Waiting for host to start…" with 3 animated bouncing dots
- **No "Press Start on host console" text** — this screen is for students
- **Bottom bar:** Question count, maybe a subtle progress indicator

### 3.2 COUNTDOWN — "3-2-1 Go!"
- **Trigger:** When status transitions from LOBBY → LIVE (detected client-side)
- **Overlay:** Full-screen semi-transparent overlay on top of the first question
- **Animation:** Number scales from 0.3 → 1.2 → 1.0 with a spring bounce, color cycles through option palette
- **Duration:** ~3 seconds total (1s per number)
- **Sound:** Out of scope for this spec (visual only)
- **After countdown:** Number scales out, question options stagger in

### 3.3 LIVE — "Question Active"
- **Top bar:** Quiz title (left), big timer (center-right), question counter (right)
- **Timer behavior:**
  - >10s: Teal color, steady
  - 5-10s: Amber color, subtle pulse
  - <5s: Coral red, rapid pulse + scale bump
- **Question:** Centered, massive font, max 2 lines
- **Options:** 2x2 grid (or 2-col for TF)
  - Each option is a large rounded card with its color as left border or left accent
  - Label (A/B/C/D) in a circle with the option's color
  - Hover state not needed (display is view-only)
- **Progress bar:** Thin bar at very top showing question progress

### 3.4 REVEAL — "Answer Reveal"
- **Correct option:** Glows with green shadow (`#1B6B47`), scales up 1.05x, checkmark icon
- **Wrong options:** Dim to 40% opacity, grayscale filter
- **Answer distribution bars:** Show % of students who picked each option (mini horizontal bars inside each option card)
- **After 2 seconds:** Interstitial leaderboard auto-appears

### 3.5 INTERSTITIAL LEADERBOARD — "Top 5"
- **Trigger:** 2s after REVEAL state begins
- **Position:** Slides in from bottom as an overlay (covers bottom 60% of screen)
- **Content:** Top 5 ranked students
  - 1st: Gold crown/emoji + name + score, highlighted background
  - 2nd: Silver + name + score
  - 3rd: Bronze + name + score
  - 4th-5th: Plain rank + name + score
- **Animation:** Staggered slide-up (0.1s delay per row)
- **Duration:** Visible for 4 seconds, then auto-dismisses before next question
- **Dismiss:** Slides down, next question (or next reveal) appears

### 3.6 ENDED — "Final Podium"
- **Background:** Slightly darker warm tone or subtle confetti pattern
- **Title:** "Quiz Complete!" in massive text
- **Podium:** 3D-style podium graphic showing top 3
  - 1st place: Center, tallest, gold accent
  - 2nd place: Left, silver accent
  - 3rd place: Right, bronze accent
- **Below podium:** Full leaderboard (top 10) in a clean list
- **Animation:** Podium elements scale in with bounce, confetti CSS animation

---

## 4. Component Breakdown

### 4.1 Existing — Modified
- `Leaderboard.tsx` — Add `variant?: 'default' | 'display'` prop. Display variant uses larger text, no section wrapper, accepts `maxEntries` prop.

### 4.2 New Components
1. **`QuizLobbyScreen`** — Lobby state UI with animated code and waiting dots
2. **`CountdownOverlay`** — Full-screen 3-2-1 countdown with spring animation
3. **`QuizQuestionDisplay`** — Question + options grid for LIVE state
4. **`AnswerRevealDisplay`** — Reveal state with correct highlight + distribution bars
5. **`InterstitialLeaderboard`** — Bottom-sheet style top-5 leaderboard overlay
6. **`FinalPodium`** — ENDED state with 3D podium and full leaderboard
7. **`QuizOptionCard`** — Reusable option card with color, reveal state, and distribution bar
8. **`QuizProgressBar`** — Thin top progress bar

### 4.3 Display Page Architecture
```
QuizDisplayPage
├── QuizProgressBar (always visible)
├── TopBar (title, timer, question count)
├── Main Content (switches by status)
│   ├── LOBBY → QuizLobbyScreen
│   ├── LIVE → CountdownOverlay (on transition) + QuizQuestionDisplay
│   ├── REVEAL → AnswerRevealDisplay + InterstitialLeaderboard (after delay)
│   └── ENDED → FinalPodium
└── BottomBar (code, participant count — lobby only)
```

---

## 5. Data Flow & State Machine

The display page already polls `api.quizSessions.getTeacherState(sessionId)` every 2s. We add client-side state:

```
local UI states:
- showCountdown: boolean  // true on LOBBY→LIVE transition
- showInterstitial: boolean  // true 2s after REVEAL, false after 4s
- previousStatus: string  // to detect transitions
```

**Transitions:**
- `LOBBY → LIVE`: Set `showCountdown = true`, start 3s timer, then `showCountdown = false`
- `LIVE → REVEAL`: Natural — just render reveal UI
- `REVEAL`: After 2s, `showInterstitial = true`. After 6s total, `showInterstitial = false`.
- `REVEAL → LIVE` (next question): Reset interstitial, optionally show a quick "Next Question" flash
- Any → ENDED: Show FinalPodium

---

## 6. Animation Spec

| Animation | Duration | Easing | Details |
|-----------|----------|--------|---------|
| Countdown number enter | 0.4s | spring(0.5, 0.8, 0.3) | Scale 0.3→1.2→1.0 |
| Countdown number exit | 0.2s | ease-in | Scale 1.0→0.0, opacity 1→0 |
| Option card stagger | 0.3s | ease-out | Each card delays 0.08s, slide up 20px |
| Correct answer glow | 0.5s | ease-out | Scale 1.0→1.05, green shadow appears |
| Wrong option dim | 0.4s | ease-out | Opacity 1→0.4, grayscale 0→100% |
| Interstitial slide up | 0.4s | cubic-bezier(0.4,0,0.2,1) | translateY(100%)→0 |
| Leaderboard row stagger | 0.25s | ease-out | 0.1s delay per row |
| Podium bounce | 0.6s | cubic-bezier(0.68,-0.55,0.265,1.55) | Scale 0→1.1→1.0 |
| Timer pulse (<5s) | 0.5s | ease-in-out | Infinite pulse, color change |
| Waiting dots bounce | 1.2s | ease-in-out | Infinite, staggered 0.15s |

---

## 7. Accessibility

- All text maintains WCAG AA contrast on `#fffbf7`
- Animations respect `prefers-reduced-motion` (disable bounce, use simple fades)
- No critical info conveyed by color alone (correct answer has checkmark + text)
- Font sizes are large enough for projector viewing (minimum 1.25rem on mobile, 1.5rem+ on desktop)

---

## 8. Out of Scope

- Sound effects (countdown beep, correct answer chime)
- Custom themes per quiz
- Background images or video
- Real-time WebSocket (continues with polling)

---

## 9. Files to Modify / Create

### Modify
- `src/app/teacher/quizzes/display/[sessionId]/page.tsx` — Complete rewrite
- `src/components/quiz/Leaderboard.tsx` — Add `variant` and `maxEntries` props

### Create
- `src/components/quiz/display/QuizLobbyScreen.tsx`
- `src/components/quiz/display/CountdownOverlay.tsx`
- `src/components/quiz/display/QuizQuestionDisplay.tsx`
- `src/components/quiz/display/AnswerRevealDisplay.tsx`
- `src/components/quiz/display/InterstitialLeaderboard.tsx`
- `src/components/quiz/display/FinalPodium.tsx`
- `src/components/quiz/display/QuizOptionCard.tsx`
- `src/components/quiz/display/QuizProgressBar.tsx`

---

*Spec written. Ready for implementation planning.*
