import React from "react";
import { BRAND_ASSETS } from "./brandAssets";

export interface LogoProps {
  variant?: "primary" | "white" | "black" | "footer";
  className?: string;
  alt?: string;
  ariaHidden?: boolean;
}

export function Logo({
  variant = "primary",
  className,
  alt = "JivniCare Logo",
  ariaHidden
}: LogoProps) {
  const src = BRAND_ASSETS.logo[variant];
  return (
    <img
      src={src}
      alt={ariaHidden ? "" : alt}
      className={className}
      aria-hidden={ariaHidden ? "true" : undefined}
      style={{
        height: "100%",
        width: "auto",
        objectFit: "contain"
      }}
    />
  );
}
