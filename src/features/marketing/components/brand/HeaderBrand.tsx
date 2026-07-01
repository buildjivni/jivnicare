import React from "react";
import { BrandLink } from "./BrandLink";

export interface HeaderBrandProps {
  className?: string;
  logoClassName?: string;
}

export function HeaderBrand({ className, logoClassName }: HeaderBrandProps) {
  return (
    <BrandLink
      variant="primary"
      className={className}
      logoClassName={logoClassName}
      ariaLabel="Go to JivniCare homepage"
    />
  );
}
