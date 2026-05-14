"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck, HeartPulse, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { BrandName } from "@/components/brand/BrandName";

const BrandColors = { blue: "#5298D2", green: "#489C66" };

function PatientLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  
  const login = useAuthStore(state => state.login);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

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
    if (phone.length < 10 || name.length < 2) return;
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      
      if (!res.ok) throw new Error("Failed to send OTP");
      
      setStep("otp");
      setResendTimer(30);
      setCanResend(false);
    } catch (error) {
      console.error(error);
      alert("Error sending OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, name: name.trim() }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }
      
      login({
        id: data.user.id,
        name: data.user.name || name.trim() || "Patient User",
        role: "PATIENT",
      });
      // Token is already set as httpOnly cookie by backend — no need to store in Zustand
      
      router.push(redirectUrl);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl flex overflow-hidden fade-in min-h-[550px]">
        {/* Left Side - Branding */}
        <div className="w-1/2 bg-gradient-to-br from-[#205E98] to-[#1E3A8A] p-12 flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-8 cursor-pointer">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                 <svg viewBox="0 0 100 100" className="w-8 h-8">
                  <circle cx="50" cy="25" r="12" fill={BrandColors.blue} />
                  <path d="M 45 40 Q 20 50 25 80 Q 40 85 48 75 Q 45 60 45 40 Z" fill={BrandColors.blue} />
                  <path d="M 55 40 Q 80 50 75 80 Q 60 85 52 75 Q 55 60 55 40 Z" fill={BrandColors.green} />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">JivniCare</h2>
            </Link>
            <h1 className="text-4xl font-black text-white leading-tight mt-10">
              Your Health, <br />Simplified.
            </h1>
            <p className="text-blue-100 font-medium mt-4 text-lg max-w-sm">
              Log in to book appointments, check queue status, and access your medical history.
            </p>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">100% Secure & Private</p>
                <p className="text-blue-100 text-sm">Your data is fully encrypted.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-white relative">
          <div className="max-w-sm w-full mx-auto">
            {step === "phone" ? (
              <div className="fade-in">
                <div className="mb-8 text-center md:text-left">
                  <h2 className="text-3xl font-black text-slate-900">Sign In / Sign Up</h2>
                  <p className="text-slate-500 font-medium mt-2">Enter your mobile number to continue.</p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Full Name</label>
                    <Input 
                      type="text" 
                      required
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-14 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary font-bold text-lg"
                    />
                  </div>

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
                        className="h-14 pl-16 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary font-black text-lg tracking-wide"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading || phone.length < 10 || name.length < 2}
                    className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center group"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Sending OTP...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="fade-in">
                <button 
                  onClick={() => setStep("phone")}
                  className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="mb-8 text-center md:text-left">
                  <h2 className="text-3xl font-black text-slate-900">Verify OTP</h2>
                  <p className="text-slate-500 font-medium mt-2">Code sent to +91 {phone.slice(0,4)} {phone.slice(4,7)} {phone.slice(7)}</p>
                </div>

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
                      className="h-14 text-center rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary font-black text-2xl tracking-[1em]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading || otp.length < 4}
                    className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center group"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Verifying...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Secure Login <ShieldCheck className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                   {canResend ? (
                     <button 
                       onClick={handleSendOtp} 
                       className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-[#184a7a] transition-colors"
                     >
                       <RefreshCw className="w-3.5 h-3.5" />
                       Resend OTP
                     </button>
                   ) : (
                     <p className="text-sm font-medium text-slate-500">
                       Didn't receive the code? Resend in <span className="font-bold text-slate-700">{resendTimer}s</span>
                     </p>
                   )}
                </div>
              </div>
            )}
            
            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
              <p className="text-xs font-medium text-slate-400">
                By continuing, you agree to <BrandName />'s <br /> Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PatientLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f9fc]" />}>
      <PatientLoginContent />
    </Suspense>
  );
}
