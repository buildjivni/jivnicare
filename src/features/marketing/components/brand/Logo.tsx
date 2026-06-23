import Image from 'next/image'

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
      <div className={`flex items-center gap-2 ${className || ''}`}>
        <Image
          src="/brand/logo-horizontal-wordmark.png"
          alt="JivniCare"
          width={size * 2.5}
          height={size}
          className="object-contain"
        />
      </div>
    )
  }

  if (variant === "wordmark") {
    return (
      <span className={`font-bold tracking-tight text-slate-900 ${className || ''}`}>
        <span style={{ color: '#4A90D9' }}>Jivni</span>
        <span style={{ color: '#4A8C4A' }}>Care</span>
      </span>
    )
  }

  if (variant === "icon" || variant === "circle") {
    const src = variant === "circle" ? "/brand/logo-icon-circle.png" : "/brand/logo-icon-master.png";
    return (
      <Image
        src={src}
        alt="JivniCare"
        width={size}
        height={size}
        className={`object-contain ${className || ''}`}
        style={{ background: 'transparent' }}
      />
    )
  }

  // default variant = "full" (original behavior)
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Image
        src="/brand/logo-icon-circle.png"
        alt="JivniCare"
        width={size}
        height={size}
        className="object-contain"
        style={{ background: 'transparent' }}
      />
      <div className="flex flex-col leading-none">
        <span className="font-bold text-lg">
          <span style={{color: '#4A90D9'}}>Jivni</span>
          <span style={{color: '#4A8C4A'}}>Care</span>
        </span>
        <span className="text-xs text-slate-400 tracking-widest uppercase">Bihar</span>
      </div>
    </div>
  )
}
