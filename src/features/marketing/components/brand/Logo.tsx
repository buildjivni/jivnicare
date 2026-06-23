import Image from 'next/image'

export function Logo({ size = 40, className }: { size?: number; className?: string }) {
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
