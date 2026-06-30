import React from "react";

export type LogoVariant = 
  | "full" 
  | "primary" 
  | "primary-white" 
  | "primary-black" 
  | "primary-vertical"
  | "wordmark" 
  | "icon" 
  | "icon-white" 
  | "icon-black"
  | "circle";

export function Logo({ 
  size = 40, 
  variant = "full", 
  className,
  src
}: { 
  size?: number; 
  variant?: LogoVariant; 
  className?: string;
  src?: string;
}) {
  // If an external src is provided explicitly, render it directly
  if (src) {
    return (
      <img
        src={src}
        alt="JivniCare Logo"
        className={className}
        style={!className ? { height: size, width: "auto" } : undefined}
      />
    );
  }

  // 1. Wordmark variant
  if (variant === "wordmark") {
    return (
      <img
        src="/brand/wordmark.svg"
        alt="JivniCare"
        className={className}
        style={!className ? { height: size, width: "auto" } : undefined}
      />
    );
  }

  // 2. Icon variants
  if (variant === "icon") {
    return (
      <img
        src="/brand/brand-icon.svg"
        alt="JivniCare Icon"
        className={className}
        style={!className ? { height: size, width: size } : undefined}
      />
    );
  }

  if (variant === "icon-white") {
    return (
      <img
        src="/brand/brand-icon-white.svg"
        alt="JivniCare Icon"
        className={className}
        style={!className ? { height: size, width: size } : undefined}
      />
    );
  }

  if (variant === "icon-black") {
    return (
      <img
        src="/brand/brand-icon-black.svg"
        alt="JivniCare Icon"
        className={className}
        style={!className ? { height: size, width: size } : undefined}
      />
    );
  }

  // 3. Circle wrapper variant (Legacy support, using brand-icon)
  if (variant === "circle") {
    return (
      <div 
        className="rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100"
        style={{ width: size, height: size }}
      >
        <img
          src="/brand/brand-icon.svg"
          alt="JivniCare Icon"
          className="object-contain"
          style={{ height: size * 0.7, width: size * 0.7 }}
        />
      </div>
    );
  }

  // 4. Primary Logo variants
  let logoSrc = "/brand/primary-logo.svg";
  if (variant === "primary-white") {
    logoSrc = "/brand/primary-logo-white.svg";
  } else if (variant === "primary-black") {
    logoSrc = "/brand/primary-logo-black.svg";
  } else if (variant === "primary-vertical") {
    logoSrc = "/brand/primary-logo-vertical.svg";
  }

  // Default / variant === "full" / variant === "primary"
  return (
    <img
      src={logoSrc}
      alt="JivniCare Logo"
      className={className}
      style={!className ? { height: size, width: "auto" } : undefined}
    />
  );
}

