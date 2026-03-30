# Shiksha Sathi Design System

> **Creative North Star: Shiksha Sathi — Built for Indian Teachers**
>
> A premium, quiet space for intellectual growth. Structured utility of a research lab
> meets the warmth of a modern library. Curated, not generated.

---

## 1. Color Palette

### Primary Accent — Deep Forest Green (Stitch Export)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#12423f` | Primary actions, active states, links |
| `--color-primary-dim` | `#204e4a` | Hover states, CTA gradients |
| `--color-primary-container` | `#bcece6` | Light teal backgrounds, selected states |
| `--color-on-primary` | `#ffffff` | Text on primary backgrounds |
| `--color-on-primary-container` | `#a1cfca` | Text on primary-container |

### Surfaces — Warm Neutrals
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-surface` | `#fcf9f5` | Page background (base layer) |
| `--color-surface-container-lowest` | `#ffffff` | Cards, elevated interactive elements |
| `--color-surface-container-low` | `#f6f3ef` | Sidebars, structural sections |
| `--color-surface-container` | `#f0ede9` | Nested containers, table headers |
| `--color-surface-container-high` | `#ebe8e4` | Hover backgrounds |
| `--color-surface-container-highest` | `#e5e2de` | Inactive states, disabled elements |

### Text & Outline
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-on-surface` | `#1c1c1a` | Primary text (NEVER use pure black) |
| `--color-on-surface-variant` | `#404847` | Secondary text, metadata, descriptions |
| `--color-outline` | `#707977` | Borders when absolutely necessary |
| `--color-outline-variant` | `#c0c8c6` | Ghost borders at 15% opacity |

### Semantic — Status
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#2d6a4f` | Correct answers, success states |
| `--color-success-container` | `#d4edda` | Success backgrounds |
| `--color-warning` | `#b45309` | Warnings, medium performance |
| `--color-warning-container` | `#fef3cd` | Warning backgrounds |
| `--color-error` | `#ba1a1a` | Errors, incorrect answers |
| `--color-error-container` | `#ffdad6` | Error backgrounds |

### Secondary & Tertiary
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-secondary` | `#536255` | Secondary actions |
| `--color-secondary-container` | `#d3e4d3` | Secondary highlights |
| `--color-tertiary` | `#583222` | Tertiary accent |
| `--color-tertiary-container` | `#fcdfd3` | Tertiary highlights |

---

## 2. Typography

### Font Stack
- **Headlines & Brand:** `Manrope` (geometric warmth, "authoritative" voice)
- **Body & UI:** `Geist Sans` (system font, already loaded via Next.js)
- **Code:** `Geist Mono`

### Scale (Refined — small, elegant sizing)
| Token | Size | Weight | Line-Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| `display-lg` | 2.25rem | 700 | 1.2 | -0.03em | Hero headlines |
| `display-sm` | 1.75rem | 600 | 1.25 | -0.02em | Page titles |
| `headline-md` | 1.25rem | 600 | 1.3 | -0.01em | Section headers |
| `headline-sm` | 1.0625rem | 600 | 1.35 | 0 | Card titles |
| `body-lg` | 1rem | 400 | 1.6 | 0 | Primary body text |
| `body-md` | 0.875rem | 400 | 1.6 | 0 | Standard body |
| `body-sm` | 0.8125rem | 400 | 1.5 | 0 | Helper text, captions |
| `label-lg` | 0.875rem | 500 | 1.3 | 0.02em | Button text |
| `label-md` | 0.75rem | 500 | 1.3 | 0.03em | Metadata labels |
| `label-sm` | 0.6875rem | 500 | 1.3 | 0.05em | Uppercase metadata |

---

## 3. Spacing Scale (4px base)
| Token | Value |
|-------|-------|
| `--space-0` | 0 |
| `--space-1` | 0.25rem (4px) |
| `--space-2` | 0.5rem (8px) |
| `--space-3` | 0.75rem (12px) |
| `--space-4` | 1rem (16px) |
| `--space-5` | 1.25rem (20px) |
| `--space-6` | 1.5rem (24px) |
| `--space-8` | 2rem (32px) |
| `--space-10` | 2.5rem (40px) |
| `--space-12` | 3rem (48px) |
| `--space-16` | 4rem (64px) |
| `--space-20` | 5rem (80px) |
| `--space-24` | 6rem (96px) |

---

## 4. Shape & Corners
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 0.125rem (2px) | Buttons, badges |
| `--radius-md` | 0.375rem (6px) | Cards, inputs |
| `--radius-lg` | 0.5rem (8px) | Modals, large containers |
| `--radius-full` | 9999px | Avatars, pills |

**Rule:** Never exceed `0.5rem` for corners. Keep the aesthetic sharp and architectural.

---

## 5. Elevation & Depth

### The Layering Principle
Avoid shadows for static elements. Use surface color shifts to establish depth:
- Base: `--color-surface` → Structural: `--color-surface-container-low` → Cards: `--color-surface-container-lowest`

