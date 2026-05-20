import React from "react";
import type { LogoProps } from "@/types";

export interface EnhancedLogoProps extends LogoProps, React.ImgHTMLAttributes<HTMLImageElement> {
  variant?: "full" | "icon";
}

export function Logo({ className = "h-8 md:h-10 w-auto", variant = "full", ...props }: EnhancedLogoProps) {
  const src = variant === "icon" ? "/icon-only.png" : "/logo.png";
  return (
    <img src={src} alt="JivniCare Logo" className={`${className} object-contain antialiased`} {...props} />
  );
}
