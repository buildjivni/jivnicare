import { ShieldCheck, Star, Users, Activity } from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface OperationalProofProps {
  className?: string;
}

export function OperationalProof({ className }: OperationalProofProps) {
  return (
    <div className={cn("w-full bg-white/80 backdrop-blur-md border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-secondary" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold text-foreground">100% Verified Medical Staff</span>
          <span className="text-xs text-muted-foreground font-medium">Strict multi-step verification process</span>
        </div>
      </div>
      
      <div className="hidden sm:block w-px h-10 bg-border" />
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold text-foreground">Live OPD Tracking</span>
          <span className="text-xs text-muted-foreground font-medium">Zero waiting room anxiety</span>
        </div>
      </div>

      <div className="hidden sm:block w-px h-10 bg-border" />
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
          <Star className="w-5 h-5 text-amber-500 fill-current" />
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-foreground">4.9/5 Rating</span>
          </div>
          <span className="text-xs text-muted-foreground font-medium">From 15,000+ happy patients</span>
        </div>
      </div>
    </div>
  );
}
