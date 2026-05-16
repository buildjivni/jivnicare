"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Firebase Imports
import { auth } from "@/lib/firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Reset Email Error:", err);
      setError(err.code === "auth/user-not-found" 
        ? "We couldn't find an account with that email." 
        : "Failed to send reset link. Please try again.");
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

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[500px] bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(16,185,129,0.1)] border border-white/50 p-8 sm:p-12 z-10 relative"
      >
        <Link 
          href="/partners/login" 
          className="mb-10 flex items-center gap-2 text-[11px] font-black text-slate-400 hover:text-emerald-700 transition-colors uppercase tracking-[0.2em] group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> BACK TO LOGIN
        </Link>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8 py-4"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-emerald-100/50">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Email Sent!</h3>
                <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-[280px] mx-auto">
                  Check your inbox for instructions to reset your password securely.
                </p>
              </div>
              <Link href="/partners/login" className="flex items-center justify-center w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-lg">
                Return to Portal
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-10 text-center sm:text-left">
                <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">Security Reset</h2>
                <p className="text-slate-500 font-bold mt-2 text-sm">
                  Enter your email to safely reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-rose-800 leading-relaxed">{error}</p>
                  </div>
                )}

                <div className="group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">Professional Email</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                    <Input 
                      type="email" 
                      required
                      placeholder="doctor@jivnicare.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-16 pl-14 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/50 font-black text-lg transition-all shadow-sm"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || !email}
                  className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-[0_12px_24px_-8px_var(--primary)] transition-all flex items-center justify-center gap-3"
                >
                  {isLoading ? "Sending Link..." : <>Send Reset Link <ShieldCheck className="w-5 h-5 text-blue-300" /></>}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 text-center opacity-30 grayscale flex items-center justify-center gap-2">
           <img src="/logo.png" alt="Logo" className="w-4 h-auto" />
           <span className="text-[10px] font-black text-slate-900 tracking-widest uppercase">Health System</span>
        </div>
      </motion.div>
    </div>
  );
}

