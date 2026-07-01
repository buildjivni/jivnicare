import React from "react";
import { BrandIcon } from "./BrandIcon";

export interface LoadingBrandProps {
  className?: string;
  iconClassName?: string;
}

export function LoadingBrand({ className, iconClassName }: LoadingBrandProps) {
  return (
    <div className={`flex items-center justify-center ${className || ""}`}>
      <BrandIcon variant="default" className={iconClassName} />
    </div>
  );
}
