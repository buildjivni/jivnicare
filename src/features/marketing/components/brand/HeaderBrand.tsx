import React from "react";
import { BrandLink } from "./BrandLink";
import { BRAND_SIZES } from "./brandSizes";

export interface HeaderBrandProps {
  className?: string;
  logoClassName?: string;
}

export function HeaderBrand({ className, logoClassName }: HeaderBrandProps) {
  return (
    <BrandLink
      variant="primary"
      className={`${className || ""} ${BRAND_SIZES.header.mobile} ${BRAND_SIZES.header.desktop}`}
      logoClassName={`${logoClassName || ""} ${BRAND_SIZES.header.mobile} ${BRAND_SIZES.header.desktop}`}
      ariaLabel="Go to JivniCare homepage"
    />
  );
}
