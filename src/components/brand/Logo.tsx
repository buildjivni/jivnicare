import React from "react";
import type { LogoProps } from "@/types";

export function Logo({ className = "w-12 h-12", ...props }: LogoProps & React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img src="/logo.png" alt="JivniCare Logo" className={`${className} object-contain`} {...props} />
  );
}
