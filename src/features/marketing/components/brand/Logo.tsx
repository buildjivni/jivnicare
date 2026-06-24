import React from "react";

export function Logo({ 
  size = 40, 
  variant = "full", 
  className 
}: { 
  size?: number; 
  variant?: "full" | "primary" | "wordmark" | "icon" | "circle"; 
  className?: string;
}) {
  if (variant === "wordmark") {
    return (
      <span className={`font-black tracking-tight ${className || ""}`}>
        <span className="text-[#205E98]">Jivni</span>
        <span className="text-[#4A8C4A]">Care</span>
      </span>
    );
  }

  // Otherwise return the premium SVG icon
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={!className ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="logoBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A90D9" />
          <stop offset="100%" stopColor="#205E98" />
        </linearGradient>
        <linearGradient id="logoGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8ED98E" />
          <stop offset="100%" stopColor="#4A8C4A" />
        </linearGradient>
      </defs>
      {/* Background Rounded Shield/Square */}
      <rect x="2" y="2" width="96" height="96" rx="28" fill="url(#logoBlue)" />
      
      {/* White Medical Cross */}
      <rect x="42" y="22" width="16" height="56" rx="8" fill="white" />
      <rect x="22" y="42" width="56" height="16" rx="8" fill="white" />
      
      {/* Overlapping Leaf/Heart accent on the top right */}
      <path
        d="M55 25 C75 25, 78 40, 55 65 C45 55, 48 30, 55 25 Z"
        fill="url(#logoGreen)"
        opacity="0.9"
      />
    </svg>
  );
}

