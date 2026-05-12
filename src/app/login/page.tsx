"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, ShieldCheck, ChevronDown, Stethoscope, Building2,
  ArrowRight, Loader2, BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
];

const TRUST_POINTS = [
  { icon: <BadgeCheck className="w-4 h-4 text-emerald-600" />, text: "500+ Verified Doctors" },
  { icon: <Building2 className="w-4 h-4 text-[#205E98]" />, text: "50+ Trusted Hospitals" },
  { icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />, text: "Bihar-focused Healthcare" },
];

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) ?? COUNTRY_CODES[0];

  const isValidPhone = phone.replace(/\s/g, "").length === 10;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
    setPhone(raw);
    if (error) setError("");
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      // Simulate OTP send API call — replace with real backend
      await new Promise<void>((resolve) => setTimeout(resolve, 1200));
      // Store phone in sessionStorage for OTP page
      sessionStorage.setItem("jc_phone", `${countryCode}${phone}`);
      router.push("/login/verify");
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm"
    >
      {/* ── TRUST TAGLINE ─────────────────────── */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          Bihar&apos;s Trusted Healthcare
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Healthcare access<br />made simple
        </h1>
        <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
          Book verified doctors in Bihar instantly.<br />Just enter your phone number.
        </p>
      </div>

      {/* ── LOGIN CARD ────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgb(32,94,152,0.08)] border border-slate-100 p-6">
        <p className="text-sm font-bold text-slate-900 mb-4">
          Enter your mobile number
        </p>

        <form onSubmit={handleContinue} noValidate>
          {/* Phone Input Row */}
          <div className="flex gap-2 mb-3">
            {/* Country Code Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCountryPicker(!showCountryPicker)}
                className="h-14 min-w-[80px] flex items-center gap-1.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:border-[#205E98]/40 focus:outline-none focus:ring-2 focus:ring-[#205E98]/20 transition-all"
                aria-label="Select country code"
              >
                <span className="text-base">{selectedCountry.flag}</span>
                <span>{selectedCountry.code}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showCountryPicker ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {showCountryPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl z-30 min-w-[160px] py-2 overflow-hidden"
                    aria-label="Country code options"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => { setCountryCode(c.code); setShowCountryPicker(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${c.code === countryCode ? "bg-[#205E98]/8 text-[#205E98]" : "text-slate-600 hover:bg-slate-50"}`}
                      >
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                        <span className="ml-auto text-xs text-slate-400">{c.code}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Phone Input */}
            <div className="flex-1 relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden />
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={handlePhoneChange}
                className={`h-14 pl-10 rounded-2xl border text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#205E98]/25 focus-visible:border-[#205E98] transition-all ${error ? "border-red-300 bg-red-50/30" : "border-slate-200 bg-slate-50/50"}`}
                aria-label="Mobile phone number"
                aria-invalid={!!error}
                aria-describedby={error ? "phone-error" : undefined}
                autoComplete="tel"
                required
              />
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                id="phone-error"
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-red-600 font-medium mb-3 px-1"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Continue Button */}
          <Button
            type="submit"
            disabled={isLoading || !isValidPhone}
            className="w-full h-14 rounded-2xl bg-[#205E98] hover:bg-[#184a7a] text-white font-bold text-base shadow-md shadow-[#205E98]/20 hover:shadow-lg hover:shadow-[#205E98]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label="Continue to OTP verification"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          <p className="text-center text-xs text-slate-400 mt-3 font-medium">
            We&apos;ll send a 6-digit OTP to verify your number
          </p>
        </form>
      </div>

      {/* ── TRUST INDICATORS ──────────────────── */}
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {TRUST_POINTS.map((tp) => (
          <div key={tp.text} className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-white/70 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
            {tp.icon}
            {tp.text}
          </div>
        ))}
      </div>

      {/* ── SECONDARY LINKS ───────────────────── */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-xs text-slate-400">For healthcare providers</p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/partners"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#205E98] hover:text-[#184a7a] transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" />
            Partner with JivniCare
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
