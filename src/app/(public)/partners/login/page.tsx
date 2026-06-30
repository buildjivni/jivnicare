"use client";
import { Logo } from "@/features/marketing/components/brand/Logo";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Stethoscope, RefreshCw, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PublicGuard } from "@/components/shared";

function DoctorLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/doctor/dashboard";

  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "DOCTOR") {
        router.replace(redirectUrl);
      } else if (user.role === "ADMIN") {
        router.replace("/admin/dashboard");
      }
    }
  }, [isAuthenticated, user, router, redirectUrl]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("google", { callbackUrl: "/api/auth/session-callback" });
    } catch (err: any) {
      setError(err.message || "Google Authentication failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Aesthetics */}
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
                <Logo variant="icon" size={32} />
              </div>
              <div className="flex flex-col gap-1">
                <Logo variant="wordmark" className="h-6 w-auto brightness-0 invert" />
                <span className="text-[10px] font-bold text-sky-200 uppercase tracking-widest leading-none">Partner Portal</span>
              </div>
            </Link>
 
            <div className="space-y-6">
              <h1 className="text-[40px] font-heading font-black text-white leading-[1.1] tracking-tight">
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
                <div className="mb-10 text-center md:text-left flex flex-col items-center md:items-start">
                  <div className="md:hidden flex flex-col items-center gap-2 mb-8 group">
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <Logo variant="icon" size={32} />
                    </div>
                    <Logo variant="wordmark" className="h-6 w-auto" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                      Partner Portal
                    </span>
                  </div>
                  <h2 className="text-3xl font-heading font-black text-slate-900 tracking-tight text-center md:text-left">Partner Login</h2>
                  <p className="text-slate-500 font-bold mt-2 text-sm text-center md:text-left">
                    Access your clinical dashboard via Google OAuth.
                  </p>
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

                <div className="space-y-6">
                  <Button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full h-16 rounded-2xl bg-[#4285F4] hover:bg-[#357AE8] text-white font-black text-lg shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <svg className="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        Sign in with Google
                      </>
                    )}
                  </Button>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex gap-3 text-xs text-slate-500 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Your Google account must be linked to your JivniCare registration. For new partnerships, please request onboarding below.</span>
                  </div>
                </div>

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
