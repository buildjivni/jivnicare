"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Stethoscope,
  RefreshCw,
  AlertCircle,
  Phone,
  Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PublicGuard } from "@/components/shared";

function DoctorLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/doctor/dashboard";

  const { login, isAuthenticated, user } = useAuthStore();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already-logged-in guard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "DOCTOR") {
        router.replace(redirectUrl);
      } else if (user.role === "ADMIN") {
        router.replace("/admin/dashboard");
      }
    }
  }, [isAuthenticated, user, router, redirectUrl]);

  // ── Phone & Password Login flow ────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10 || !password) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/doctor-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");

      login(data.user);
      router.push(data.user.role === "ADMIN" ? "/admin/dashboard" : redirectUrl);
    } catch (err: any) {
      setError(err.message || "Invalid phone number or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* ── Background Aesthetics ── */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-100/40 blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-50/40 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[1050px] bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(14,165,233,0.15)] border border-white/50 flex overflow-hidden z-10 relative"
      >
        {/* Left Side - Professional Branding */}
        <div className="w-[45%] bg-primary p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-p" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-p)" />
            </svg>
          </div>

          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-12 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
                <img src="/logo.png" alt="JivniCare Logo" className="h-8 w-auto object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-white leading-none">
                  Jivni<span className="text-[#489C66]">Care</span>
                </span>
                <span className="text-[10px] font-bold text-sky-200 uppercase tracking-widest mt-1">Partner Portal</span>
              </div>
            </Link>

            <div className="space-y-6">
              <h1 className="text-[40px] font-black text-white leading-[1.1] tracking-tight">
                A Modern Platform <br />
                <span className="text-sky-200">for Trusted Doctors.</span>
              </h1>
              <p className="text-sky-100 font-medium text-lg max-w-xs leading-relaxed opacity-90">
                Join 5,000+ medical professionals managing their digital practice with JivniCare.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20 shadow-lg">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                <Stethoscope className="w-6 h-6 text-sky-500" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Professional Access</p>
                <p className="text-sky-200 text-[11px] font-medium">Verified Identity • Secure Login</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Interactive Form */}
        <div className="flex-1 p-8 sm:p-12 lg:p-20 flex flex-col justify-center bg-white/40 relative">
          <div className="max-w-[360px] w-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key="input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-10 text-center md:text-left">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Partner Login</h2>
                  <p className="text-slate-500 font-bold mt-2 text-sm">Access your clinical dashboard.</p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-rose-900 leading-relaxed">{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="group">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                      Registered Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2.5">
                        <span className="text-slate-900 font-black text-lg">+91</span>
                        <div className="w-px h-6 bg-slate-200" />
                      </div>
                      <Input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="h-16 pl-20 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/50 font-black text-xl tracking-wide transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <div className="flex justify-between items-center mb-2.5 px-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Password</label>
                      <Link href="/partners/forgot-password" className="text-[10px] font-black text-sky-600 hover:text-sky-700 tracking-wider">FORGOT?</Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                      <Input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-16 pl-14 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/50 font-black text-lg transition-all shadow-sm"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-2 text-center md:text-left">
                      Enter the password you created during onboarding.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || phone.length < 10 || !password}
                    className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-[0_12px_24px_-8px_var(--primary)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                  >
                    {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
                  </Button>
                </form>

                <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                  <p className="text-[13px] font-bold text-slate-500">
                    New to the network? <br />
                    <Link href="/partners/onboard" className="text-sky-600 font-black hover:text-sky-700 mt-2 inline-flex items-center gap-1.5 group transition-all">
                      Request Partnership <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function DoctorLoginPage() {
  return (
    <PublicGuard>
      <Suspense fallback={<div className="min-h-screen bg-[#f8f9fa]" />}>
        <DoctorLoginContent />
      </Suspense>
    </PublicGuard>
  );
}
