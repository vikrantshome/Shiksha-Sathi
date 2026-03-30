# Design System Strategy: The Digital Atelier

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Scholarly Curator."** 

Education is often cluttered and chaotic; this system aims to be the antithesis of that. We are building a "Digital Atelier"—a workspace that feels as intentional as a private library and as functional as a modern studio. To move beyond the "template" look, we reject the rigid, boxed-in layouts of traditional SaaS. Instead, we embrace **intentional asymmetry** and **tonal depth**. 

Layouts should feel like a well-composed editorial spread. Large `display` typography should anchor the page, while content "floats" on layered cream surfaces. We avoid hard lines in favor of soft transitions, creating a high-end experience that respects the educator's cognitive load.

---

## 2. Colors: Tonal Sophistication
Our palette is rooted in the academic tradition but executed with modern digital depth.

### The "No-Line" Rule
**Strict Directive:** Do not use 1px solid borders to section content. Boundaries must be defined solely through background color shifts. For example, a sidebar in `surface_container_low` (#f4f4f0) should sit against a `background` (#faf9f5) main area. This creates a "seamless" professional finish.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like fine parchment stacked on a heavy oak desk.
- **Base Layer:** `surface` (#faf9f5) or `background` (#faf9f5).
- **Secondary Content:** `surface_container_low` (#f4f4f0).
- **Interactive Cards:** `surface_container_lowest` (#ffffff) to provide a "pop" of clean white.
- **Active/Highlighted Zones:** `secondary_container` (#cae5e1) for a soft, professional wash of color.

### The "Glass & Gradient" Rule
To elevate the "Atelier" feel, use **Glassmorphism** for floating elements (like navigation bars or hovering action menus). Use the `surface` color at 80% opacity with a `24px` backdrop blur. 
- **Signature Polish:** For primary Call-to-Actions (CTAs), apply a subtle linear gradient from `primary` (#002b29) to `primary_container` (#12423f). This adds a "jewel-toned" depth that feels premium and tactile.

---

## 3. Typography: The Editorial Voice
We use **Manrope** exclusively. Its geometric yet humanist qualities bridge the gap between "modern tech" and "scholarly legibility."

- **Display (LG/MD):** Used for "Hero" moments or section starts. Use `primary` (#002b29) color. Set with tight letter-spacing (-0.02em) to feel authoritative.
- **Headline (LG/MD/SM):** The workhorse for page titles. Use `on_surface` (#1b1c1a).
- **Title (LG/MD/SM):** Reserved for card headers and navigation. These should feel "sturdy."
- **Body (LG/MD):** Set in `on_surface_variant` (#404847) for long-form reading. The muted slate reduces eye strain for teachers during late-night grading.
- **Label (MD/SM):** Used for metadata. Always uppercase with +0.05em tracking to differentiate from body text.

---

## 4. Elevation & Depth: Tonal Layering
In this system, "Depth" is a feeling, not a drop-shadow.

### The Layering Principle
Achieve hierarchy by stacking `surface-container` tiers. 
*   **Level 0:** `background` (The Desk)
*   **Level 1:** `surface_container` (The Folder)
*   **Level 2:** `surface_container_lowest` (The Paper)

### Ambient Shadows
If a floating element (like a Modal or Popover) requires a shadow, it must be "Ambient."
- **Spec:** `0px 12px 32px` blur, color: `on_surface` (#1b1c1a) at **4% opacity**. It should feel like a soft glow of light, not a black smudge.

### The "Ghost Border" Fallback
If contrast testing requires a container boundary, use a **Ghost Border**: `outline_variant` (#c0c8c6) at **20% opacity**. This provides a hint of structure without breaking the "Atelier" softness.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `on_primary` text. Radius: `lg` (0.5rem / 8px).
- **Secondary:** `surface_container_high` fill with `on_secondary_container` text. No border.
- **Tertiary:** Pure text using `primary` color, with a `surface_container` background appearing only on hover.

### Input Fields
- Avoid the "box" look. Use a `surface_container_highest` (#e3e2df) background with a bottom-only stroke in `outline` (#707977). This mimics a signature line on a document.
- **Error State:** Use `error` (#ba1a1a) for the bottom stroke and `error_container` (#ffdad6) for a very subtle background tint.

### Cards & Lists
- **Strict Rule:** Forbid divider lines. 
- Use the **Spacing Scale** (specifically `8` / 2rem) to create clear breathing room between list items. 
- For cards, use `surface_container_low` with a hover state that shifts to `surface_container_lowest` and adds an Ambient Shadow.

### Academic-Specific Components
- **The Progress Ribbon:** Use `primary_fixed` (#bcece7) as a background for progress bars, with `primary` (#002b29) as the indicator.
- **The "Insight" Chip:** For teacher tips, use `tertiary_container` (#573120) with `on_tertiary_fixed` (#311305) text. This warm, earthy tone highlights "human" feedback.

---

## 6. Do's and Don'ts

### Do:
- **Use "White Space" as a Tool:** If a layout feels cluttered, don't add a border; add `spacing-12` (3rem).
- **Embrace Asymmetry:** Align text to the left but allow imagery or secondary data to sit offset to the right.
- **Layering:** Always place "lighter" surfaces on "darker" cream backgrounds to create lift.

### Don't:
- **Don't use Pure Black:** Always use `on_surface` (#1b1c1a) for text to maintain the "Digital Atelier" warmth.
- **Don't use 100% Opaque Borders:** This is a "No-Line" system. High-contrast lines make the platform feel like a spreadsheet; we want it to feel like a workspace.
- **Don't Over-round:** Stick to the `lg` (8px) rounding. Going rounder feels "juvenile"; going sharper feels "industrial." 8px is the scholarly middle ground.