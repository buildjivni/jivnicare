# Design System Specification: The Empathetic Interface

## 1. Overview & Creative North Star
**Creative North Star: "The Clinical Sanctuary"**

This design system rejects the cold, sterile, and overly complex nature of traditional healthcare software. Instead, it embraces a high-end editorial approach that prioritizes cognitive ease for users with low digital literacy. By blending the structured clarity of **Notion** with the fluid, premium motion of **Stripe**, we create a "Sanctuary"—a digital space that feels safe, stable, and incredibly easy to navigate.

To break the "template" look, we utilize **Intentional Asymmetry**. Larger-than-standard headings are paired with generous white space and off-center focal points, guiding the eye naturally through information without the clutter of traditional grids. We move away from "apps" and toward "experiences."

---

## 2. Colors & Tonal Depth
Our palette is rooted in medical trust but executed with high-fashion sophistication. 

### The Palette (Material Scale)
*   **Primary Focus:** `primary (#005da7)` and `primary_container (#0076d1)` are used to command attention.
*   **Surface Depth:** We utilize a range from `surface_container_lowest (#ffffff)` to `surface_dim (#d9dadb)` to create environmental hierarchy.
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Structural separation must be achieved through background shifts (e.g., a `surface_container_low` card resting on a `surface` background).
*   **The Glass & Gradient Rule:** To avoid a flat, "cheap" feel, use subtle gradients for primary actions, transitioning from `primary` to `primary_container`. For floating navigation or modals, employ **Glassmorphism**: use `surface` at 80% opacity with a `24px` backdrop blur to allow content to "bleed" through softly.

---

## 3. Typography: The Editorial Anchor
Typography is our primary tool for accessibility. We use a dual-typeface system to balance authority with approachability.

*   **Display & Headlines (Plus Jakarta Sans):** A high-character sans-serif used for headers. Its wide apertures ensure legibility even at large scales. Use `display-lg` (3.5rem) for welcoming users and `headline-md` (1.75rem) for section titles.
*   **Body & Labels (Lexend):** Designed specifically to reduce cognitive load and improve reading speed. Every piece of functional data—appointments, dosages, and instructions—must use `body-lg` (1rem) as the minimum size for readability.

**Hierarchy Strategy:** Use `on_surface_variant` for secondary labels to create a "recessed" information layer, keeping the most critical health data in high-contrast `on_surface`.

---

## 4. Elevation & Depth: Tonal Layering
We move beyond the "drop shadow" era into **Tonal Layering**. Depth is a physical property of the interface.

*   **The Layering Principle:** Stack surfaces to show importance. An intake form should be a `surface_container_lowest` (pure white) card sitting on a `surface_container_low` (light grey) background. This "lifts" the interactive area naturally.
*   **Ambient Shadows:** When a float is required (e.g., a floating action button), use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 93, 167, 0.06);`. The shadow color is a tinted version of our primary blue, not black, to simulate natural light.
*   **The Ghost Border Fallback:** If a container requires definition against a similar color, use a "Ghost Border": `outline_variant` at 15% opacity. It should be felt, not seen.

---

## 5. Component Logic

### Cards & Containers
*   **Radius:** Use `DEFAULT (1rem)` for standard cards and `lg (2rem)` for hero sections.
*   **Rule:** No dividers. Use `1.5rem` to `2rem` of vertical white space to separate content chunks.

### Buttons (The Interaction Points)
*   **Primary:** A subtle gradient from `primary` to `primary_container`. Large padding (`1.5rem` horizontal). Large rounded corners (`full`).
*   **Secondary:** `surface_container_high` background with `on_surface` text. No border.
*   **Tertiary:** Text only in `primary`, bold weight, with an icon for affordance.

### Input Fields
*   **Style:** Floated labels using `lexend`. The input container uses `surface_container_low`. On focus, the background shifts to `surface_container_lowest` with a `2px` `primary` "Ghost Border."
*   **Accessibility:** Click targets for inputs must be at least `56px` high to accommodate mobile-first motor-skill variances.

### Specialized Healthcare Components
*   **Progress Steppers:** Use large, `full` rounded chips. Completed stages should use `primary_container`, while the active stage pulses with a subtle `surface_tint`.
*   **Dose Cards:** High-contrast containers using `tertiary_container` for warnings/critical meds to ensure they are never missed.

---

## 6. Do’s and Don’ts

### Do:
*   **DO** use "Breathing Room." If you think there is enough margin, add 8px more.
*   **DO** use `surface_bright` for areas where the user needs to input data to create a "focus spotlight."
*   **DO** use iconography to support every text label for users with low literacy.

### Don’t:
*   **DON'T** use 1px black or dark grey lines. They create "visual noise" that confuses elderly or low-literacy users.
*   **DON'T** use font sizes smaller than `body-sm (0.75rem)` under any circumstances.
*   **DON'T** use pure black (`#000000`). Use `on_surface (#191c1d)` for a softer, more premium contrast.
*   **DON'T** crowd the screen. If a process has five steps, give each step its own screen. Mobility and simplicity over density.