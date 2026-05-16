import { cn } from "@/lib/utils";

interface BrandNameProps {
  className?: string;
  withTagline?: boolean;
}

export function BrandName({ className, withTagline = false }: BrandNameProps) {
  if (withTagline) {
    return (
      <div className={cn("inline-flex flex-col leading-none", className)}>
        <span className="font-black tracking-[-0.03em] font-sans text-2xl">
          <span className="text-slate-900">Jivni</span><span className="text-emerald-600">Care</span>
        </span>
        <span className="text-[0.35em] font-black text-slate-400 text-right pr-[0.1em] pt-[0.2em] tracking-[0.2em] uppercase">
          Unified Healthcare
        </span>
      </div>
    );
  }

  return (
    <span className={cn("font-black tracking-[-0.03em] font-sans", className)}>
      <span className="text-slate-900">Jivni</span><span className="text-emerald-600">Care</span>
    </span>
  );
}
