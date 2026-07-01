import React from "react";
import { BRAND_ASSETS } from "./brandAssets";
import { cn } from "@/lib/utils/utils";

export interface WordmarkProps {
  className?: string;
  alt?: string;
  ariaHidden?: boolean;
  style?: React.CSSProperties;
}

export function Wordmark({
  className,
  alt = "JivniCare Wordmark",
  ariaHidden,
  style
}: WordmarkProps) {
  const src = BRAND_ASSETS.wordmark.default;
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
