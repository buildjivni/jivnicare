"use client";

import { useState, useEffect } from "react";
import { Phone, ShieldCheck, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { trackOperationalEvent } from "@/lib/telemetry/client";
import { parseResponseJson } from "@/lib/utils/safe-json";

type OTPStep = "PHONE" | "OTP" | "IDENTITY";

interface InlineOTPWidgetProps {
  onVerified: () => void; // Callback when auth is complete
}

/**
 * PR-1: Inline OTP Authentication Widget for Checkout
 *
 * Renders the phone → OTP → (identity if new user) flow directly on the
 * checkout page. When verification completes, calls onVerified() to let
 * PaymentForm reveal the booking form. No page redirects.
 */
export function InlineOTPWidget({ onVerified }: InlineOTPWidgetProps) {
  const { login } = useAuthStore();
  const [step, setStep] = useState<OTPStep>("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('jc_otp_state');
      if (saved) {
        const state = JSON.parse(saved);
        // Only restore if it's less than 15 mins old
        if (state.timestamp && Date.now() - state.timestamp < 15 * 60 * 1000) {
          setPhone(state.phone);
          setSessionId(state.sessionId);
          setStep(state.step);
          setNeedsProfile(state.needsProfile);
        } else {
          sessionStorage.removeItem('jc_otp_state');
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Resend countdown
  useEffect(() => {
    if (step === "OTP" && resendTimer > 0) {
      const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(id);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [step, resendTimer]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const phone10 = phone.replace(/\D/g, "").slice(-10);
    if (phone10.length < 10 || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone10 }),
      });
      const data = await parseResponseJson<{
        error?: string;
        sessionId?: string;
        userExists?: boolean;
        retryAfterSec?: number;
      }>(res);

      if (!data || !res.ok) {
        const retryMsg = data?.retryAfterSec ? ` Retry in ${data.retryAfterSec}s.` : "";
        throw new Error((data?.error || "Failed to send OTP.") + retryMsg);
      }

      setSessionId(data.sessionId || null);
      setNeedsProfile(!data.userExists);
      setStep("OTP");
      setResendTimer(30);
      setCanResend(false);
      trackOperationalEvent({ metric: "otpSent" });

      sessionStorage.setItem('jc_otp_state', JSON.stringify({
        phone: phone10,
        sessionId: data.sessionId,
        step: "OTP",
        needsProfile: !data.userExists,
        timestamp: Date.now()
      }));

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6 || !sessionId || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: phone.replace(/\D/g, "").slice(-10), otp, sessionId }),
      });
      const data = await parseResponseJson<{
        error?: string;
        user?: Parameters<typeof login>[0];
        needsProfile?: boolean;
      }>(res);

      if (!data || !res.ok) throw new Error(data?.error || "OTP verification failed.");
      if (!data.user) throw new Error("Invalid server response.");

      login(data.user);
      trackOperationalEvent({ metric: "otpVerified" });

      if (data.needsProfile) {
        setStep("IDENTITY");
        // Update session storage for identity step
        sessionStorage.setItem('jc_otp_state', JSON.stringify({ phone, sessionId, step: "IDENTITY", needsProfile: true, timestamp: Date.now() }));
        return;
      }

      // Existing user — directly proceed to checkout form
      sessionStorage.removeItem('jc_otp_state');
      onVerified();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: trimmedName, location: "Not specified" }),
      });
      const data = await parseResponseJson<{ success?: boolean; error?: string; user?: any }>(res);
      if (!data || !res.ok) throw new Error(data?.error || "Failed to save profile.");
      if (data.user) {
        useAuthStore.getState().updateUser({ name: data.user.name });
      }
      sessionStorage.removeItem('jc_otp_state');
      onVerified();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/8 border border-primary/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {step === "PHONE" && "Verify Your Number"}
            {step === "OTP" && "Enter OTP"}
            {step === "IDENTITY" && "Complete Profile"}
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            {step === "PHONE" && "We need your mobile number to secure your booking."}
            {step === "OTP" && `Enter the 6-digit code sent to +91 ${phone}`}
            {step === "IDENTITY" && "Almost done — just tell us your name."}
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-100 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {/* Step: PHONE */}
      {step === "PHONE" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <div className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-900 font-black text-sm pr-2 border-r border-slate-200">+91</div>
            <Input
              type="tel"
              maxLength={10}
              placeholder="Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="h-14 pl-24 rounded-2xl bg-slate-50 border-slate-200 focus:border-primary font-bold text-lg tracking-wider"
            />
          </div>
          <Button
            type="submit"
            disabled={phone.replace(/\D/g, "").length < 10 || isLoading}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <><RefreshCw className="w-5 h-5 animate-spin" /> Sending...</> : <>Send OTP <ArrowRight className="w-5 h-5" /></>}
          </Button>
        </form>
      )}

      {/* Step: OTP */}
      {step === "OTP" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Input
            type="text"
            maxLength={6}
            placeholder="••••••"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="h-16 text-center rounded-2xl bg-slate-50 border-slate-200 focus:border-primary font-black text-3xl tracking-[0.5em] placeholder:text-slate-200"
          />
          <Button
            type="submit"
            disabled={otp.length < 6 || !sessionId || isLoading}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <><RefreshCw className="w-5 h-5 animate-spin" /> Verifying...</> : <><ShieldCheck className="w-5 h-5" /> Verify & Continue</>}
          </Button>
          <div className="text-center">
            {canResend ? (
              <button type="button" onClick={handleSendOtp} disabled={isLoading} className="text-xs font-black text-primary hover:text-primary/80 flex items-center gap-1.5 mx-auto">
                <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
              </button>
            ) : (
              <p className="text-[11px] font-bold text-slate-400">Resend in <span className="text-slate-700">{resendTimer}s</span></p>
            )}
          </div>
          <button type="button" onClick={() => { setStep("PHONE"); setOtp(""); setError(null); sessionStorage.removeItem('jc_otp_state'); }} className="text-xs font-bold text-slate-400 hover:text-slate-600 w-full text-center">
            ← Change number
          </button>
        </form>
      )}

      {/* Step: IDENTITY (new users only) */}
      {step === "IDENTITY" && (
        <form onSubmit={handleIdentitySubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
            className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-primary font-bold text-base"
          />
          <Button
            type="submit"
            disabled={name.trim().length < 2 || isLoading}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <><RefreshCw className="w-5 h-5 animate-spin" /> Saving...</> : <>Continue to Booking <ArrowRight className="w-5 h-5" /></>}
          </Button>
        </form>
      )}

      <p className="text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        Your data is secure and never shared
      </p>
    </div>
  );
}
