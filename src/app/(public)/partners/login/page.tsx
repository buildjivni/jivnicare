"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, Stethoscope, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

export default function DoctorLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useAuthStore(state => state.login);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);

  // Already-logged-in guard
  useEffect(() => {
    if (isAuthenticated && user?.role === "DOCTOR") {
      router.replace("/doctor/dashboard");
    } else if (isAuthenticated && user?.role === "ADMIN") {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Double-submission guard
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/doctor-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed. Please check your credentials.");

      login(data.user, data.token);
      router.push("/doctor/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl md:rounded-[2.5rem] shadow-xl md:shadow-2xl flex overflow-hidden fade-in min-h-[500px] md:min-h-[600px]">
        {/* Left Side - Branding (no external URL dependency) */}
        <div className="w-1/2 bg-gradient-to-br from-[#489C66] to-[#14532d] p-12 flex flex-col justify-between relative overflow-hidden hidden md:flex">
          {/* CSS-only subtle grid pattern — no external URL */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(255,255,255,0.5) 24px, rgba(255,255,255,0.5) 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(255,255,255,0.5) 24px, rgba(255,255,255,0.5) 25px)"
          }} />

          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-8 cursor-pointer">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <img src="/logo.png" alt="JivniCare Logo" className="w-8 h-8 object-contain" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">JivniCare</h2>
            </Link>
            <h1 className="text-4xl font-black text-white leading-tight mt-10">
              Welcome Back, <br />Doctor
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
                <p className="text-white font-bold">Secure Health Portal</p>
                <p className="text-green-100 text-sm">End-to-end encrypted patient data.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-20 flex flex-col justify-center bg-white relative">
          <div className="max-w-sm w-full mx-auto">
            <div className="mb-10 text-center md:text-left flex flex-col items-center md:items-start">
              <img src="/logo.png" alt="JivniCare Logo" className="w-16 h-16 object-contain mb-4 md:hidden" />
              <h2 className="text-3xl font-black text-slate-900">Partner Login</h2>
              <p className="text-slate-500 font-medium mt-2">Log in to your verified medical account.</p>
            </div>

            {/* Inline error banner — replaces alert() */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-800">Login Failed</p>
                  <p className="text-xs text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Registered Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    required
                    placeholder="doctor@clinic.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    className="h-14 pl-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#489C66] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    className="h-14 pl-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#489C66] font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded text-[#489C66] border-slate-300 focus:ring-[#489C66]" />
                  <span className="text-sm font-medium text-slate-600">Remember me</span>
                </label>
                <button type="button" className="text-sm font-bold text-[#489C66] hover:underline">Forgot password?</button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-[#489C66] to-[#15803d] text-white font-black text-lg shadow-xl shadow-green-900/20 hover:shadow-green-900/40 transition-all flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Access Clinic <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-xs font-semibold text-emerald-700">Your patient data is encrypted and never shared.</p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm font-medium text-slate-500">
                Not partnered with JivniCare yet? <br />
                <Link href="/partners/onboard" className="text-[#489C66] font-bold hover:underline mt-1 inline-block">
                  Create a Partner Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
