import React from "react";
import { Logo } from "./Logo";
import { BrandIcon } from "./BrandIcon";
import { BRAND_SIZES } from "./brandSizes";

export interface SidebarBrandProps {
  expanded: boolean;
  className?: string;
  logoClassName?: string;
  iconClassName?: string;
}

export function SidebarBrand({
  expanded,
  className,
  logoClassName = BRAND_SIZES.sidebar.desktop,
  iconClassName = BRAND_SIZES.sidebar.mobile
}: SidebarBrandProps) {
  return (
    <div className={`flex items-center justify-between ${className || ""}`}>
      {expanded ? (
        <Logo variant="primary" className={logoClassName} />
      ) : (
        <BrandIcon variant="default" className={iconClassName} />
      )}
    </div>
  );
}
