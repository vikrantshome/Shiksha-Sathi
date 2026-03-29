# Design System Strategy: The Scholarly Sanctuary

## 1. Overview & Creative North Star
**Creative North Star: "The Curated Atheneum"**
This design system moves away from the frantic, notification-heavy nature of modern apps and instead embraces the quiet authority of a high-end research library. It is designed to feel like a "Scholarly Sanctuary"—a digital space that promotes deep focus, high trust, and academic excellence.

To break the "standard template" look, we utilize **Intentional Asymmetry**. Large `display-lg` typography is often offset against generous whitespace (`spacing.16` or `spacing.20`), and content modules are layered using tonal depth rather than rigid grids. This creates an editorial feel where the information has room to breathe, suggesting that every piece of content is curated and significant.

---

## 2. Color & Surface Architecture
The palette is rooted in warm, organic neutrals to reduce eye strain during long study sessions, punctuated by a deep, authoritative teal.

### The "No-Line" Rule
**Borders are prohibited for sectioning.** To define boundaries, designers must use background color shifts. For example, a `surface_container_low` sidebar should sit directly against a `surface` main content area. This creates a seamless, high-end feel that mimics premium stationery rather than a digital wireframe.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine parchment. Use the Material tiers to define importance:
- **Base Layer:** `surface` (#fcf9f4) – The primary canvas.
- **Sectioning:** `surface_container_low` (#f6f3ee) – For large background areas like sidebars or footer regions.
- **Content Cards:** `surface_container_lowest` (#ffffff) – Used to "lift" primary content blocks off the warmer background.
- **Interaction Layers:** `surface_container_high` (#ebe8e3) – For inactive states or subtle "well" effects.

### The Glass & Gradient Rule
For elements that need to feel "elevated" (like a floating navigation bar or a focused modal), use **Glassmorphism**. Combine `surface` at 80% opacity with a `backdrop-blur` of 12px. 
*   **Signature Texture:** Use a subtle linear gradient on primary CTAs transitioning from `primary_container` (#12423f) to `primary` (#002b29). This prevents the deep teal from feeling "flat" and adds a sophisticated, velvet-like depth.

---

## 3. Typography: The Editorial Voice
We use **Manrope** exclusively. Its geometric yet humanist qualities provide the "academic-modern" balance required.

*   **Display (lg/md):** Used for high-impact welcome screens or achievement milestones. Set with `-0.02em` letter spacing to feel "locked in" and authoritative.
*   **Headline (sm/md):** Your primary navigational anchors. Use `on_surface` (#1c1c19) to maintain high contrast.
*   **Body (lg):** The workhorse for study material. We prioritize line height (set to 1.6x) to ensure the "Sanctuary" vibe isn't ruined by cramped text.
*   **Label (md/sm):** Used for metadata (e.g., "Reading Time: 5 mins"). These should use `on_secondary_container` (#556664) to recede visually, allowing the headlines to lead the eye.

---

## 4. Elevation & Depth
In this system, depth is a whisper, not a shout.

*   **The Layering Principle:** Avoid shadows for static cards. Instead, place a `surface_container_lowest` card on top of a `surface_container_low` background. The subtle shift from beige to white creates a natural, "physical" lift.
*   **Ambient Shadows:** For floating elements (Modals/Dropdowns), use a multi-layered shadow: `0 8px 32px rgba(28, 28, 25, 0.06)`. Note the use of `on_surface` (the slate color) for the shadow tint rather than pure black; this keeps the shadow "warm" and integrated.
*   **The "Ghost Border" Fallback:** If a divider is mandatory for accessibility, use `outline_variant` (#c0c8c6) at **15% opacity**. It should be barely felt, acting as a guide rather than a barrier.

---

## 5. Components

### Buttons & CTAs
*   **Primary:** Rounded `md` (0.75rem). Background is the Teal gradient. Text is `on_primary` (White).
*   **Secondary:** No background. Use a "Ghost Border" (15% opacity `outline`) and `primary` text.
*   **Tertiary:** Pure text with an underline that only appears on hover.

### Scholarly Cards
*   **Rule:** Forbid divider lines within cards. 
*   **Structure:** Use `spacing.4` (1.4rem) internal padding. Separate the title from the body using a background shift (e.g., a `surface_container_high` header strip) rather than a line.

### Input Fields
*   **Style:** `surface_container_lowest` background. 
*   **Focus State:** Instead of a heavy border, use a 2px `primary` bottom-border and a subtle `surface_tint` glow. This mimics the look of a premium notebook entry.

### Specialized Component: The Progress Parchment
*   A custom progress bar for course completion. Use `secondary_container` as the track and a `primary` teal fill. The edges must be `full` rounded to maintain the soft aesthetic.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical margins. A layout that is slightly "off-center" (e.g., a wide left margin for a headline) feels designed and editorial.
*   **Do** use `spacing.8` (2.75rem) between major content blocks to preserve the "Calm" vibe.
*   **Do** use `primary_fixed_dim` (#a1cfcb) for subtle highlights in text or icons to draw attention without breaking the serenity.

### Don’t
*   **Don’t** use 1px solid black or dark grey borders. They break the "Sanctuary" illusion and look "un-designed."
*   **Don’t** use pure white backgrounds for large sections; always lean toward the `surface` beige (#fcf9f4) to keep the experience warm.
*   **Don’t** use standard "vibrant" error reds. Use the `error` (#ba1a1a) token sparingly, ensuring it is always housed within an `error_container` to soften the visual alarm.