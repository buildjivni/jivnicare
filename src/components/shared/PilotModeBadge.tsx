"use client";

import { isTestOtpModeEnabled } from "@/lib/config/test-mode";

export function PilotModeBadge() {
  if (!isTestOtpModeEnabled()) return null;

  return (
    <div
      className="fixed top-3 right-3 z-[100] px-3 py-1.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg border border-amber-600"
      role="status"
    >
      Pilot Test Mode
    </div>
  );
}
