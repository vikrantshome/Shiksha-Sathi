# Shiksha Sathi — "Sutra Academic" Design System

> **Creative North Star: "The Digital Atelier"**
>
> A premium, quiet space for intellectual growth. Structured utility of a research lab
> meets the warmth of a modern library. Curated, not generated.

---

## 1. Color Palette

### Primary Accent — Deep Teal
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#446371` | Primary actions, active states, links |
| `--color-primary-dim` | `#385765` | Hover states, CTA gradients |
| `--color-primary-container` | `#c6e8f8` | Light teal backgrounds, selected states |
| `--color-on-primary` | `#f2faff` | Text on primary backgrounds |
| `--color-on-primary-container` | `#365663` | Text on primary-container |

### Surfaces — Warm Neutrals
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-surface` | `#faf9f5` | Page background (base layer) |
| `--color-surface-container-lowest` | `#ffffff` | Cards, elevated interactive elements |
| `--color-surface-container-low` | `#f4f4ef` | Sidebars, structural sections |
| `--color-surface-container` | `#eeeee9` | Nested containers, table headers |
| `--color-surface-container-high` | `#e8e9e3` | Hover backgrounds |
| `--color-surface-container-highest` | `#e1e3dd` | Inactive states, disabled elements |

### Text & Outline
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-on-surface` | `#30332f` | Primary text (NEVER use pure black) |
| `--color-on-surface-variant` | `#5d605b` | Secondary text, metadata, descriptions |
| `--color-outline` | `#797c76` | Borders when absolutely necessary |
| `--color-outline-variant` | `#b0b3ad` | Ghost borders at 15% opacity |

### Semantic — Status
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#2d6a4f` | Correct answers, success states |
| `--color-success-container` | `#d4edda` | Success backgrounds |
| `--color-warning` | `#b45309` | Warnings, medium performance |
| `--color-warning-container` | `#fef3cd` | Warning backgrounds |
| `--color-error` | `#a83836` | Errors, incorrect answers |
| `--color-error-container` | `#fa746f` | Error backgrounds |

### Secondary & Tertiary
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-secondary` | `#536167` | Secondary actions |
| `--color-secondary-container` | `#d6e5ec` | Secondary highlights |
| `--color-tertiary` | `#546073` | Tertiary accent |
| `--color-tertiary-container` | `#d7e3fa` | Tertiary highlights |

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

## 9. Do's & Don'ts

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
