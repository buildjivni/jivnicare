import React from "react";
import { BRAND_ASSETS } from "./brandAssets";
import { cn } from "@/lib/utils/utils";

export interface LogoProps {
  variant?: "primary" | "white" | "black" | "footer";
  className?: string;
  alt?: string;
  ariaHidden?: boolean;
  style?: React.CSSProperties;
}

export function Logo({
  variant = "primary",
  className,
  alt = "JivniCare Logo",
  ariaHidden,
  style
}: LogoProps) {
  const src = BRAND_ASSETS.logo[variant];
  return (
    <img
      src={src}
      alt={ariaHidden ? "" : alt}
      className={cn("h-full w-auto object-contain", className)}
      aria-hidden={ariaHidden ? "true" : undefined}
      style={style}
    />
  );
}
