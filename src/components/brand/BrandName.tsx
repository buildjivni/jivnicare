import React from "react";
import { cn } from "@/lib/utils";

interface BrandNameProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  withIcon?: boolean;
}

const sizeMap = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl md:text-5xl",
};

export function BrandName({ className, size = "md", withIcon = false }: BrandNameProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {withIcon && (
        <img src="/logo.png" alt="" className="h-[1.2em] w-auto object-contain" />
      )}
      <span className={cn("font-black tracking-tight", sizeMap[size])}>
        <span className="text-primary">Jivni</span>
        <span className="text-secondary">Care</span>
      </span>
    </div>
  );
}
