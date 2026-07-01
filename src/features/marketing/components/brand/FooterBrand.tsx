import React from "react";
import { BrandLink } from "./BrandLink";
import { BRAND_SIZES } from "./brandSizes";

export interface FooterBrandProps {
  className?: string;
  logoClassName?: string;
}

export function FooterBrand({ className, logoClassName }: FooterBrandProps) {
  return (
    <BrandLink
      variant="footer"
      className={className}
      logoClassName={`${logoClassName || ""} ${BRAND_SIZES.footer.logo}`}
      ariaLabel="Go to JivniCare homepage"
    />
  );
}
