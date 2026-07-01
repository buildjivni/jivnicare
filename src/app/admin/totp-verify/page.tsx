"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ShieldCheck, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { AuthBrand } from "@/features/marketing/components/brand/AuthBrand";

export default function AdminTOTPVerify() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBackupMode, setIsBackupMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/totp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid code. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1E3A8A] via-[#5298D2] to-[#489C66]" />
        <AuthBrand className="mb-8" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-3xl font-black text-slate-900">
              {isBackupMode ? "Recovery Code" : "Two-Factor Auth"}
            </h2>
            <p className="text-slate-500 font-medium mt-2 text-sm">
              {isBackupMode
                ? "Enter one of your 8-digit backup recovery codes."
                : "Enter the 6-digit code from your authenticator app."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative max-w-xs mx-auto">
                <Input
                  type="text"
                  required
                  maxLength={isBackupMode ? 8 : 6}
                  placeholder={isBackupMode ? "00000000" : "000000"}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="h-16 text-center rounded-2xl bg-slate-50 border-slate-200 focus-visible:ring-primary font-black text-3xl tracking-[0.25em]"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600">{error}</p>
            )}

            <Button
              type="submit"
              disabled={verifying || !code}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#5298D2] text-white font-black text-lg shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center"
            >
              {verifying ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                "Verify Code"
              )}
            </Button>
          </form>

          <button
            onClick={() => {
              setIsBackupMode(!isBackupMode);
              setCode("");
              setError(null);
            }}
            className="text-xs font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-widest block mx-auto py-1"
          >
            {isBackupMode ? "Use Authenticator App Code" : "Use Backup Recovery Code"}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <button
            onClick={() => router.push("/admin/jvc-26")}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest block mx-auto"
          >
            Cancel and Sign Out
          </button>
        </motion.div>
      </div>
    </div>
  );
}
