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
      className={`${className || ""} max-h-[32px] md:max-h-[40px]`}
      logoClassName={`${logoClassName || ""} max-h-[32px] md:max-h-[40px]`}
      ariaLabel="Go to JivniCare homepage"
    />
  );
}
