"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  User as UserIcon,
  MapPin,
  Heart,
  Building2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore, getRoleRedirect } from "@/store/useAuthStore";
import { PublicGuard } from "@/components/shared";
import { useFirebasePhoneAuth } from "@/hooks/useFirebasePhoneAuth";
import { isFirebaseClientConfigured } from "@/lib/firebase/config";
import { parseResponseJson } from "@/lib/safe-json";
import { logFirebaseOtp, maskConfigForLog } from "@/lib/firebase/otp-log";
import { getPublicFirebaseConfig } from "@/lib/firebase/config";
import { logOnboarding } from "@/lib/auth/onboarding-log";

import { StepIndicator, type OnboardingStep } from "@/components/auth/StepIndicator";
import { OtpInput } from "@/components/auth/OtpInput";
import {
  StatusMessage,
  LoadingSpinner,
  ResendTimer,
  SuccessCheckmark,
  FormSkeleton,
} from "@/components/auth/AuthFeedback";
import { AuthHeader, AuthSidebarBrand } from "@/components/auth/AuthHeader";

// Animation variants for consistent transitions
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function PatientLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const { login, isAuthenticated, user } = useAuthStore();

  // Form state
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<OnboardingStep>("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    sendOtp: sendFirebaseOtp,
    verifyOtpCode,
    isSending: isSendingFirebase,
    otpReady,
    resetConfirmation,
  } = useFirebasePhoneAuth("firebase-recaptcha-login");

  useEffect(() => {
    logFirebaseOtp("config_check", {
      page: "login",
      ...maskConfigForLog(getPublicFirebaseConfig()),
      configured: isFirebaseClientConfigured(),
    });
  }, []);

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

  // ── Step 1: Phone → send OTP ───────────────────────────────────
  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (phone.length < 10 || isLoading || isSendingFirebase) return;
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

      const data = await parseResponseJson<{ error?: string; userExists?: boolean }>(res);
      if (!data) throw new Error("Invalid server response.");
      if (!res.ok) throw new Error(data.error || "Failed to send OTP.");

      setNeedsProfile(!data.userExists);
      logOnboarding("otp_send_start", { isNewUser: !data.userExists });
      await requestFirebaseOtp();
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

  const requestFirebaseOtp = async () => {
    setError(null);
    if (!isFirebaseClientConfigured()) {
      throw new Error(
        "Phone verification is not available. Firebase client configuration is missing on this build."
      );
    }
    resetConfirmation();
    await sendFirebaseOtp(phone);
    setOtpSent(true);
    setResendTimer(30);
    setCanResend(false);
  };

  // ── Step 2: Verify OTP → session → identity or redirect ────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setIsLoading(true);
    setError(null);

    try {
      logOnboarding("otp_verify_start", { otpReady });
      if (isFirebaseClientConfigured() && !otpReady) {
        throw new Error("Please request an OTP first.");
      }

      const payload: Record<string, string | undefined> = { phone };
      if (isFirebaseClientConfigured()) {
        payload.firebaseIdToken = await verifyOtpCode(otp);
      } else {
        payload.otp = otp;
      }

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

      // Show success animation briefly
      setShowSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setShowSuccess(false);

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

  // ── Step 3: Identity (only after OTP + session) ────────────────
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

      // Show success and redirect
      setShowSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

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

  const handleResendOtp = async () => {
    if (isLoading || isSendingFirebase) return;
    setIsLoading(true);
    setError(null);
    try {
      await requestFirebaseOtp();
      toast.success("OTP sent successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend OTP.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneDisplay = (phoneNumber: string) => {
    if (phoneNumber.length === 10) {
      return `${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`;
    }
    return phoneNumber;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex flex-col lg:flex-row">
      {/* ── Left Side - Premium Branding (Hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-[#205E98] p-8 xl:p-12 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
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

        {/* Logo and content */}
        <div className="relative z-10">
          <div className="mb-10">
            <AuthSidebarBrand />
          </div>

          <div className="space-y-5">
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              Your Health,{" "}
              <span className="text-blue-200">Fully Protected.</span>
            </h1>
            <p className="text-blue-100 text-base xl:text-lg max-w-sm leading-relaxed opacity-90">
              Securely access your medical history and book instant appointments across our
              statewide network.
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
            <div className="w-11 h-11 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">OTP Verified Identity</p>
              <p className="text-blue-200 text-xs">Secure SMS Authentication</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2">
            <div className="flex items-center gap-2 text-blue-200/80">
              <Building2 className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs font-medium">5,000+ Doctors</span>
            </div>
            <div className="flex items-center gap-2 text-blue-200/80">
              <Heart className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs font-medium">Trusted in Bihar</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Side - Interactive Form ── */}
      <div className="flex-1 flex flex-col lg:justify-center p-4 pt-6 sm:p-6 sm:pt-8 lg:p-8">
        {/* Mobile Header - positioned at top with proper safe-area spacing */}
        <div className="lg:hidden mb-6 sm:mb-8">
          <AuthHeader className="pt-safe" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="w-full max-w-md mx-auto"
        >
          {/* Step indicator */}
          <div className="mb-6 sm:mb-8">
            <StepIndicator currentStep={step} isNewUser={needsProfile || step === "phone"} />
          </div>

          {/* Card container */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {/* Success overlay */}
              {showSuccess && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SuccessCheckmark
                    message={step === "otp" ? "Phone Verified!" : "Profile Complete!"}
                  />
                </motion.div>
              )}

              {/* Step 1: Phone Entry */}
              {step === "phone" && !showSuccess && (
                <motion.div
                  key="phone"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-8 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="w-7 h-7 text-primary" aria-hidden="true" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                      Welcome
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm sm:text-base">
                      Enter your mobile number to continue
                    </p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <div className="mb-6">
                        <StatusMessage
                          type="error"
                          message={error}
                          onDismiss={() => setError(null)}
                        />
                      </div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSendOtp} className="space-y-6">
                    <div>
                      <label
                        htmlFor="phone"
                        className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block"
                      >
                        Mobile Number
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                          <span className="text-slate-900 font-bold text-base">+91</span>
                          <div className="w-px h-5 bg-slate-200" />
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          className="h-14 pl-[72px] rounded-xl bg-slate-50 border-slate-200 focus:bg-white font-semibold text-lg tracking-wide"
                          aria-describedby="phone-hint"
                          autoComplete="tel-national"
                        />
                      </div>
                      <p id="phone-hint" className="sr-only">
                        Enter your 10-digit mobile number without country code
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || isSendingFirebase || phone.length < 10}
                      className="w-full h-14 rounded-xl bg-[#205E98] hover:bg-[#1a4f82] text-white font-semibold text-base shadow-lg shadow-primary/20 transition-all"
                    >
                      {isLoading || isSendingFirebase ? (
                        <LoadingSpinner className="text-white" />
                      ) : (
                        <>
                          Send OTP <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                        </>
                      )}
                    </Button>
                  </form>

                  <p className="text-center text-xs text-slate-400 mt-6">
                    By continuing, you agree to our{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </motion.div>
              )}

              {/* Step 2: OTP Verification */}
              {step === "otp" && !showSuccess && (
                <motion.div
                  key="otp"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-8">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("phone");
                        setOtp("");
                        setError(null);
                      }}
                      className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-4"
                      aria-label="Go back to phone entry"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Change Number</span>
                    </button>

                    <div className="text-center">
                      <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-7 h-7 text-green-600" aria-hidden="true" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                        Verify OTP
                      </h2>
                      <p className="text-slate-500 mt-2 text-sm sm:text-base">
                        Enter the 6-digit code sent to{" "}
                        <span className="font-semibold text-slate-700">
                          +91 {formatPhoneDisplay(phone)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <div className="mb-6">
                        <StatusMessage
                          type="error"
                          message={error}
                          onDismiss={() => setError(null)}
                        />
                      </div>
                    )}
                  </AnimatePresence>

                  {/* OTP status message */}
                  {!otpSent && !otpReady && (
                    <div className="mb-6">
                      <StatusMessage
                        type="info"
                        message="Please wait while we send the OTP to your phone..."
                      />
                    </div>
                  )}

                  {otpReady && (
                    <div className="mb-6">
                      <StatusMessage
                        type="success"
                        message={`OTP sent to +91 ${formatPhoneDisplay(phone)}`}
                      />
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div>
                      <label className="sr-only">Enter 6-digit verification code</label>
                      <OtpInput
                        value={otp}
                        onChange={setOtp}
                        length={6}
                        disabled={isLoading}
                        error={!!error}
                        autoFocus
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={
                        isLoading ||
                        otp.length < 6 ||
                        (isFirebaseClientConfigured() && !otpReady)
                      }
                      className="w-full h-14 rounded-xl bg-[#205E98] hover:bg-[#1a4f82] text-white font-semibold text-base shadow-lg shadow-primary/20 transition-all"
                    >
                      {isLoading ? (
                        <LoadingSpinner className="text-white" />
                      ) : (
                        <>
                          Verify & Continue
                          <ShieldCheck className="w-5 h-5 ml-2 text-green-300" aria-hidden="true" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6">
                    <ResendTimer
                      seconds={resendTimer}
                      canResend={canResend}
                      onResend={handleResendOtp}
                      isLoading={isLoading || isSendingFirebase}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Identity (Profile Completion) */}
              {step === "identity" && otpVerified && !showSuccess && (
                <motion.div
                  key="identity"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-8 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <UserIcon className="w-7 h-7 text-primary" aria-hidden="true" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                      Complete Your Profile
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm sm:text-base">
                      Verified{" "}
                      <span className="font-semibold text-primary">
                        +91 {formatPhoneDisplay(phone)}
                      </span>
                    </p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <div className="mb-6">
                        <StatusMessage
                          type="error"
                          message={error}
                          onDismiss={() => setError(null)}
                        />
                      </div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleIdentitySubmit} className="space-y-5">
                    <div>
                      <label
                        htmlFor="name"
                        className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        <Input
                          id="name"
                          type="text"
                          required
                          placeholder="Your Name"
                          value={name}
                          onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s.]/g, ""))}
                          className="h-14 pl-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white font-medium text-base"
                          autoComplete="name"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="location"
                        className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block"
                      >
                        City / Village
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        <Input
                          id="location"
                          type="text"
                          required
                          placeholder="e.g. Patna or Your Village"
                          value={location}
                          onChange={(e) =>
                            setLocation(e.target.value.replace(/[^a-zA-Z0-9\s.,-]/g, ""))
                          }
                          className="h-14 pl-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white font-medium text-base"
                          autoComplete="address-level2"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={
                        isLoading || name.trim().length < 2 || location.trim().length < 2
                      }
                      className="w-full h-14 rounded-xl bg-[#205E98] hover:bg-[#1a4f82] text-white font-semibold text-base shadow-lg shadow-primary/20 transition-all"
                    >
                      {isLoading ? (
                        <LoadingSpinner className="text-white" />
                      ) : (
                        <>
                          Complete Setup <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                        </>
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              Secure Portal &bull;{" "}
              <Link href="/privacy" className="hover:text-slate-600 transition-colors">
                Privacy
              </Link>{" "}
              &bull;{" "}
              <Link href="/terms" className="hover:text-slate-600 transition-colors">
                Terms
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Firebase reCAPTCHA container (invisible) */}
      <div
        id="firebase-recaptcha-login"
        className="fixed bottom-0 left-0 w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <FormSkeleton />
      </div>
    </div>
  );
}

export default function PatientLoginPage() {
  return (
    <PublicGuard>
      <Suspense fallback={<LoadingFallback />}>
        <PatientLoginContent />
      </Suspense>
    </PublicGuard>
  );
}
