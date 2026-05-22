"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface AuthHeaderProps {
  /** Compact mode for inline display within cards */
  variant?: "default" | "compact";
  /** Additional className */
  className?: string;
}

/**
 * Unified brand header for all authentication screens.
 * Provides consistent logo, typography, and spacing across the auth flow.
 */
export function AuthHeader({ variant = "default", className = "" }: AuthHeaderProps) {
  const isCompact = variant === "compact";

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex flex-col items-center ${className}`}
    >
      <Link
        href="/"
        className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
        aria-label="JivniCare - Go to homepage"
      >
        {/* Logo container with consistent sizing */}
        <div
          className={`
            bg-white rounded-xl flex items-center justify-center shadow-md shadow-slate-200/60
            group-hover:shadow-lg group-hover:scale-[1.02] transition-all duration-200
            ${isCompact ? "w-10 h-10" : "w-11 h-11"}
          `}
        >
          <img
            src="/logo.png"
            alt=""
            className={`object-contain ${isCompact ? "w-6 h-6" : "w-7 h-7"}`}
            aria-hidden="true"
          />
        </div>

        {/* Brand name with tagline */}
        <div className="flex flex-col">
          <span
            className={`
              font-bold text-slate-900 leading-none tracking-tight
              ${isCompact ? "text-lg" : "text-xl"}
            `}
          >
            JivniCare
          </span>
          <span
            className={`
              font-medium text-slate-400 uppercase tracking-widest
              ${isCompact ? "text-[9px] mt-0.5" : "text-[10px] mt-1"}
            `}
          >
            Unified Health
          </span>
        </div>
      </Link>
    </motion.header>
  );
}

/**
 * Desktop sidebar brand header for split-screen layouts.
 * Features enhanced styling with white text on brand background.
 */
export function AuthSidebarBrand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-xl"
      aria-label="JivniCare - Go to homepage"
    >
      <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-105 transition-transform duration-200">
        <img
          src="/logo.png"
          alt=""
          className="w-7 h-7 object-contain"
          aria-hidden="true"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold text-white leading-none tracking-tight">
          JivniCare
        </span>
        <span className="text-[10px] font-medium text-blue-200 uppercase tracking-widest mt-0.5">
          Unified Health
        </span>
      </div>
    </Link>
  );
}
