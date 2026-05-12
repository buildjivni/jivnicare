// =============================================================
//  JivniCare — Centralized Framer Motion Animation Variants
//  All reusable animation configs live here.
//  Import from "@/animations/variants" across the entire project.
// =============================================================

import type { Variants } from "framer-motion";

// ── Fade & Slide ──────────────────────────────────────────────

/** Fade up from below — general purpose */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/** Fade in from the left */
export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

/** Fade in from the right */
export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

/** Simple opacity fade */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};

// ── Card / Item Variants (Spring) ─────────────────────────────

/** Spring-based item for list items and cards */
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } },
};

/** Subtle scale-up on appear */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

// ── Container / Stagger Parents ───────────────────────────────

/** Stagger children with a 0.08s delay — tight grid layouts */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

/** Stagger children with a 0.12s delay — looser section layouts */
export const staggerContainerSlow: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
