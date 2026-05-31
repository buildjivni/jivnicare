import React from "react";
import type { LogoProps } from "@/types";

export function Logo({ className = "h-8 md:h-10 w-auto", ...props }: LogoProps & React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img src="/logo.png" alt="JivniCare Logo" width={150} height={40} className={`${className} object-contain antialiased`} {...props} />
  );
}
