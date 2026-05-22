import { ShieldCheck, Lock, Activity } from "lucide-react";
import { cn } from "@/lib/utils/utils";

type TrustBadgeType = "verified" | "secure" | "privacy" | "live";

interface TrustBadgeProps {
  type: TrustBadgeType;
  className?: string;
  text?: string;
}

export function TrustBadge({ type, className, text }: TrustBadgeProps) {
  const config = {
    verified: {
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      defaultText: "Verified Medical Professional",
      classes: "bg-secondary/10 text-secondary border-secondary/20",
    },
    secure: {
      icon: <Lock className="w-3.5 h-3.5" />,
      defaultText: "Secure Appointment",
      classes: "bg-slate-100 text-slate-700 border-slate-200",
    },
    privacy: {
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      defaultText: "100% Private",
      classes: "bg-primary/10 text-primary border-primary/20",
    },
    live: {
      icon: <Activity className="w-3.5 h-3.5" />,
      defaultText: "Live Updates",
      classes: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    },
  };

  const { icon, defaultText, classes } = config[type];

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[0.7rem] font-semibold tracking-wide uppercase whitespace-nowrap", classes, className)}>
      {icon}
      <span>{text || defaultText}</span>
    </div>
  );
}
