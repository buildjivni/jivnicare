import type { Metadata } from "next";
import { ShieldCheck, Lock, Server, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Security Overview — JivniCare",
  description: "How JivniCare protects your healthcare data with enterprise-grade security practices.",
};

export default function SecurityPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-slate-900 text-white pt-16 pb-14">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3.5 h-3.5" /> Security
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Security Overview
          </h1>
          <p className="text-slate-300 font-medium">How we protect your data, every step of the way.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-3xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            { icon: <Lock className="w-6 h-6" />, color: "text-blue-600 bg-blue-50", title: "TLS Encryption", desc: "All data in transit is protected with TLS 1.3. Your personal health information is never transmitted unencrypted." },
            { icon: <ShieldCheck className="w-6 h-6" />, color: "text-emerald-600 bg-emerald-50", title: "OTP Authentication", desc: "No passwords stored. Your identity is verified exclusively through time-limited OTPs sent to your registered phone number." },
            { icon: <Server className="w-6 h-6" />, color: "text-purple-600 bg-purple-50", title: "Secure Infrastructure", desc: "Data is hosted on enterprise-grade cloud infrastructure with strict access controls, regular security audits, and monitoring." },
            { icon: <RefreshCw className="w-6 h-6" />, color: "text-amber-600 bg-amber-50", title: "Regular Audits", desc: "Our security posture is reviewed regularly. We apply security patches promptly and follow responsible disclosure practices." },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-3xl border border-slate-200 p-6">
              <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-4`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Report a Security Issue</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            If you discover a security vulnerability in JivniCare, please disclose it responsibly by contacting our security team. We are committed to acknowledging and addressing all valid security reports.
          </p>
          <a
            href="mailto:security@jivnicare.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all"
          >
            security@jivnicare.com
          </a>
        </div>
      </div>
    </div>
  );
}
