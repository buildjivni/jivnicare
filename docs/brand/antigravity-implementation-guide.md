# JivniCare Brand System Implementation Guide

Version: 1.0

This document defines the mandatory implementation workflow for all branding work inside the JivniCare project.

Every developer, AI agent, automation system, and implementation workflow must follow this guide.

Failure to follow these rules is considered an implementation error.

---

# Mission

The objective is not to place logos.

The objective is to implement a consistent brand identity across the entire JivniCare ecosystem.

Branding is functional.

Branding is never decoration.

---

# Source of Truth

Always read these files before implementing anything.

1.

README.md

↓

2.

brand-assets.json

↓

3.

brand-rules.md

↓

4.

component-brand-mapping.md

↓

5.

This document

Never skip this order.

---

# Before Writing Code

Before modifying any UI,

perform a complete branding audit.

For every page answer:

Which official asset is required?

Why is it required?

Is branding necessary?

If branding is unnecessary,

do not add branding.

---

# Implementation Order

Step 1

Read all Brand Documentation.

↓

Step 2

Audit current UI.

↓

Step 3

Identify branding mistakes.

↓

Step 4

Create implementation plan.

↓

Step 5

Implement.

↓

Step 6

Run self audit.

↓

Step 7

Run responsive audit.

↓

Step 8

Run accessibility audit.

↓

Step 9

Final review.

↓

Step 10

Commit.

Never skip steps.

---

# Branding Decision Process

For every component ask:

Is branding required?

↓

YES

↓

Check component-brand-mapping.md

↓

Use the official asset.

↓

Do not substitute another asset.

If the component does not exist,

STOP.

Update the Brand System first.

Never guess.

---

# Asset Selection Rules

Primary Logo

Use only for

Navigation

Authentication

Official Branding

Documents

Emails

Footer

Header

--------------------------------

Brand Icon

Use only for

Loader

Collapsed Sidebar

Avatar

Empty State

Success State

--------------------------------

Wordmark

Use only when text-only branding is required.

--------------------------------

App Icon

Use only for

PWA

Android

iOS

Desktop Shortcut

Never use App Icon inside website UI.

--------------------------------

Favicon

Use only inside browser tabs.

Never use favicon inside UI.

---

# App Icon Rules

The supplied App Icon is the master artwork.

Adjust only

Safe Padding

Export Size

Platform Requirements

Never

Redraw

Crop

Stretch

Recolor

Modify

The artwork itself.

---

# Favicon Rules

The supplied favicon artwork is the master artwork.

Only optimise

16 px

32 px

48 px

64 px

Never redraw the logo.

---

# Layout Rules

Create the layout around the logo.

Never resize the logo because the layout is wrong.

Fix the layout.

Not the logo.

---

# Empty Space Rule

Empty space is allowed.

Never place branding just because there is empty space.

Branding must always have purpose.

---

# Duplication Rules

Maximum

One branding element per logical section.

Maximum

One primary logo per viewport.

Never display

Primary Logo

+

Brand Icon

inside the same branding section.

The logo already contains the icon.

---

# Shape Rules

Horizontal Area

↓

Primary Logo

Circle

↓

Brand Icon

Rounded Square

↓

App Icon

Very Small

↓

Favicon

Never violate these mappings.

---

# Color Rules

Only use

Primary Blue

#5696C7

Primary Green

#529C60

Never recolor assets.

Never sample colors from PNGs.

Always use official values.

---

# Image Rules

Always use SVG.

PNG only when SVG is unsupported.

Never use

Screenshots

Preview Images

PDF Images

Documentation Images

AI Generated Preview Posters

Only official assets inside

/docs/brand/

may be used.

---

# Responsive Rules

Desktop

Primary Logo

Tablet

Primary Logo

Mobile

Primary Logo

Collapsed Navigation

Brand Icon

Never create different logo layouts for different breakpoints.

---

# Accessibility

Logos must remain sharp.

Maintain aspect ratio.

Do not blur.

Do not compress.

Do not distort.

Maintain sufficient contrast.

---

# Self Audit

Before finishing every page verify:

✓ Correct Asset

✓ Correct Placement

✓ Correct Shape

✓ Correct Size

✓ Correct Padding

✓ Correct Margin

✓ Correct Alignment

✓ Correct Color

✓ Correct SVG

✓ No Duplication

✓ Responsive

✓ Accessible

If any item fails,

implementation is incomplete.

---

# Global Restrictions

Never create new logo variations.

Never create decorative branding.

Never use branding as filler.

Never use screenshots.

Never stretch logos.

Never rotate logos.

Never add glow.

Never add shadows.

Never add outlines.

Never add filters.

Never modify opacity.

Never modify proportions.

Never recreate logos using AI.

Never guess branding placement.

---

# Approval Rules

Every branding decision must answer:

Why is branding here?

Why is this asset selected?

Which Brand Rule allows it?

If these questions cannot be answered,

remove the branding.

---

# Final Principle

Consistency is more important than creativity.

Less branding is better branding.

When uncertain,

use less branding,

not more.

The JivniCare Brand System always overrides personal design preferences.

Guessing is prohibited.

Documentation is mandatory.