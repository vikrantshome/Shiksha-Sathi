# Design System Document: The Scholarly Sanctuary

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Scholarly Sanctuary."** 

This is not a generic educational dashboard; it is a premium digital atelier. We are moving away from the "industrial" feel of traditional EdTech—rigid grids, harsh dividers, and bright blues—and toward an editorial, high-end experience that mimics the feel of a bespoke research journal or a modern, light-filled library.

To break the "template" look, we prioritize **intentional asymmetry** and **tonal depth**. Layouts should feel breathable and organic. Elements should not feel "pasted" onto a grid but rather layered like fine parchment. We use significant shifts in typography scale to create an authoritative hierarchy that guides the student through their learning journey with quiet confidence.

---

## 2. Colors & Surface Philosophy
The palette is rooted in the tension between the intellectual weight of Deep Teal and the breathable warmth of Cream.

### The "No-Line" Rule
**1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined through:
1.  **Background Color Shifts:** Use `surface_container_low` sections sitting on a `surface` background.
2.  **Tonal Transitions:** A card should be distinguished from its parent container by moving one step up or down the surface hierarchy (e.g., a `surface_container_lowest` card on a `surface_container` background).

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the Material tiers to define importance:
*   **Base Layer:** `surface` (#fcf9f5) or `surface_bright`.
*   **Structural Sections:** `surface_container_low` (#f6f3ef) to define large content areas.
*   **Interactive Components:** `surface_container_highest` (#e5e2de) for elements that require immediate attention.
*   **Floating Cards:** `surface_container_lowest` (#ffffff) to provide a "lifted" look against darker neutral backgrounds.

### The "Glass & Gradient" Rule
To elevate the system, use **Glassmorphism** for floating headers or navigation rails. Apply a semi-transparent `surface` color with a 20px backdrop blur. 
*   **Signature Gradients:** For primary CTAs and Hero sections, use a subtle linear gradient transitioning from `primary` (#002b29) to `primary_container` (#12423f) at a 135-degree angle. This adds "soul" and prevents the deep teal from feeling flat.

---

## 3. Typography: The Editorial Voice
We use **Manrope** exclusively. It is clean and professional, but our implementation must feel "scholarly."

*   **Display-lg (3.5rem):** Reserved for high-impact landing moments. Use a tight letter-spacing (-0.02em) to give it an authoritative, "printed" feel.
*   **Headline-md (1.75rem):** Use this for course titles and major module headers. It should always have generous top padding (Spacing 16) to create breathing room.
*   **Body-lg (1rem):** Our primary reading size. Ensure a line-height of 1.6 to maintain the "scholarly" legibility of long-form educational content.
*   **Label-md (0.75rem):** Use `primary_container` (#12423f) for labels to make metadata feel like an intentional part of the design, not an afterthought.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than traditional drop shadows.

*   **Ambient Shadows:** If a floating element (like a modal or a primary action button) requires a shadow, it must be extra-diffused. Use a blur of 30px-40px with an opacity of 6% using the `on_surface` color. It should feel like a soft glow of light, not a "drop shadow."
*   **The Layering Principle:** Place a `surface_container_lowest` card on a `surface_container_low` background. This creates a natural, soft lift that is accessible yet invisible to the untrained eye.
*   **The "Ghost Border" Fallback:** For input fields or high-density data where separation is legally required for accessibility, use the `outline_variant` token at **15% opacity**. It should be a "ghost" of a line—felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** Filled with the Deep Teal gradient (`primary_container`). Use `xl` roundedness (1.5rem) to make them approachable. Text should be `on_primary` (White).
*   **Secondary:** No fill. Use a `surface_container_highest` background on hover. No border.
*   **Tertiary:** Text-only in `primary_fixed_variant` (#204e4b) with a subtle underline on hover.

### Cards & Lists
*   **Rule:** Forbid divider lines. 
*   **Execution:** Separate list items using a `surface_container_low` background for even rows and `surface` for odd rows, or simply use `Spacing 4` (1.4rem) of vertical whitespace.
*   **Course Cards:** Use `surface_container_lowest` (#ffffff) with an `lg` (1rem) corner radius.

### Input Fields
*   **Style:** Use `surface_container_high` as the background fill. 
*   **State:** On focus, the background shifts to `surface_bright` and a 2px "Ghost Border" (20% opacity `primary`) appears. No hard black outlines.

### Progress Indicators (App Specific)
*   **Course Progress:** A thick 8px bar using `secondary_container` as the track and the deep teal `primary` as the indicator. Do not use rounded caps; use flat ends for a more "architectural" feel.

---

## 6. Do’s and Don'ts

### Do
*   **Do** use asymmetrical margins. If a container has 40px left padding, try 64px right padding to create an editorial "column" feel.
*   **Do** use the `tertiary_container` (#573120) for "Moment of Delight" accents (e.g., a small badge for a completed lesson).
*   **Do** prioritize white space. If you think there is enough room, add another 1rem of spacing.

### Don't
*   **Don't** use 100% black (#000000) for text. Always use `on_surface` (#1c1c1a) to maintain the warmth of the cream palette.
*   **Don't** use standard "Material Design" blue for links. Use the Deep Teal `primary` (#002b29).
*   **Don't** use hard corners. Every element should have at least the `DEFAULT` (0.5rem) roundedness to maintain the "approachable" feel.