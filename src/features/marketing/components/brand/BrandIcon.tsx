import React from "react";
import { BRAND_ASSETS } from "./brandAssets";

export interface BrandIconProps {
  variant?: "default" | "white" | "black";
  className?: string;
  alt?: string;
  ariaHidden?: boolean;
}

export function BrandIcon({
  variant = "default",
  className,
  alt = "JivniCare Brand Icon",
  ariaHidden
}: BrandIconProps) {
  const src = BRAND_ASSETS.icon[variant];
  return (
    <img
      src={src}
      alt={ariaHidden ? "" : alt}
      className={className}
      aria-hidden={ariaHidden ? "true" : undefined}
      style={{
        maxHeight: "100%",
        maxWidth: "100%",
        height: "auto",
        width: "auto"
      }}
    />
  );
}
