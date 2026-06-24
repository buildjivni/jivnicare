export function Logo({ 
  size = 40, 
  variant = "full", 
  className 
}: { 
  size?: number; 
  variant?: "full" | "primary" | "wordmark" | "icon" | "circle"; 
  className?: string;
}) {
  if (variant === "primary") {
    return (
      <div 
        className={className} 
        style={{ width: size * 2.5, height: size }} 
      />
    );
  }

  if (variant === "wordmark") {
    return (
      <div 
        className={className} 
        style={{ width: size * 1.5, height: size }} 
      />
    );
  }

  if (variant === "icon" || variant === "circle") {
    return (
      <div 
        className={className} 
        style={{ width: size, height: size }} 
      />
    );
  }

  // default variant = "full"
  return (
    <div 
      className={`flex items-center ${className || ''}`}
      style={{ height: size }}
    >
      <div style={{ width: size * 3.5, height: size }} />
    </div>
  );
}
