import React from "react";
import { BRAND_ASSETS } from "./brandAssets";
import { cn } from "@/lib/utils/utils";

export interface BrandIconProps {
  variant?: "default" | "white" | "black";
  className?: string;
  alt?: string;
  ariaHidden?: boolean;
  style?: React.CSSProperties;
}

export function BrandIcon({
  variant = "default",
  className,
  alt = "JivniCare Brand Icon",
  ariaHidden,
  style
}: BrandIconProps) {
  const src = BRAND_ASSETS.icon[variant];
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
