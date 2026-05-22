"use client";

import { isPilotOtpModeClient } from "@/lib/infrastructure/env";

export function PilotModeBadge() {
  if (!isPilotOtpModeClient()) return null;

  return (
    <div
      className="fixed top-3 right-3 z-[100] px-3 py-1.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg border border-amber-600"
      role="status"
    >
      Pilot Test Mode
    </div>
  );
}
