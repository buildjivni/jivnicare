# JivniCare Brand Rules

**Version:** 1.0  
This document defines the mandatory design constraints and rendering rules for the JivniCare brand. All designers, developers, and implementation systems must follow these rules without exception.

---

## 1. Core Principles

*   **Golden Rule:** Branding is functional, not decorative. Every logo or icon placement must have a clear identity or navigational purpose. Never place branding merely to fill empty space; empty space must remain empty.
*   **Consistency Over Creativity:** The JivniCare Brand System always overrides personal design preferences. Guessing or making ad-hoc variations is strictly prohibited.

---

## 2. Color Rules

*   **Official Palette:** Use only the official brand colors:
    *   Primary Blue: `#5696C7`
    *   Primary Green: `#529C60`
    *   White: `#FFFFFF`
    *   Black: `#000000`
*   **Prohibition:** Never sample colors from rasterized images. Never modify, recolor, or change the opacity of the brand colors.

---

## 3. Asset Integrity & Rendering Rules

*   **Master Asset Rule:** SVG (Scalable Vector Graphics) is the only master source of truth. All platform-specific PNG assets must be programmatically generated from the master SVG to maintain vector sharpness.
*   **Safe Scaling Rule:** When scaling assets, aspect ratios must be strictly locked. Safe padding defined within the master assets must be preserved. Never stretch, squish, crop, rotate, skew, or distort the logos.
*   **Export Rule:** Platform-specific PNGs must only be exported directly from the approved master SVGs.
*   **No Placeholders Rule:** Do not use temporary or placeholder logos in any public or staging builds.
*   **No Artificial Container Rule:** Do not enclose logos or brand icons in artificial boundaries (such as custom borders, shadowed boxes, or circular wraps) unless explicitly specified in the component mapping.
*   **Prohibited Effects:** Never apply shadows, outlines, glow, filters, or opacity modifiers to any logo or icon.

---

## 4. Layout & Positioning Rules

*   **Asset-Driven Layout Rule:** The layout must adapt to the official brand assets. Never resize or distort the logo to fit a poorly designed layout container; fix the container dimensions to accommodate the logo's native aspect ratio.
*   **Dynamic Layout Rule:** Layouts containing brand assets must scale elegantly and dynamically across mobile, tablet, and desktop viewports, maintaining proper margins and alignment without breaking the branding elements.
*   **Duplication Restriction:** Maximum of one branding element per logical section and one primary logo per viewport. Never display the Primary Logo and the Brand Icon together in the same logical container.

---

## 5. Specific Component Applications

*   **Footer Branding Rule:** The website footer must render the Primary Logo on the official footer background color (`#5696C7`).
*   **Approved App Icon Safe Area:** All app icons must use **Variation 10** (which enforces an 11% safe padding margin inside the master `10.svg`) to prevent clipping during platform-specific cropping (circle, squircle, or rounded square).