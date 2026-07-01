import React from "react";
import { BRAND_ASSETS } from "./brandAssets";

export interface WordmarkProps {
  className?: string;
  alt?: string;
  ariaHidden?: boolean;
}

export function Wordmark({
  className,
  alt = "JivniCare Wordmark",
  ariaHidden
}: WordmarkProps) {
  const src = BRAND_ASSETS.wordmark.default;
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
