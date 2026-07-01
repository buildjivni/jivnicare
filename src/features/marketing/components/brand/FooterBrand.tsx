import React from "react";
import { BrandLink } from "./BrandLink";

export interface FooterBrandProps {
  className?: string;
  logoClassName?: string;
}

export function FooterBrand({ className, logoClassName }: FooterBrandProps) {
  return (
    <BrandLink
      variant="footer"
      className={className}
      logoClassName={logoClassName}
      ariaLabel="Go to JivniCare homepage"
    />
  );
}
