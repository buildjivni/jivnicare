import React from "react";
import Image from "next/image";
import type { LogoProps } from "@/types";

export function Logo({ className = "h-10 w-10", ...props }: LogoProps & React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <Image 
      src="/logo.png" 
      alt="JivniCare Logo" 
      width={512} 
      height={512} 
      className={`object-contain antialiased shrink-0 ${className}`}
      {...(props as any)} 
    />
  );
}
