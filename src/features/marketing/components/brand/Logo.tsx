import React from "react";

export function Logo({ 
  size = 40, 
  variant = "full", 
  className,
  src
}: { 
  size?: number; 
  variant?: "full" | "primary" | "wordmark" | "icon" | "circle"; 
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

  if (variant === "wordmark") {
    return (
      <img
        src="/brand/logo-horizontal-wordmark.png"
        alt="JivniCare"
        className={className}
        style={!className ? { height: size, width: "auto" } : undefined}
      />
    );
  }

  if (variant === "icon") {
    return (
      <img
        src="/brand/logo-icon-master-transparent.png"
        alt="JivniCare Icon"
        className={className}
        style={!className ? { height: size, width: size } : undefined}
      />
    );
  }

  if (variant === "circle") {
    return (
      <div 
        className="rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100"
        style={{ width: size, height: size }}
      >
        <img
          src="/brand/logo-icon-master-transparent.png"
          alt="JivniCare Icon"
          className="object-contain"
          style={{ height: size * 0.7, width: size * 0.7 }}
        />
      </div>
    );
  }

  // Default / variant === "full" / variant === "primary"
  // This renders the horizontal icon + text combined logo provided by the client.
  return (
    <img
      src="/brand/logo-full.png"
      alt="JivniCare Logo"
      className={className}
      style={!className ? { height: size, width: "auto" } : undefined}
    />
  );
}
