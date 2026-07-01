import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";

export interface BrandLinkProps {
  variant?: "primary" | "white" | "black" | "footer";
  className?: string;
  logoClassName?: string;
  ariaLabel?: string;
}

export function BrandLink({
  variant = "primary",
  className,
  logoClassName,
  ariaLabel = "Go to JivniCare homepage"
}: BrandLinkProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center justify-center overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 rounded-xl transition-all ${className || ""}`}
      aria-label={ariaLabel}
    >
      <Logo variant={variant} className={logoClassName} ariaHidden={true} />
    </Link>
  );
}
