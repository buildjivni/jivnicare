import React from "react";
import { BrandIcon } from "./BrandIcon";
import { Wordmark } from "./Wordmark";

export interface AuthBrandProps {
  children?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  wordmarkClassName?: string;
}

export function AuthBrand({
  children,
  className,
  iconClassName,
  wordmarkClassName
}: AuthBrandProps) {
  return (
    <div className={`flex flex-col items-center gap-2 mb-6 group ${className || ""}`}>
      <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
        <BrandIcon variant="default" className={iconClassName} ariaHidden={true} />
      </div>
      <Wordmark className={wordmarkClassName} ariaHidden={true} />
      {children}
    </div>
  );
}
