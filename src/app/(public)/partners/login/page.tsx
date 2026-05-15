"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck, Stethoscope, RefreshCw, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { BrandName } from "@/components/brand/BrandName";

function DoctorLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/doctor/dashboard";
  
  const login = useAuthStore(state => state.login);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // Already-logged-in guard
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "DOCTOR") {
        router.replace(redirectUrl);
      } else if (user?.role === "ADMIN") {
        router.replace("/admin/dashboard");
      }
    }
  }, [isAuthenticated, user, router, redirectUrl]);

  // Load from sessionStorage on mount
  useEffect(() => {
    const savedPhone = sessionStorage.getItem("jc_partner_login_phone");
    if (savedPhone) setPhone(savedPhone);
  }, []);

  // Save to sessionStorage on change
  useEffect(() => {
    if (phone) sessionStorage.setItem("jc_partner_login_phone", phone);
  }, [phone]);

  // Handle countdown for rate limits
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown(c => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (step === "otp" && resendTimer > 0) {
      const timerId = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [step, resendTimer]);

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

      if (!res.ok) {
        if (res.status === 429) {
          setError(data.error || "Too many requests.");
          if (data.retryAfter) setCountdown(data.retryAfter);
          return;
        }
        throw new Error(data.error || "Failed to send OTP");
      }
      
      setStep("otp");
      setResendTimer(30);
      setCanResend(false);
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Error sending OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setIsLoading(true);

    setError(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, name: "Doctor" }), // Default name, real name fetched/updated later
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }
      
      // Clear persistence on success
      sessionStorage.removeItem("jc_partner_login_phone");

      login({
        id: data.user.id,
        name: data.user.name || "Doctor",
        role: data.user.role,
      });
      
      // Routing Logic Based on Role
      if (data.user.role === 'DOCTOR') {
        router.push(redirectUrl); // To dashboard
      } else {
        // If they are a PATIENT, they need to onboard
        router.push('/partners/onboard');
      }
      
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl md:rounded-[2.5rem] shadow-xl md:shadow-2xl flex overflow-hidden fade-in min-h-[500px] md:min-h-[600px]">
        {/* Left Side - Branding */}
        <div className="w-1/2 bg-gradient-to-br from-[#489C66] to-[#14532d] p-12 flex flex-col justify-between relative overflow-hidden hidden md:flex">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(255,255,255,0.5) 24px, rgba(255,255,255,0.5) 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(255,255,255,0.5) 24px, rgba(255,255,255,0.5) 25px)"
          }} />

          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-8 cursor-pointer">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <img src="/logo.png" alt="JivniCare Logo" className="w-8 h-8 object-contain" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight"><BrandName /></h2>
            </Link>
            <h1 className="text-4xl font-black text-white leading-tight mt-10">
              Welcome Back, <br />Partner
            </h1>
            <p className="text-green-100 font-medium mt-4 text-lg max-w-sm">
              Access your digital clinic, manage your queue, and connect with patients seamlessly.
            </p>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-lg">
                <Stethoscope className="w-6 h-6 text-[#489C66]" />
              </div>
              <div>
                <p className="text-white font-bold">Secure Partner Portal</p>
                <p className="text-green-100 text-sm">OTP Verified Encrypted Access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-16 flex flex-col justify-center bg-white relative">
          <div className="max-w-sm w-full mx-auto">
            
            {step === "phone" ? (
              <div className="fade-in">
                <div className="mb-10 text-center md:text-left flex flex-col items-center md:items-start">
                  <img src="/logo.png" alt="JivniCare Logo" className="w-16 h-16 object-contain mb-4 md:hidden" />
                  <h2 className="text-3xl font-black text-slate-900">Partner Login</h2>
                  <p className="text-slate-500 font-medium mt-2">Enter your mobile number to access your clinic.</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-800">Login Failed</p>
                      <p className="text-xs text-red-600 mt-0.5">{error}</p>
                      {countdown > 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          Try again in <span className="font-bold">{countdown} seconds</span>.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Mobile Number</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <span className="text-slate-500 font-bold border-r border-slate-200 pr-2">+91</span>
                      </div>
                      <Input 
                        type="tel" 
                        required
                        maxLength={10}
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="h-14 pl-16 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#489C66] font-black text-lg tracking-wide"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading || phone.length < 10 || countdown > 0}
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-[#489C66] to-[#15803d] hover:brightness-110 text-white font-black text-lg shadow-xl shadow-green-900/20 transition-all flex items-center justify-center group"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Sending OTP...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Send OTP <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>

                <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p className="text-xs font-semibold text-emerald-700">We no longer use passwords for better security.</p>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    Not partnered with JivniCare yet? <br />
                    <Link href="/partners/onboard" className="text-[#489C66] font-bold hover:underline mt-1 inline-block">
                      Join the Network
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <div className="fade-in">
                <button 
                  onClick={() => setStep("phone")}
                  className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#489C66] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="mb-8 text-center md:text-left">
                  <h2 className="text-3xl font-black text-slate-900">Verify Clinic Access</h2>
                  <p className="text-slate-500 font-medium mt-2">Code sent to +91 {phone.slice(0,4)} {phone.slice(4,7)} {phone.slice(7)}</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-rose-900">{error}</p>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">4-Digit OTP</label>
                    <Input 
                      type="text" 
                      required
                      maxLength={4}
                      placeholder="• • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="h-14 text-center rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#489C66] font-black text-2xl tracking-[1em]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading || otp.length < 4}
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-[#489C66] to-[#15803d] hover:brightness-110 text-white font-black text-lg shadow-xl shadow-green-900/20 transition-all flex items-center justify-center group"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Verifying...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Secure Access <ShieldCheck className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                    {canResend ? (
                      <button 
                        onClick={handleSendOtp} 
                        disabled={isLoading || countdown > 0}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-[#489C66] hover:text-[#15803d] transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Resend OTP
                      </button>
                    ) : (
                     <p className="text-sm font-medium text-slate-500">
                       Didn&apos;t receive the code? Resend in <span className="font-bold text-slate-700">{resendTimer}s</span>
                     </p>
                   )}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
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
