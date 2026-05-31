"use client";
import { Logo } from "@/features/marketing/components/brand/Logo";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Stethoscope,
  RefreshCw,
  AlertCircle,
  Phone,
  Lock,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState(1); // 1: phone, 2: otp & password, 3: success
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process request.");

      if (!data.userExists) {
        throw new Error("This phone number is not registered as a doctor.");
      }

      setSessionId(data.sessionId);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!sessionId) {
        throw new Error("Please request an OTP first.");
      }
      const body: Record<string, string> = { phone, password, otp, sessionId };
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password.");

      setStep(3);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Aesthetics */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-sky-100/40 blur-[120px]" />
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
                <pattern id="grid-fp" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-fp)" />
            </svg>
          </div>

          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-12 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
                <Logo className="h-8 w-auto object-contain" />
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
                Secure Account <br />
                <span className="text-sky-200">Recovery.</span>
              </h1>
              <p className="text-sky-100 font-medium text-lg max-w-xs leading-relaxed opacity-90">
                Recover your access details securely in a few simple steps.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20 shadow-lg">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                <KeyRound className="w-6 h-6 text-sky-500" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Automated Reset</p>
                <p className="text-sky-200 text-[11px] font-medium">OTP Verification • Instantly Reset</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Recovery Card */}
        <div className="flex-1 p-8 sm:p-12 lg:p-20 flex flex-col justify-center bg-white/40 relative">
          <div className="max-w-[360px] w-full mx-auto">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-10 text-center md:text-left">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Reset Password</h2>
                    <p className="text-slate-500 font-bold mt-2 text-sm">Enter your registered mobile number to proceed.</p>
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

                  <form onSubmit={handleSendOtp} className="space-y-6">
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

                    <Button
                      type="submit"
                      disabled={isLoading || phone.length < 10}
                      className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      {isLoading ? (
                        <><RefreshCw className="w-5 h-5 animate-spin" /> Verifying...</>
                      ) : (
                        <><KeyRound className="w-5 h-5" /> Send OTP Code <ArrowRight className="w-5 h-5" /></>
                      )}
                    </Button>

                    <div className="text-center mt-6">
                      <Link href="/partners/login" className="text-xs font-black text-slate-400 hover:text-primary transition-colors tracking-widest uppercase">
                        Back to Login
                      </Link>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-10 text-center md:text-left">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Choose Password</h2>
                    <p className="text-slate-500 font-bold mt-2 text-sm">Enter the OTP sent to you and set a new password.</p>
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

                  <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        6-Digit OTP Code
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                        <Input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="Enter 123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          className="h-16 pl-14 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/50 font-black text-xl tracking-widest transition-all shadow-sm"
                        />
                      </div>
                      {process.env.NODE_ENV !== "production" && (
                        <p className="text-[9px] font-bold text-sky-600 mt-2 ml-1">
                          * Dev only: test OTP when ALLOW_TEST_OTP is enabled.
                        </p>
                      )}
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        New Secure Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                        <Input
                          type="password"
                          required
                          placeholder="Min 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-16 pl-14 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/50 font-black text-lg transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                        <Input
                          type="password"
                          required
                          placeholder="Re-type password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-16 pl-14 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/50 font-black text-lg transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || otp.length < 6 || !password || !confirmPassword}
                      className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      {isLoading ? (
                        <><RefreshCw className="w-5 h-5 animate-spin" /> Resetting...</>
                      ) : (
                        <><CheckCircle2 className="w-5 h-5" /> Confirm New Password</>
                      )}
                    </Button>

                    <div className="text-center mt-6">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs font-black text-slate-400 hover:text-primary transition-colors tracking-widest uppercase"
                      >
                        Change Number
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-inner mx-auto mb-8 relative">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25 pointer-events-none" />
                  </div>

                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Password Reset!</h2>
                  <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto mb-10 leading-relaxed">
                    Your password has been successfully updated. You can now use your new password to sign into the portal.
                  </p>

                  <Button
                    onClick={() => router.push("/partners/login")}
                    className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Proceed to Login
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
