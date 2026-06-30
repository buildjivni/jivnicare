"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/features/marketing/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Copy, Check, AlertTriangle, Key } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminTOTPSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeUri: string } | null>(null);
  
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    async function fetchSetup() {
      try {
        const res = await fetch("/api/auth/totp/setup");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load setup details");
        }
        setSetupData({ secret: data.secret, qrCodeUri: data.qrCodeUri });
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchSetup();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
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
      if (data.backupCodes) {
        setBackupCodes(data.backupCodes);
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid code");
    } finally {
      setVerifying(false);
    }
  };

  const copyBackupCodes = () => {
    if (!backupCodes) return;
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleComplete = () => {
    if (!acknowledged) return;
    router.push("/admin/dashboard");
  };

  const qrCodeUrl = setupData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(setupData.qrCodeUri)}`
    : "";

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1E3A8A] via-[#5298D2] to-[#489C66]" />

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shadow-md">
            <Logo variant="icon" size={40} className="w-10 h-10 object-contain" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-bold">Initializing 2FA Setup...</p>
            </motion.div>
          )}

          {!loading && error && !backupCodes && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Setup Failed</h2>
              <p className="text-slate-500 font-medium mt-2 mb-6">{error}</p>
              <Button onClick={() => router.push("/admin/jvc-26")} className="rounded-xl">
                Return to Login
              </Button>
            </motion.div>
          )}

          {!loading && !error && setupData && !backupCodes && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-black text-slate-900">Secure Your Account</h2>
                <p className="text-slate-500 font-medium mt-2">
                  Configure Two-Factor Authentication (2FA) for your administrator account.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt="Scan me with Google Authenticator"
                  className="w-[200px] h-[200px] bg-white border border-slate-200 rounded-2xl shadow-inner object-contain"
                />
                <div className="flex-1 space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instructions</p>
                  <ol className="list-decimal list-inside text-xs text-slate-600 font-medium space-y-2 leading-relaxed">
                    <li>Open your authenticator app (Google Authenticator, Microsoft Authenticator, etc.).</li>
                    <li>Scan this QR code or type the secret key manually.</li>
                    <li>Enter the 6-digit code below to confirm setup.</li>
                  </ol>
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Secret Key Fallback</p>
                    <code className="text-xs font-black text-slate-800 bg-slate-100/80 px-2 py-1 rounded block select-all break-all text-center md:text-left">
                      {setupData.secret}
                    </code>
                  </div>
                </div>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block text-center">
                    Enter Authenticator Code
                  </label>
                  <Input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="h-16 text-center rounded-2xl bg-slate-50 border-slate-200 focus-visible:ring-primary font-black text-3xl tracking-[0.2em] max-w-xs mx-auto"
                  />
                </div>

                {error && (
                  <p className="text-xs font-bold text-rose-600 text-center">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={verifying || code.length !== 6}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#5298D2] text-white font-black text-lg shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  {verifying ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying Setup...
                    </span>
                  ) : (
                    "Confirm & Verify 2FA"
                  )}
                </Button>
              </form>
            </motion.div>
          )}

          {backupCodes && (
            <motion.div
              key="backup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Backup Recovery Codes</h2>
                <p className="text-slate-500 font-medium mt-2 text-sm leading-relaxed">
                  These codes let you access your account if you lose your authenticator device.
                  They are shown <span className="font-bold text-slate-900">exactly once</span>. Save them securely!
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 relative">
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                  {backupCodes.map((c, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 w-4">{index + 1}.</span>
                      <span className="font-mono text-sm font-black text-slate-800 tracking-wider select-all">{c}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <Button
                    type="button"
                    onClick={copyBackupCodes}
                    variant="outline"
                    className="rounded-xl border-slate-200 hover:bg-slate-100 flex items-center gap-2 h-11 px-5"
                  >
                    {copiedCodes ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" /> Codes Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-500" /> Copy to Clipboard
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 bg-blue-50/50 border border-blue-100/50 p-4 rounded-2xl cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    className="w-5 h-5 rounded text-[#1E3A8A] border-slate-300 focus:ring-[#1E3A8A] mt-0.5 shrink-0"
                  />
                  <span className="text-xs text-slate-600 font-medium leading-relaxed">
                    I have copied, saved, or printed these backup recovery codes. I understand they will never be shown to me again.
                  </span>
                </label>

                <Button
                  onClick={handleComplete}
                  disabled={!acknowledged}
                  className="w-full h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-blue-900/10 active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  Complete Setup &amp; Enter Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
