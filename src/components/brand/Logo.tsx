import React from "react";
import type { LogoProps } from "@/types";

export function Logo({ className = "w-12 h-12", ...props }: LogoProps & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <circle cx="50" cy="22" r="11" fill="#539FD1" />
      <path d="M 46 95 C 10 80 10 45 25 35 C 32 30 40 38 38 45 C 32 60 38 80 46 95 Z" fill="#539FD1" />
      <path d="M 54 95 C 90 80 90 45 75 35 C 68 30 60 38 62 45 C 68 60 62 80 54 95 Z" fill="#59A869" />
    </svg>
  );
}
