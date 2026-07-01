# JivniCare Brand System Implementation Guide

**Version:** 1.0  
This document defines the mandatory implementation workflow and quality checklist for applying the JivniCare Brand System to the codebase.

---

## 1. Pre-Implementation Checklist
*   **Documentation Compliance:** Read and understand all Brand System documents (`README.md`, `brand-rules.md`, `component-brand-mapping.md`, and `brand-assets.json`) completely before editing any files.
*   **Scope Isolation:** During branding implementation, **do not change** application APIs, database schemas, business logic, responsive breakpoints, or unrelated UI functionality. Focus purely on styling corrections and asset mappings.

---

## 2. Brand Implementation Workflow

### Step 1: Programmatic Asset Generation
*   All platform-specific PNG assets (app icon sizes and favicons) must be programmatically generated from the approved master SVG assets:
    *   App Icon Master: `docs/brand/app-icon/10.svg` (Variation 10)
    *   Favicon Master: `docs/brand/favicon/brand-icon.svg`
*   Never manually edit, redraw, crop, zoom, or recreate PNG assets.

### Step 2: Container Cleanup & Prep
*   **Remove Placeholders:** Clean up and remove all legacy placeholder spacing, borders, background frames, and shadow containers from the targeting UI component before placing the official asset.
*   **Asset-Driven Structuring:** Build the layout container around the approved brand asset dimensions. Never fit or force an asset into an existing fixed-size container that distorts its aspect ratio.

### Step 3: Asset Placement & Alignment
*   Render the SVG directly in the page markup.
*   Preserve the native aspect ratio and center alignment.
*   Ensure the approved safe area padding of the master asset remains unclipped.

### Step 4: Verification & Audit
Prior to submitting branding modifications for approval, perform the following validation pass:
1.  **Visual Balance:** Verify padding and margin scales are consistent with the surrounding page.
2.  **Sufficient Contrast:** Ensure the logo variant (default, white, or black) matches the background contrast limits.
3.  **Responsiveness:** Test layout behavior on mobile, tablet, and desktop breakpoints.
4.  **Accessibility:** Ensure all images and inline SVGs have appropriate `alt` descriptions or `aria-label` tags.