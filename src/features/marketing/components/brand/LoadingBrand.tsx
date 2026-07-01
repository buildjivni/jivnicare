import React from "react";
import { BrandIcon } from "./BrandIcon";
import { BRAND_SIZES } from "./brandSizes";

export interface LoadingBrandProps {
  className?: string;
  iconClassName?: string;
}

export function LoadingBrand({
  className,
  iconClassName = BRAND_SIZES.loading.icon
}: LoadingBrandProps) {
  return (
    <div className={`flex items-center justify-center ${className || ""}`}>
      <BrandIcon variant="default" className={iconClassName} />
    </div>
  );
}
