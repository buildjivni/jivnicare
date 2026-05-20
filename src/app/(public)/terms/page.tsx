import type { Metadata } from "next";
import { FileText, Users, AlertTriangle, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — JivniCare",
  description: "Read JivniCare's terms of service governing the use of our healthcare discovery and appointment platform.",
};

const SECTIONS = [
  {
    icon: <Users className="w-5 h-5" />,
    title: "Acceptance of Terms",
    content: `By accessing or using JivniCare, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. JivniCare reserves the right to update these terms with reasonable notice.`,
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Platform Usage",
    content: `JivniCare is a healthcare discovery and appointment booking platform. We connect patients with verified healthcare providers but are not a medical provider ourselves. All clinical decisions, diagnoses, and treatments are the sole responsibility of the licensed doctors on our platform. JivniCare does not provide medical advice.`,
  },
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: "User Responsibilities",
    content: `Users are responsible for providing accurate personal information and ensuring that appointment bookings are made in good faith. Repeated no-shows without cancellation may result in temporary restrictions. Misuse of the platform, including fake appointments or harassment of healthcare providers, will result in immediate account termination.`,
  },
  {
    icon: <Scale className="w-5 h-5" />,
    title: "Limitation of Liability",
    content: `JivniCare provides the platform infrastructure for discovery and booking. We are not liable for the quality, accuracy, or outcomes of medical consultations facilitated through our platform. In the event of any dispute with a healthcare provider, JivniCare may assist in resolution but holds no clinical liability.`,
  },
];

export default function TermsPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white border-b border-slate-200 pt-16 pb-14">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-6">
            <Scale className="w-3.5 h-3.5" /> Legal
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-500 font-medium">Last updated: May 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-3xl py-16">
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
            Questions about our terms? Contact us at{" "}
            <a href="mailto:support@jivnicare.com" className="text-primary font-semibold hover:underline">
              support@jivnicare.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
