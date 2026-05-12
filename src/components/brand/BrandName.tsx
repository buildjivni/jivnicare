import { cn } from "@/lib/utils";

interface BrandNameProps {
  className?: string;
  withTagline?: boolean;
}

export function BrandName({ className, withTagline = false }: BrandNameProps) {
  if (withTagline) {
    return (
      <div className={cn("inline-flex flex-col leading-none", className)}>
        <span className="font-extrabold tracking-[-0.02em] font-sans">
          <span className="text-[#539FD1]">Jivni</span><span className="text-[#59A869]">Care</span>
        </span>
        <span className="text-[0.4em] font-bold text-slate-800 text-right pr-[0.1em] pt-[0.1em] tracking-tight">
          Care, On Your Time
        </span>
      </div>
    );
  }

  return (
    <span className={cn("font-extrabold tracking-[-0.02em] font-sans", className)}>
      <span className="text-[#539FD1]">Jivni</span><span className="text-[#59A869]">Care</span>
    </span>
  );
}