### Ambient Shadows (transient elements only)
| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 3px rgba(48, 51, 47, 0.04)` | Subtle lift on hover |
| `--shadow-md` | `0 4px 12px rgba(48, 51, 47, 0.06)` | Dropdowns, popovers |
| `--shadow-lg` | `0 12px 32px rgba(48, 51, 47, 0.08)` | Modals, floating panels |

### Glass Effect (floating navigation, popovers)
```css
background: rgba(250, 249, 245, 0.8);
backdrop-filter: blur(20px);
```

---

## 6. Transitions
| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | `120ms ease-out` | Hover states, micro-interactions |
| `--transition-normal` | `200ms ease-out` | Expand/collapse, visibility |
| `--transition-slow` | `350ms ease-out` | Page transitions, modals |

---

## 7. Component Patterns

### Buttons
- **Primary:** `background: linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))`, text: `var(--color-on-primary)`, radius: `var(--radius-sm)`
- **Secondary (Ghost):** No background, text: `var(--color-primary)`, hover: `var(--color-primary-container)` at 30% opacity
- **Destructive:** `var(--color-error)` background, `var(--color-on-primary)` text

### Cards
- Background: `var(--color-surface-container-lowest)` on `var(--color-surface)` parent
- No border by default. Use `var(--color-outline-variant)` at 15% opacity only when necessary
- Radius: `var(--radius-md)`
- Hover: shift to `var(--color-surface-container-high)` with `var(--transition-fast)`

### Form Inputs
- Background: `var(--color-surface-container-low)`
- Border: bottom-only, `var(--color-outline-variant)` at 20% opacity
- Focus: bottom border animates to 2px `var(--color-primary)`
- Radius: `var(--radius-md)` (top corners only for bottom-border style)

### Tables
- Header: `var(--color-surface-container)`, `label-sm` uppercase, `on-surface-variant` text
- Rows: `var(--color-surface-container-lowest)` background
- Hover: `var(--color-surface-container-high)`
- No row dividers — use spacing instead

### Badges / Tags
- Background: `var(--color-primary-container)`, text: `var(--color-on-primary-container)`
- Radius: `var(--radius-sm)`
- Font: `label-sm`, uppercase

### Progress Bars
- Track: `var(--color-surface-container)`, 2px height
- Indicator: `var(--color-primary)`, 2px height
- Rounded ends

---

## 8. Layout Principles

### The "No-Line" Rule
Do NOT use 1px solid borders to define sections. Use background color shifts instead.
- Sidebar: `surface-container-low` against `surface` main area
- Cards: `surface-container-lowest` on `surface` background

### Refined Spacing
- Page padding: `var(--space-8)` (desktop), `var(--space-4)` (mobile)
- Section gaps: `var(--space-8)` between major sections
- Card padding: `var(--space-5)` internal
- Compact lists: `var(--space-3)` between items

### Navigation
- Top nav: glassmorphism effect, sticky, `var(--space-4)` padding
- Active route: `var(--color-primary)` text + 2px bottom indicator
- Inactive: `var(--color-on-surface-variant)` text

---

## 9. Responsive System & Breakpoints

To enforce intentional behavior across devices, all layouts must explicitly consider the following 3 breakpoint tiers. Do NOT rely solely on CSS shrink/stretch behavior.

### Tiers & Triggers
| Breakpoint | Trigger Size | Primary Flow Implication |
|------------|--------------|--------------------------|
| **Mobile** | `< 768px` | Strict linear/progressive flow. Bottom-sheet driven tasks. Single column. |
| **Tablet** | `768px - 1024px` | Condensed shells. Collapsed left rails. Two columns stack to one. |
| **Desktop**| `> 1024px` | Persistent left rail, sticky side trays, multi-region lateral workspaces. |

### Shell & Navigation Behavior
- **Desktop**: Persistent side-rails and persistent header. High-density view logic.
- **Tablet**: Side-rails collapse to iconbars or off-canvas overlay. Content spans full width or tighter max-widths.
- **Mobile**: Top header condenses to hamburger icon. High-action areas utilize sticky bottom action bars to respect "thumb zone" interactions.

### Component Density Rules
- **Tap Targets**: Minimum 44px height for interactive elements on Mobile/Tablet. Desktop can retain compact 32-36px sizing (like `btn-primary`).
- **Forms**: Dual-column forms on desktop switch to single-column stacking on tablet/mobile. Side-by-side selects/inputs must drop to full width.
- **Tables**: List-card fallback patterns preferred for mobile instead of forced horizontal scroll tables where feasible.

---

## 10. Do's & Don'ts

### ✅ Do
- Use `var(--color-on-surface)` (#30332f) for all primary text — NEVER pure black
- Use `var(--color-on-surface-variant)` for secondary information
- Use surface token shifts for section boundaries
- Keep corners ≤ 0.5rem (architectural, not bubbly)
- Use 2px stroke outline icons to match Geist weight
- Apply gradient to primary CTAs for "weighted" feel

### ❌ Don't
- Use `blue-600` or any default Tailwind blues
- Use `rounded-lg` or `rounded-xl` (max `rounded-md` with 0.375rem)
- Use pure `#000000` for text
- Use 1px solid borders to separate sections
- Use heavy-fill icons
- Use `shadow-sm`/`shadow-md` on static cards (depth via surface tokens only)
