"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

interface GlobalBrandHeaderProps {
  className?: string;
  subtitle?: string;
  tagline?: string;
  rightElement?: React.ReactNode;
}

export function GlobalBrandHeader({
  className,
  subtitle = "Bihar",
  tagline,
  rightElement
}: GlobalBrandHeaderProps) {
  return (
    <header
      className={cn(
        "w-full bg-white border-b border-slate-100 h-20 transition-all duration-300 z-50 sticky top-0 flex items-center select-none backdrop-blur-md bg-white/95",
        className
      )}
    >
      <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between gap-4 max-w-7xl w-full box-border">
        {/* Brand Group */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 md:gap-3.5 group shrink min-w-0">
            <Logo className="h-11 md:h-14 w-auto shrink-0 transition-transform duration-300 group-hover:scale-[1.01]" />
            <div className="flex flex-col -space-y-0.5 md:-space-y-1 pt-0.5">
              <span className="text-[20px] md:text-2xl font-bold tracking-tight leading-none text-slate-800">
                <span className="text-[#5298D2]">Jivni</span>
                <span className="text-[#489C66]">Care</span>
              </span>
              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] pl-0.5 mt-0.5">
                {subtitle}
              </span>
            </div>
          </Link>
          
          {tagline && (
            <>
              <div className="h-8 w-[1px] bg-slate-200 hidden sm:block mx-1" />
              <div className="hidden sm:flex flex-col justify-center">
                <span className="text-xs font-bold text-slate-700 leading-none">{tagline}</span>
                <span className="text-[9px] font-bold text-[#489C66] uppercase tracking-wider mt-0.5">Professional Network</span>
              </div>
            </>
          )}
        </div>

        {/* Right element (navigation actions, logout button, etc.) */}
        {rightElement && (
          <div className="flex items-center justify-end gap-2 shrink-0">
            {rightElement}
          </div>
        )}
      </div>
    </header>
  );
}
