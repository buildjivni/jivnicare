"use client";
import { Logo } from "@/features/marketing/components/brand/Logo";
import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/api/auth/session-callback" });
    } catch (error) {
      console.error("Google sign in failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />

      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl flex overflow-hidden fade-in min-h-[600px]">
        {/* Left Side - Branding */}
        <div className="w-1/2 bg-gradient-to-br from-[#1E3A8A] via-[#5298D2] to-[#489C66] p-12 flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                 <Logo variant="icon" size={32} />
              </div>
              <Logo variant="wordmark" className="h-6 w-auto brightness-0 invert" />
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mt-10">
              Command <br />Center
            </h1>
            <p className="text-blue-100 font-medium mt-4 text-lg max-w-sm">
              Secure operational portal for JivniCare administrators.
            </p>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">Secure Access Only</p>
                <p className="text-blue-100 text-sm">All login attempts are monitored and logged.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Google Login Form */}
        <div className="w-full md:w-1/2 p-12 lg:p-20 flex flex-col justify-center bg-white relative">
          <div className="max-w-sm w-full mx-auto">
            <div className="mb-10 text-center md:text-left flex flex-col items-center md:items-start">
              <Logo variant="primary" className="h-16 w-auto mb-4 md:hidden" />
              <h2 className="text-3xl font-black text-slate-900">Admin Login</h2>
              <p className="text-slate-500 font-medium mt-2">Sign in using your Google account to access the dashboard.</p>
            </div>

            <div className="space-y-6">
              <Button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-14 rounded-xl bg-[#4285F4] hover:bg-[#357AE8] text-white font-black text-lg shadow-xl shadow-blue-900/20 hover:shadow-blue-900/40 transition-all flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Connecting...
                  </span>
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

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Protected by 2FA</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex gap-3 text-xs text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>NextAuth and Admin TOTP 2FA are enabled. You will need your authenticator app or backup codes after Google verification.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
