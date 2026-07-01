# JivniCare Brand System

**Version:** 1.0  
This directory is the single source of truth for all official JivniCare brand assets. All designers, developers, AI agents, and automated build systems must use only the assets and rules defined in this directory.

---

## Official Brand Colors

These are the only approved colors for the JivniCare brand. Never sample colors from images, and always use these exact hex values:

*   **Primary Blue:** `#5696C7` (Used for primary actions, headers, and official branding highlights)
*   **Primary Green:** `#529C60` (Used for secondary actions, trust badges, and health-related highlights)
*   **White:** `#FFFFFF` (Used for backgrounds, text on dark backgrounds, and white logo variants)
*   **Black:** `#000000` (Reserved for high-contrast text and monochrome print/documents)

---

## Brand Asset Directory Structure

*   `primary-logo/` - Horizontal and vertical JivniCare logos.
*   `brand-icon/` - Standalone logo icon without text.
*   `wordmark/` - Text-only branding wordmark.
*   `app-icon/` - Contains master app icon SVGs (app-icon-master.svg is the approved safe-area design).
*   `favicon/` - Master favicon SVG and PNG files.
*   `examples/` - Reference materials showing approved layout compositions.

---

## Master SVG Source of Truth

To maintain vector sharpness and design integrity, all branding assets use **SVG (Scalable Vector Graphics)** as their source of truth:

1.  **App Icon Master:** The file [app-icon-master.svg](file:///c:/Users/dharm/Downloads/antigravity/docs/brand/app-icon/app-icon-master.svg) (Variation 10 safe-area configuration) is the approved master source asset.
2.  **Favicon Master:** The file [favicon.svg](file:///c:/Users/dharm/Downloads/antigravity/docs/brand/favicon/favicon.svg) is the approved master source asset.

> [!IMPORTANT]
> All platform-specific PNG assets (e.g., specific favicon sizes or mobile launcher sizes) must be programmatically generated from these master SVG files during implementation. Do not manually edit or redraw PNG assets.