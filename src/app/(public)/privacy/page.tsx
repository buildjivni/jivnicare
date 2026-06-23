import type { Metadata } from "next";
import { ShieldCheck, Lock, Eye, Database } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — JivniCare",
  description: "Understand how JivniCare collects, uses, and protects your personal health information.",
};

const SECTIONS = [
  {
    icon: <Database className="w-5 h-5" />,
    title: "Information We Collect",
    content: `When you use JivniCare, we collect information necessary to provide healthcare booking services. This includes your name, phone number (used for OTP-based authentication only), appointment preferences, and optional profile details you choose to provide. We do not collect online payments or store payment credentials — all consultation fees are settled directly at the clinic/hospital counter when you visit.`,
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: "How We Use Your Information",
    content: `Your information is used exclusively to facilitate appointment bookings, connect you with verified healthcare providers, and improve your experience on the platform. We do not sell your personal data to any third party. Your phone number is used only for OTP verification and appointment-related notifications.`,
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Data Security",
    content: `JivniCare employs industry-standard encryption (TLS/SSL) for all data in transit. Your personal health information is stored in secure, access-controlled databases. Only verified healthcare providers you have booked with will have access to the minimum information required for your appointment.`,
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Your Rights",
    content: `You have the right to access, correct, or request deletion of your personal data at any time. You may contact our support team at support@jivnicare.com for any data-related requests. We comply with applicable Indian data protection regulations and are committed to transparency in all data handling.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white border-b border-slate-200 pt-16 pb-14">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3.5 h-3.5" /> Trust & Privacy
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 font-medium">Last updated: May 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-3xl py-16">
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 mb-12 flex gap-4">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-900 mb-1">Our Core Commitment</p>
            <p className="text-sm text-emerald-800 leading-relaxed">
              JivniCare is built on trust. Your health data is private, sensitive, and yours. We are committed to collecting only what is necessary, protecting it rigorously, and never monetizing it.
            </p>
          </div>
        </div>

        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.title} className="bg-white rounded-3xl border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm">
            Questions? Contact us at{" "}
            <a href="mailto:support@jivnicare.com" className="text-primary font-semibold hover:underline">
              support@jivnicare.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
