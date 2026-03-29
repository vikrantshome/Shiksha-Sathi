# Design System Specification: The Academic Curator

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Atelier."** 

Unlike typical EdTech platforms that rely on loud "gamified" colors and heavy rounded corners, this system treats the interface as a premium, quiet space for intellectual growth. We are blending the structured utility of a research lab with the warmth of a modern library. 

To break the "template" look, we move away from rigid grids and 1px borders. Instead, we use **Intentional Asymmetry** and **Tonal Depth**. By shifting focus from "boxes" to "surfaces," we create an editorial layout that feels curated rather than generated. The goal is to make the teacher feel authoritative and the student feel calm.

---

## 2. Colors & Surface Logic
Our palette is rooted in warm neutrals to reduce eye strain, accented by a sophisticated "Deep Teal" (`primary: #446371`) that feels academic and timeless.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Boundaries must be established through background color shifts. 
*   **Example:** A side-rail using `surface_container_low` (#f4f4ef) sitting flush against a `surface` (#faf9f5) main content area. This creates a clean, sophisticated transition without the visual "noise" of a line.

### Surface Hierarchy & Nesting
Treat the UI as a series of layered fine papers. Depth is achieved by nesting surface tokens:
*   **Base Layer:** `surface` (#faf9f5)
*   **Structural Sections:** `surface_container_low` (#f4f4ef) or `surface_container` (#eeeee9)
*   **Interactive Cards:** `surface_container_lowest` (#ffffff) to make them "pop" subtly from the off-white background.

### The "Glass & Gradient" Rule
To avoid a flat, "cheap" feel, use **Glassmorphism** for floating elements (like top navigation or popovers). Use the `surface` color at 80% opacity with a `20px` backdrop-blur. 
For primary CTAs, apply a subtle linear gradient from `primary` (#446371) to `primary_dim` (#385765) at a 145-degree angle. This adds a "weighted" feel to buttons that flat hex codes lack.

---

## 3. Typography: Editorial Precision
We utilize a dual-font strategy to balance authority with modern readability. Note the "small-scale" sizing to maintain an academic, dense-but-clear information density.

*   **Display & Headlines (Manrope):** Used for "Brand Moments" and section headers. Manrope’s geometric yet warm nature provides the "Authoritative" voice.
    *   *Headline-MD:* 1.75rem | Tracking: -0.02em (Tighten for a premium look).
*   **Body & UI (Inter/Geist):** Geist (or Inter as the fallback) is used for all functional text. 
    *   *Body-MD:* 0.875rem | Line-Height: 1.6 (Generous leading is required for academic reading).
    *   *Label-SM:* 0.6875rem | Uppercase | Tracking: 0.05em (Used for metadata like "ASSIGNMENT DUE DATE").

**Hierarchy Tip:** Contrast a `display-sm` heading in `on_surface` (#30332f) with a `label-md` sub-header in `primary` (#446371). The scale shift creates an "editorial" feel.

---

## 4. Elevation & Depth
In this system, "Elevation" is a state of light, not a shadow effect.

*   **The Layering Principle:** Avoid shadows for static cards. Instead, place a `surface_container_lowest` (#ffffff) card on top of a `surface_container` (#eeeee9) background. The 4% difference in luminosity is enough to signify a new layer.
*   **Ambient Shadows:** Use only for transient elements (Modals, Dropdowns). 
    *   *Spec:* `0px 12px 32px rgba(48, 51, 47, 0.06)`. Note the tint: the shadow is a low-opacity version of `on_surface`, not pure black.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline_variant` (#b0b3ad) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Cards & Lists
*   **The Rule:** No dividers. Use `spacing-5` (1.7rem) of vertical white space to separate list items.
*   **Styling:** Cards use `roundedness-md` (0.375rem). They should never have a shadow unless hovered. On hover, shift the background from `surface_container_lowest` to `surface_bright`.

### Buttons
*   **Primary:** Background: `primary` (#446371). Text: `on_primary` (#f2faff). Shape: `roundedness-sm` (0.125rem) for a more architectural, "Notion-esque" feel.
*   **Tertiary (Ghost):** No background. Use `primary` for text. On hover, use `primary_container` at 20% opacity.

### Academic Inputs
*   **Styling:** Input fields use `surface_container_low` with a bottom-only `outline_variant` (20% opacity). When focused, the bottom border animates to 2px width using `primary`.
*   **Helper Text:** Always use `body-sm` in `on_surface_variant` to keep the UI looking "quiet."

### The "Course Progress" Component (Special)
Instead of a thick progress bar, use a ultra-thin 2px line using `primary_fixed_dim` as the track and `primary` as the indicator. This maintains the "refined" aesthetic.

---

## 6. Do's & Don'ts

### Do:
*   **Do** use asymmetrical margins. For example, a wider left margin (8.5rem / `spacing-24`) for a "gutter" feel, mimicking a textbook.
*   **Do** use `on_surface_variant` (#5d605b) for secondary information. It softens the interface.
*   **Do** utilize the `surface_container_highest` (#e1e3dd) for inactive states or empty containers.

### Don't:
*   **Don't** use `blue-600` or any "default" web blues. Stick strictly to the Teal/Slate tokens.
*   **Don't** use standard `rounded-lg` or `rounded-xl`. Keep corners "Academic" and "Sharp" (Max `0.375rem`).
*   **Don't** use 100% black text. Always use `on_surface` (#30332f) to maintain the "warm" feel.
*   **Don't** use icons with heavy fills. Use light-weight (2px stroke) outline icons to match the Geist font weight.