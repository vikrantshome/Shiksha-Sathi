# Design System Strategy: The Digital Atelier

## 1. Creative North Star: The Scholarly Sanctuary
This design system moves away from the aggressive, high-contrast "SaaS" aesthetic. Instead, it adopts the persona of a **Digital Atelier**—a refined, quiet workspace for educators. The goal is to provide a sense of "intellectual calm." We achieve this through a "low-velocity" visual language: replacing harsh borders with tonal shifts, using generous whitespace as a functional tool rather than a luxury, and employing a sophisticated, academic typographic scale.

The layout should feel like a well-organized physical desk—layered, tactile, and intentional. We reject "flashy" marketing tropes (heavy drop shadows, neon accents, or aggressive rounded corners) in favor of precision and subtle depth.

---

## 2. Color Theory & The "No-Line" Rule
The palette is rooted in warm, organic neutrals to reduce eye strain during long periods of academic planning, accented by a deep, authoritative teal.

### Surface Hierarchy & Nesting
We do not use lines to separate ideas. We use **Tonal Nesting**.
- **Base Layer:** Use `surface` (`#fcf9f5`) for the global background.
- **Sectioning:** Use `surface_container_low` (`#f6f3ef`) to define large workspace areas.
- **Actionable Containers:** Place `surface_container_lowest` (`#ffffff`) cards on top of the low container to create a soft, "lifted" paper effect.
- **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts. If a visual break is needed, use a `2rem` (Scale 6) gap of whitespace or a shift from `surface` to `surface_container`.

### Signature Textures
- **The Atelier Gradient:** For primary CTAs and Hero headers, use a subtle linear gradient from `primary` (`#12423f`) to `primary_container` (`#2d5a56`) at a 135-degree angle. This adds a "weighted" feel that flat color lacks.
- **Glassmorphism:** For floating navigation or over-content modals, use `surface_container_lowest` at 85% opacity with a `12px` backdrop-blur. This ensures the "Digital Atelier" feels integrated and airy.

---

## 3. Typography: The Geist Editorial
The system uses the **Geist** font family (implemented via the provided scale) to bridge the gap between technical precision and editorial elegance.

*Note: While the tokens list Inter/Manrope, we are mapping the Geist weights to these roles for the 'Digital Atelier' aesthetic.*

- **Display & Headlines (The Authoritative Voice):** Use `display-lg` through `headline-sm`. These should be set with tighter letter-spacing (-0.02em) to feel like a premium academic journal.
- **Titles (The Organizer):** `title-lg` and `title-md` serve as the primary "anchors" for content blocks.
- **Body & Labels (The Workhorse):** `body-md` is your default for teacher notes and lesson plans. Ensure a line-height of at least 1.6 to maintain the "airy" atelier feel.
- **Intentional Asymmetry:** Pair a large `display-md` headline with a wide-margin `body-sm` caption to create an editorial layout that breaks the standard "centered" web template.

---

## 4. Elevation & Depth: Tonal Layering
In this system, elevation is a property of light and material, not "shadow effects."

- **The Layering Principle:** Depth is achieved by stacking. A `surface_container_high` (`#ebe8e4`) element represents a "sunken" or "active" state, while `surface_container_lowest` (`#ffffff`) represents a "priority" or "foreground" state.
- **Ambient Shadows:** When a card must float (e.g., a dropdown or popover), use a shadow with a 24px blur, 0px spread, and 6% opacity using the `on_surface` color. This mimics natural light hitting high-quality vellum paper.
- **The "Ghost Border" Fallback:** If accessibility requirements demand a stroke (e.g., in high-contrast modes), use `outline_variant` (`#c0c8c6`) at 20% opacity. Never use 100% opaque borders.

---

## 5. Components: Refined Primitives

### Buttons & Interaction
- **Primary:** Gradient fill (Primary to Primary Container), white text, `ROUND_FOUR` (0.25rem) corners. No border.
- **Secondary:** `surface_container_highest` fill with `on_surface` text. This feels like a "pressed" part of the UI rather than a floating button.
- **Tertiary (Ghost):** No fill, `primary` text. Use for low-emphasis actions like "Cancel" or "View Details."

### Inputs & Fields
- **Text Inputs:** Use `surface_container_low` as the background. On focus, transition the background to `surface_container_lowest` and add a 1px "Ghost Border" using `primary`. Avoid heavy "glow" effects.
- **Cards & Lists:** Prohibit divider lines. Separate list items using `0.5rem` (Scale 1.5) of vertical padding and a subtle hover state shift to `surface_container_high`.

### The "Sathi" Specialty Components
- **The Lesson Card:** A `surface_container_lowest` container with a `3.5rem` (Scale 10) left-hand margin for "marginalia" (dates or status tags), mimicking a teacher's notebook.
- **The Resource Chip:** Use `secondary_container` (`#d3e4d3`) with `on_secondary_container` text. Subtle, organic, and non-distracting.

---

## 6. Do’s and Don’ts

### Do
- **Use "Scale 16" (5.5rem) Whitespace:** Use this for top-level section margins to let the design breathe.
- **Embrace the Asymmetric Grid:** Align headlines to the left while keeping body text slightly indented to create a rhythmic, academic flow.
- **Use Tonal Shifts for State:** Use `surface_dim` to indicate a disabled or "archived" workspace.

### Don't
- **Don't use 100% Black:** Always use `on_surface` (`#1c1c1a`) for text to maintain the warmth of the ivory background.
- **Don't use "Marketing" Shadows:** Avoid the heavy, dark shadows typical of consumer apps. If it looks like it’s "popping" off the screen, it’s too much.
- **Don't use Dividers:** If you feel the need to add a line, add `1.4rem` (Scale 4) of space instead. Trust the typography to hold the structure.