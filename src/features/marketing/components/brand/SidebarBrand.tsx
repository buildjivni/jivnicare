import React from "react";
import { Logo } from "./Logo";
import { BrandIcon } from "./BrandIcon";

export interface SidebarBrandProps {
  expanded: boolean;
  className?: string;
  logoClassName?: string;
  iconClassName?: string;
}

export function SidebarBrand({
  expanded,
  className,
  logoClassName,
  iconClassName
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
