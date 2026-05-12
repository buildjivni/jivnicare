"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowLeft, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore, getRoleRedirect, type UserRole } from "@/store/useAuthStore";
import Link from "next/link";

const OTP_LENGTH = 6;
const RESEND_DELAY = 30; // seconds

// Simulate backend role detection — replace with real API
async function verifyOTP(phone: string, otp: string): Promise<{ role: UserRole; name: string; id: string }> {
  await new Promise<void>((r) => setTimeout(r, 1400));
  // Demo: any valid OTP → user role
  if (otp === "123456") return { role: "doctor", name: "Dr. Rakesh Kumar", id: "doc_001" };
  if (otp === "999999") return { role: "admin", name: "Admin User", id: "adm_001" };
  return { role: "user", name: "Patient User", id: "usr_001" };
}

export default function OTPVerifyPage() {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(RESEND_DELAY);
  const [canResend, setCanResend] = useState(false);
  const [phone, setPhone] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const stored = sessionStorage.getItem("jc_phone");
    if (!stored) { router.replace("/login"); return; }
    setPhone(stored);
    inputRefs.current[0]?.focus();
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setResendTimer((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (error) setError("");
    // Auto-advance
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
    if (value && updated.filter(Boolean).length === OTP_LENGTH) {
      handleVerify(updated.join(""));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted.length > 0) {
      const updated = Array(OTP_LENGTH).fill("");
      pasted.split("").forEach((d, i) => { updated[i] = d; });
      setOtp(updated);
      const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      if (pasted.length === OTP_LENGTH) handleVerify(pasted);
    }
  };

  const handleVerify = async (code: string) => {
    if (isLoading || isSuccess) return;
    setIsLoading(true);
    setError("");
    try {
      const result = await verifyOTP(phone, code);
      setUser({
        id: result.id,
        phone,
        name: result.name,
        role: result.role,
        verified: true,
      });
      setIsSuccess(true);
      sessionStorage.removeItem("jc_phone");
      // Smooth redirect after success animation
      setTimeout(() => {
        router.replace(getRoleRedirect(result.role));
      }, 900);
    } catch {
      setError("Invalid OTP. Please try again.");
      setIsLoading(false);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    }
  };

  const handleManualVerify = () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) { setError("Please enter the complete 6-digit OTP."); return; }
    handleVerify(code);
  };

  const handleResend = () => {
    if (!canResend) return;
    setResendTimer(RESEND_DELAY);
    setCanResend(false);
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    inputRefs.current[0]?.focus();
    // Simulate resend API
  };

  const maskedPhone = phone ? `${phone.slice(0, phone.length - 7)}XXXXXXX` : "";
  const isComplete = otp.every(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm"
    >
      {/* Back Link */}
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 font-medium hover:text-slate-800 transition-colors mb-6"
        aria-label="Go back to phone number entry"
      >
        <ArrowLeft className="w-4 h-4" />
        Change number
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#205E98]/8 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#205E98]/10">
          <ShieldCheck className="w-8 h-8 text-[#205E98]" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">OTP Verification</h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          We sent a 6-digit code to<br />
          <span className="font-bold text-slate-800">{maskedPhone || phone}</span>
        </p>
      </div>

      {/* OTP Card */}
      <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgb(32,94,152,0.08)] border border-slate-100 p-6">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-6 gap-3"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-emerald-500" />
              </div>
              <p className="font-bold text-slate-900">Verified!</p>
              <p className="text-sm text-slate-500">Redirecting to your dashboard...</p>
              <Loader2 className="w-5 h-5 animate-spin text-[#205E98]" />
            </motion.div>
          ) : (
            <motion.div key="form">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-4">
                Enter 6-digit OTP
              </p>

              {/* OTP Inputs */}
              <div
                className="flex items-center justify-center gap-2 mb-4"
                role="group"
                aria-label="OTP input boxes"
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="\d"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    disabled={isLoading || isSuccess}
                    aria-label={`OTP digit ${i + 1}`}
                    className={`w-11 h-14 text-center text-xl font-black rounded-2xl border-2 outline-none transition-all focus:scale-105
                      ${digit ? "border-[#205E98] bg-[#205E98]/5 text-[#205E98]" : "border-slate-200 bg-slate-50 text-slate-900"}
                      ${error ? "border-red-300 bg-red-50/30 animate-shake" : ""}
                      focus:border-[#205E98] focus:bg-[#205E98]/5 focus:shadow-[0_0_0_4px_rgb(32,94,152,0.1)]
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-600 font-medium text-center mb-3"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Verify Button */}
              <Button
                onClick={handleManualVerify}
                disabled={isLoading || !isComplete}
                className="w-full h-14 rounded-2xl bg-[#205E98] hover:bg-[#184a7a] text-white font-bold text-base shadow-md shadow-[#205E98]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                aria-label="Verify OTP"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </Button>

              {/* Resend Timer */}
              <div className="text-center mt-4">
                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#205E98] hover:text-[#184a7a] transition-colors"
                    aria-label="Resend OTP"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Resend OTP
                  </button>
                ) : (
                  <p className="text-xs text-slate-400 font-medium">
                    Resend OTP in{" "}
                    <span className="font-bold text-slate-600">{resendTimer}s</span>
                  </p>
                )}
              </div>

              {/* Demo hint */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-2xl text-center">
                <p className="text-xs text-amber-700 font-medium">
                  Demo: Enter any code → Patient | <span className="font-bold">123456</span> → Doctor | <span className="font-bold">999999</span> → Admin
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
