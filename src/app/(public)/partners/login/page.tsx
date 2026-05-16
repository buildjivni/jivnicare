"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck, Stethoscope, RefreshCw, AlertCircle, Mail, Phone, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { BrandName } from "@/components/brand/BrandName";

// Firebase Imports
import { auth } from "@/lib/firebase/config";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  signInWithEmailAndPassword 
} from "firebase/auth";

function DoctorLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/doctor/dashboard";
  
  const { login, isAuthenticated, user } = useAuthStore();

  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Firebase Specific State
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

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

  // Handle countdown for resend
  useEffect(() => {
    if (step === "otp" && resendTimer > 0) {
      const timerId = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [step, resendTimer]);

  // Initialize reCAPTCHA
  const setupRecaptcha = () => {
    if (recaptchaVerifierRef.current) return;
    try {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    } catch (err) {
      console.error("reCAPTCHA setup error:", err);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setIsLoading(true);
    setError(null);

    setupRecaptcha();
    const appVerifier = recaptchaVerifierRef.current;

    if (!appVerifier) {
      setError("Security verification failed. Please refresh.");
      setIsLoading(false);
      return;
    }

    try {
      const formattedPhone = `+91${phone}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setStep("otp");
      setResendTimer(30);
      setCanResend(false);
    } catch (err: any) {
      console.error("Send OTP Error:", err);
      setError(err.message || "Failed to send OTP. Try again.");
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError(null);

    try {
      // 1. Sign in with Firebase
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();

      // 2. Sync with JivniCare Session
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      login(data.user);
      router.push(data.user.role === "ADMIN" ? "/admin/dashboard" : redirectUrl);
    } catch (err: any) {
      console.error("Email Login Error:", err);
      setError(err.code === "auth/wrong-password" || err.code === "auth/user-not-found" 
        ? "Invalid email or password." 
        : "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6 || !confirmationResult) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      login(data.user);
      router.push(data.user.role === "PATIENT" ? "/partners/onboard" : redirectUrl);
    } catch (err: any) {
      console.error("Verify OTP Error:", err);
      setError(err.code === "auth/invalid-verification-code" ? "Invalid OTP." : "Verification failed.");
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

      {/* Invisible reCAPTCHA Container */}
      <div id="recaptcha-container"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[1050px] bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(16,185,129,0.1)] border border-white/50 flex overflow-hidden z-10 relative"
      >
        {/* Left Side - Professional Branding */}
        <div className="w-[45%] bg-[#065F46] p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden hidden md:flex">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-p" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-p)" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-12 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
                 <img src="/logo.png" alt="JivniCare Logo" className="w-8 h-8 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white leading-none">JivniCare</span>
                <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest mt-1">Partner Portal</span>
              </div>
            </Link>

            <div className="space-y-6">
              <h1 className="text-[40px] font-black text-white leading-[1.1] tracking-tight">
                Empowering <br />
                <span className="text-emerald-300">Care Providers.</span>
              </h1>
              <p className="text-emerald-100 font-medium text-lg max-w-xs leading-relaxed opacity-90">
                Join 5,000+ medical professionals managing their digital practice with JivniCare.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20 shadow-lg">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                <Stethoscope className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Professional Access</p>
                <p className="text-emerald-200 text-[11px] font-medium">HIPAA Compliant Architecture</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Interactive Form */}
        <div className="flex-1 p-8 sm:p-12 lg:p-20 flex flex-col justify-center bg-white/40 relative">
          <div className="max-w-[360px] w-full mx-auto">
            
            <AnimatePresence mode="wait">
              {step === "input" ? (
                <motion.div 
                  key="input"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8 text-center md:text-left">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Partner Login</h2>
                    <p className="text-slate-500 font-bold mt-2 text-sm">Access your clinical dashboard.</p>
                  </div>

                  {/* Enhanced Method Toggle */}
                  <div className="flex p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-2xl mb-10 border border-slate-200/50 shadow-inner">
                    <button 
                      onClick={() => setLoginMethod("phone")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-black transition-all ${loginMethod === "phone" ? "bg-white text-emerald-700 shadow-md ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      <Phone className="w-4 h-4" /> PHONE
                    </button>
                    <button 
                      onClick={() => setLoginMethod("email")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-black transition-all ${loginMethod === "email" ? "bg-white text-emerald-700 shadow-md ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      <Mail className="w-4 h-4" /> EMAIL
                    </button>
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

                  <AnimatePresence mode="wait">
                    {loginMethod === "phone" ? (
                      <motion.form 
                        key="phone-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handlePhoneSubmit} 
                        className="space-y-6"
                      >
                        <div className="group">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">Mobile Number</label>
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
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                              className="h-16 pl-20 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600/50 font-black text-xl tracking-wide transition-all shadow-sm"
                            />
                          </div>
                        </div>
                        <Button 
                          type="submit" 
                          disabled={isLoading || phone.length < 10}
                          className="w-full h-16 rounded-2xl bg-[#065F46] hover:bg-[#047857] text-white font-black text-lg shadow-[0_12px_24px_-8px_rgba(6,95,70,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                          {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <>Get OTP Access <ArrowRight className="w-5 h-5" /></>}
                        </Button>
                      </motion.form>
                    ) : (
                      <motion.form 
                        key="email-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleEmailSubmit} 
                        className="space-y-6"
                      >
                        <div className="group">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">Professional Email</label>
                          <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                            <Input 
                              type="email" 
                              required
                              placeholder="doctor@clinic.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="h-16 pl-14 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600/50 font-black text-lg transition-all shadow-sm"
                            />
                          </div>
                        </div>
                        <div className="group">
                          <div className="flex justify-between items-center mb-2.5 px-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Password</label>
                            <Link href="/partners/forgot-password" size="sm" className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 tracking-wider">FORGOT?</Link>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                            <Input 
                              type="password" 
                              required
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="h-16 pl-14 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600/50 font-black text-lg transition-all shadow-sm"
                            />
                          </div>
                        </div>
                        <Button 
                          type="submit" 
                          disabled={isLoading || !email || !password}
                          className="w-full h-16 rounded-2xl bg-[#065F46] hover:bg-[#047857] text-white font-black text-lg shadow-[0_12px_24px_-8px_rgba(6,95,70,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                          {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
                        </Button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                    <p className="text-[13px] font-bold text-slate-500">
                      New to the network? <br />
                      <Link href="/partners/onboard" className="text-emerald-700 font-black hover:text-emerald-800 mt-2 inline-flex items-center gap-1.5 group transition-all">
                        Request Partnership <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <button 
                    onClick={() => setStep("input")}
                    className="mb-8 flex items-center gap-2 text-xs font-black text-slate-400 hover:text-emerald-700 transition-colors group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> BACK
                  </button>
                  <div className="mb-10 text-center md:text-left">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Verify Securely</h2>
                    <p className="text-slate-500 font-bold mt-2 text-sm leading-relaxed">
                      Enter the 6-digit access code sent to <span className="text-slate-900 font-black">+91 {phone}</span>
                    </p>
                  </div>

                  {error && (
                    <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                      <p className="text-xs font-bold text-rose-800 leading-relaxed">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="space-y-8">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 block text-center">Security Code</label>
                      <Input 
                        type="text" 
                        required
                        maxLength={6}
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="h-20 text-center rounded-[1.5rem] bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-600 font-black text-4xl tracking-[0.4em] transition-all placeholder:text-slate-200"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading || otp.length < 6}
                      className="w-full h-16 rounded-2xl bg-[#065F46] hover:bg-[#047857] text-white font-black text-lg shadow-[0_12px_24px_-8px_rgba(6,95,70,0.3)] transition-all flex items-center justify-center gap-3"
                    >
                      {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <>Verify & Access Portal <ShieldCheck className="w-5 h-5 text-emerald-300" /></>}
                    </Button>
                  </form>
                  
                  <div className="mt-8 text-center">
                    {canResend ? (
                      <button onClick={handlePhoneSubmit} className="text-xs font-black text-emerald-700 hover:text-emerald-800 transition-all flex items-center gap-2 mx-auto">
                        <RefreshCw className="w-4 h-4" /> RESEND ACCESS CODE
                      </button>
                    ) : (
                      <p className="text-[11px] font-bold text-slate-400 tracking-wider">
                        RESEND IN <span className="text-slate-900 font-black">{resendTimer}s</span>
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        </div>
      </motion.div>
    </div>
  );
}


export default function DoctorLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9fa]" />}>
      <DoctorLoginContent />
    </Suspense>
  );
}
