import type { Metadata } from "next";
import { AlertTriangle, ShieldAlert, HeartHandshake, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Medical Disclaimer — JivniCare",
  description: "Read JivniCare's medical disclaimer outlining the relationship between JivniCare bookings and clinical healthcare services.",
};

const SECTIONS = [
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: "Not a Provider of Medical Advice",
    content: `JivniCare is a queue-management and doctor discovery software platform. The content, graphics, text, templates, and services provided on this website are for informational and scheduling purposes only. They do not constitute professional medical advice, diagnosis, treatment recommendation, or clinical consultation.`,
  },
  {
    icon: <ShieldAlert className="w-5 h-5" />,
    title: "No Emergency Care Coverage",
    content: `JivniCare is designed for same-day scheduled outpatient consultations (OPD) and routine clinic queue-management. JivniCare does NOT support, coordinate, or provide emergency medical services. In the event of a medical emergency, trauma, severe illness, or acute condition, please contact local emergency numbers or visit the nearest hospital emergency room immediately.`,
  },
  {
    icon: <HeartHandshake className="w-5 h-5" />,
    title: "Clinical Liability & Doctor Autonomy",
    content: `All consultations, medical histories, diagnosis cards, treatment selections, and prescriptions are the sole clinical responsibility of the independent licensed medical practitioner you are consulting. JivniCare does not interfere with, monitor, or hold liability for clinical outcomes, medical negligence, or doctor-patient dispute resolutions.`,
  },
  {
    icon: <Scale className="w-5 h-5" />,
    title: "Accuracy of Doctor Details",
    content: `Doctor registration numbers, councils, specialties, and qualifications displayed on JivniCare are provided by the respective doctors during onboarding. JivniCare performs administrative verification checks (matching medical council records), but encourages patients to independently verify credentials before making critical health decisions.`,
  },
];

export default function MedicalDisclaimerPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white border-b border-slate-200 pt-16 pb-14">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-6">
            <Scale className="w-3.5 h-3.5" /> Medical Disclaimer
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Medical Disclaimer
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
            Questions regarding our disclaimer? Contact us at{" "}
            <a href="mailto:support@jivnicare.com" className="text-primary font-semibold hover:underline">
              support@jivnicare.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
