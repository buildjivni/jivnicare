// =============================================================
//  JivniCare — Auth Layout
//  Clean, no-Header/Footer layout for login and OTP pages.
//  Provides a calm, trust-focused, minimal healthcare auth shell.
// =============================================================

import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In — JivniCare",
  description: "Sign in to access JivniCare — healthcare made simple for Bihar.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-br from-[#f0f5fb] via-white to-[#f0f9f5]">
      {/* Minimal Auth Header */}
      <header className="w-full px-4 py-4 flex items-center justify-between border-b border-slate-100/60 bg-white/70 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2" aria-label="JivniCare home">
          {/* Inline logo to avoid server/client mismatch in auth shell */}
          <div className="w-8 h-8 rounded-xl bg-[#205E98] flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-[#205E98] text-lg tracking-tight">JivniCare</span>
            <span className="text-[9px] text-slate-400 font-medium tracking-wider uppercase -mt-0.5">Care, On Your Time</span>
          </div>
        </Link>
        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:block">Secure</span>
        </div>
      </header>

      {/* Auth Content */}
      <main className="flex-1 flex flex-col items-center justify-start md:justify-center pt-8 md:pt-0 px-4 pb-8">
        {children}
      </main>

      {/* Auth Footer */}
      <footer className="px-4 py-4 text-center">
        <p className="text-xs text-slate-400">
          By continuing, you agree to JivniCare&apos;s{" "}
          <Link href="#" className="underline hover:text-slate-600 transition-colors">Terms</Link>
          {" "}and{" "}
          <Link href="#" className="underline hover:text-slate-600 transition-colors">Privacy Policy</Link>
        </p>
        <p className="text-xs text-slate-300 mt-1">Bihar&apos;s trusted healthcare platform</p>
      </footer>
    </div>
  );
}
