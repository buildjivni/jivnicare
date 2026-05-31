"use client";
import { Logo } from "@/features/marketing/components/brand/Logo";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  User as UserIcon,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore, getRoleRedirect } from "@/features/auth/store/useAuthStore";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PublicGuard } from "@/components/shared";
import { parseResponseJson } from "@/lib/utils/safe-json";
import { logOnboarding } from "@/lib/auth/onboarding-log";

type LoginStep = "phone" | "otp" | "identity";

function PatientLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const { login, isAuthenticated, user } = useAuthStore();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<LoginStep>("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const finishLoginRedirect = (role?: Parameters<typeof getRoleRedirect>[0]) => {
    const target = redirectUrl || getRoleRedirect(role ?? user?.role ?? "PATIENT");
    logOnboarding("redirect", { target, role: role ?? user?.role });
    router.replace(target);
  };

  // Redirect when session is complete — never during identity collection
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (step === "identity" || needsProfile) return;
    if (otpVerified) {
      finishLoginRedirect(user.role);
      return;
    }
    if (step === "phone") {
      logOnboarding("auth_guard_skip", { reason: "existing_session" });
      finishLoginRedirect(user.role);
    }
  }, [isAuthenticated, user, step, needsProfile, otpVerified, router, redirectUrl]);

  // Load persisted name/phone from sessionStorage
  useEffect(() => {
    const savedName = sessionStorage.getItem("jc_login_name");
    const savedPhone = sessionStorage.getItem("jc_login_phone");
    if (savedName) setName(savedName);
    if (savedPhone) setPhone(savedPhone);
  }, []);

  useEffect(() => {
    if (name) sessionStorage.setItem("jc_login_name", name);
    if (phone) sessionStorage.setItem("jc_login_phone", phone);
  }, [name, phone]);

  // Resend countdown
  useEffect(() => {
    if (step === "otp" && resendTimer > 0) {
      const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(id);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [step, resendTimer]);

  // ── Step 1: Phone → send OTP (always before identity) ───────────
  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (phone.length < 10 || isLoading) return;
    setIsLoading(true);
    setError(null);
    setOtpVerified(false);
    logOnboarding("phone_submit", { phoneSuffix: phone.slice(-4) });

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await parseResponseJson<{
        error?: string;
        userExists?: boolean;
        sessionId?: string;
        retryAfterSec?: number;
      }>(res);
      
      if (!data) throw new Error("Invalid server response.");
      if (!res.ok) {
        const msg = data.retryAfterSec
          ? `${data.error || "Failed to send OTP."} Retry in ${data.retryAfterSec}s.`
          : data.error || "Failed to send OTP.";
        throw new Error(msg);
      }

      setNeedsProfile(!data.userExists);
      if (data.sessionId) setSessionId(data.sessionId);
      
      logOnboarding("otp_send_start", { isNewUser: !data.userExists });

      setOtpSent(true);
      setResendTimer(30);
      setCanResend(false);
      setStep("otp");
      logOnboarding("otp_send_success", { step: "otp" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send OTP.";
      logOnboarding("otp_send_error", { message });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verify OTP → session → identity or redirect ─────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setIsLoading(true);
    setError(null);

    try {
      logOnboarding("otp_verify_start", { sessionId: !!sessionId });
      if (!sessionId) {
        throw new Error("Please request an OTP first.");
      }

      const payload = { phone, otp, sessionId };

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await parseResponseJson<{
        error?: string;
        user?: Parameters<typeof login>[0];
        needsProfile?: boolean;
      }>(res);

      if (!data) throw new Error("Invalid server response. Please try again.");
      if (!res.ok) throw new Error(data.error || "OTP verification failed.");
      if (!data.user) throw new Error("Invalid server response. Please try again.");

      const showIdentity = Boolean(data.needsProfile);
      setNeedsProfile(showIdentity);
      setOtpVerified(true);

      if (showIdentity) {
        setStep("identity");
        login(data.user);
        logOnboarding("otp_verify_success", { needsProfile: true });
        logOnboarding("session_created", { userId: data.user.id });
        logOnboarding("identity_show");
        return;
      }

      login(data.user);
      logOnboarding("otp_verify_success", { needsProfile: false });
      logOnboarding("session_created", { userId: data.user.id, role: data.user.role });
      sessionStorage.removeItem("jc_login_name");
      sessionStorage.removeItem("jc_login_phone");
      setNeedsProfile(false);
      finishLoginRedirect(data.user.role);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid OTP. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 3: Identity (only after OTP + session) ─────────────────
  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedLocation = location.trim();

    if (!otpVerified || !isAuthenticated) {
      setError("Please verify your phone number first.");
      return;
    }
    if (trimmedName.length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }
    if (!/^[a-zA-Z\s.]+$/.test(trimmedName)) {
      setError("Name can only contain letters, spaces, and periods.");
      return;
    }
    if (trimmedLocation.length < 2) {
      setError("Please enter your city or village.");
      return;
    }

    setIsLoading(true);
    setError(null);
    logOnboarding("identity_submit", { nameLength: trimmedName.length });

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: trimmedName, location: trimmedLocation }),
      });

      const data = await parseResponseJson<{
        success?: boolean;
        error?: string;
        user?: Parameters<typeof login>[0];
      }>(res);

      if (!data) throw new Error("Invalid server response.");
      if (!res.ok) throw new Error(data.error || "Failed to save your profile.");

      if (data.user) {
        useAuthStore.getState().updateUser({
          name: data.user.name,
        });
      }

      logOnboarding("identity_success");

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              await fetch("/api/auth/update-location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                }),
              });
              toast.success("Location saved");
            } catch {
              toast.error("Could not save GPS location.");
            }
          },
          () => toast.info("Location permission skipped — you can enable later")
        );
      }

      sessionStorage.removeItem("jc_login_name");
      sessionStorage.removeItem("jc_login_phone");
      setNeedsProfile(false);
      finishLoginRedirect(data.user?.role ?? user?.role);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save profile. Please try again.";
      logOnboarding("identity_submit", { error: message });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* ── Background Aesthetics ── */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-100/40 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-50/40 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[1000px] bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(32,94,152,0.1)] border border-white/50 flex overflow-hidden z-10 relative"
      >
        {/* Left Side - Premium Branding */}
        <div className="w-[45%] bg-[#205E98] p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-12 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
                <Logo className="w-8 h-8 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white leading-none">JivniCare</span>
                <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1">Unified Health</span>
              </div>
            </Link>

            <div className="space-y-6">
              <h1 className="text-[42px] font-black text-white leading-[1.1] tracking-tight">
                Your Health, <br />
                <span className="text-blue-200">Fully Protected.</span>
              </h1>
              <p className="text-blue-100 font-medium text-lg max-w-xs leading-relaxed opacity-90">
                Securely access your medical history and book instant appointments across our nationwide network.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20 shadow-lg">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">OTP Verified Identity</p>
                <p className="text-blue-200 text-[11px] font-medium">Secure SMS Authentication</p>
              </div>
            </div>
            <p className="text-[11px] text-blue-300/80 font-bold uppercase tracking-widest text-center">
              Trusted by 5,000+ Doctors in Bihar
            </p>
          </div>
        </div>

        {/* Right Side - Interactive Form */}
        <div className="flex-1 p-8 sm:p-12 lg:p-20 flex flex-col justify-center bg-white/40 relative">
          <div className="max-w-[340px] w-full mx-auto">

            <AnimatePresence mode="wait">

              {/* Step 1: Phone Entry */}
              {step === "phone" && (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className="mb-10 text-center relative flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-6">
                      <Link
                        href="/"
                        className="flex items-center justify-center p-2 rounded-full bg-slate-50 text-slate-500 hover:text-primary hover:bg-slate-100 transition-all group"
                      >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    <Logo className="h-16 w-auto object-contain mb-6" />
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome</h2>
                    <p className="text-slate-500 font-bold mt-3 text-base">Enter your mobile number to log in or sign up safely.</p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-3 shadow-sm"
                    >
                      <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-black text-white">!</span>
                      </div>
                      <p className="text-[13px] font-black text-rose-800 leading-relaxed">{error}</p>
                    </motion.div>
                  )}

                  <form onSubmit={handleSendOtp} className="space-y-6">
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Mobile Number
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
                          className="h-16 pl-20 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary font-black text-xl tracking-wide transition-all placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || phone.length < 10}
                      className="w-full h-16 rounded-2xl bg-[#205E98] hover:bg-[#1a4f82] text-white font-black text-lg shadow-[0_12px_24px_-8px_rgba(32,94,152,0.3)] hover:shadow-[0_20px_40px_-12px_rgba(32,94,152,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                      {isLoading ? (
                        <>Sending OTP... <RefreshCw className="w-6 h-6 animate-spin" /></>
                      ) : (
                        <>Send Secure OTP <ArrowRight className="w-5 h-5" /></>
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Identity (after OTP verified + session created) */}
              {step === "identity" && otpVerified && (
                <motion.div
                  key="identity"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-10 text-center relative flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-6">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                          setError(null);
                          setStep("otp");
                        }}
                        className="flex items-center justify-center p-2 rounded-full bg-slate-50 text-slate-500 hover:text-primary hover:bg-slate-100 transition-all group"
                      >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      </button>
                    </div>

                    <Logo className="h-16 w-auto object-contain mb-6" />
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Complete Your Profile</h2>
                    <p className="text-slate-500 font-bold mt-2 text-base italic">
                      Verified <span className="text-primary">+91 {phone}</span> — add your details
                    </p>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                      <p className="text-xs font-bold text-rose-800 leading-relaxed">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleIdentitySubmit} className="space-y-6">
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                        <Input
                          type="text"
                          required
                          placeholder="Your Name"
                          value={name}
                          onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                          className="h-16 pl-14 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary font-black text-lg transition-all"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        City / Village Name
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                        <Input
                          type="text"
                          required
                          placeholder="e.g. Patna or Your Village"
                          value={location}
                          onChange={(e) => setLocation(e.target.value.replace(/[^a-zA-Z0-9\s.,-]/g, ""))}
                          className="h-16 pl-14 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary font-black text-lg transition-all"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || name.trim().length < 2 || location.trim().length < 2}
                      className="w-full h-16 rounded-2xl bg-[#205E98] hover:bg-[#1a4f82] text-white font-black text-lg shadow-[0_12px_24px_-8px_rgba(32,94,152,0.3)] transition-all flex items-center justify-center gap-3"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <>Continue <ArrowRight className="w-5 h-5" /></>
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Step 2: OTP Verification */}
              {step === "otp" && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-10 text-center relative flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-6">
                      <button
                        onClick={() => setStep("phone")}
                        className="flex items-center justify-center p-2 rounded-full bg-slate-50 text-slate-500 hover:text-primary hover:bg-slate-100 transition-all group"
                      >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      </button>
                    </div>

                    <Logo className="h-16 w-auto object-contain mb-6" />
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Verify OTP</h2>
                    <p className="text-slate-500 font-bold mt-2 text-base leading-relaxed">
                      Enter the 6-digit code sent to{" "}
                      <span className="text-slate-900 font-black">+91 {phone}</span>
                    </p>
                  </div>

                  {error && (
                    <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                      <p className="text-xs font-bold text-rose-800 leading-relaxed">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="space-y-8">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 block text-center">
                        Verification Code
                      </label>
                      <Input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        className="h-20 text-center rounded-[1.5rem] bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-8 focus:ring-primary/5 focus:border-primary font-black text-4xl tracking-[0.4em] transition-all placeholder:text-slate-200"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={
                        isLoading ||
                        otp.length < 6 ||
                        !sessionId
                      }
                      className="w-full h-16 rounded-2xl bg-[#205E98] hover:bg-[#1a4f82] text-white font-black text-lg shadow-[0_12px_24px_-8px_rgba(32,94,152,0.3)] transition-all flex items-center justify-center gap-3"
                    >
                      {isLoading ? (
                        <>Verifying OTP... <RefreshCw className="w-6 h-6 animate-spin" /></>
                      ) : (
                        <>Verify &amp; Log In <ShieldCheck className="w-5 h-5 text-emerald-400" /></>
                      )}
                    </Button>
                  </form>

                  <div className="mt-8 text-center">
                    {!otpSent && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isLoading}
                        className="mb-4 text-xs font-bold text-primary disabled:opacity-50"
                      >
                        {isLoading ? "Sending OTP…" : `Send OTP to +91 ${phone}`}
                      </button>
                    )}
                    {(otpSent) && (
                      <p className="mb-4 text-xs font-bold text-emerald-600">
                        OTP sent to +91 {phone}
                      </p>
                    )}
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 text-xs font-black text-primary hover:text-[#184a7a] transition-all disabled:opacity-50"
                      >
                        <RefreshCw className="w-4 h-4" /> RESEND OTP
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

            <div className="mt-16 pt-10 border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-loose">
                Secure Portal &bull;{" "}
                <Link href="/privacy" className="hover:text-slate-600">Privacy</Link>{" "}
                &bull;{" "}
                <Link href="/terms" className="hover:text-slate-600">Terms</Link>
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 opacity-30 grayscale">
                <Logo className="h-4 w-auto" />
                <span className="text-[10px] font-black text-slate-900">JivniCare Health System</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PatientLoginPage() {
  return (
    <PublicGuard>
      <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
        <PatientLoginContent />
      </Suspense>
    </PublicGuard>
  );
}
