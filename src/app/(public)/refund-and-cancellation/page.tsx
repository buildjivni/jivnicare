import type { Metadata } from "next";
import { CreditCard, CalendarX, ShieldCheck, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — JivniCare",
  description: "Read JivniCare's policies regarding appointment cancellations, refunds, and booking convenience fees.",
};

const SECTIONS = [
  {
    icon: <CreditCard className="w-5 h-5" />,
    title: "Convenience Fees & Waived Charges",
    content: `JivniCare currently waives the standard platform convenience fee of ₹29 for early-access patients. If platform charges are introduced in future tiers, the billing details, fee breakdown, and refund criteria will be clearly communicated before any transaction. Currently, appointments booked online are completely free to book.`,
  },
  {
    icon: <CalendarX className="w-5 h-5" />,
    title: "Appointment Cancellation by Patients",
    content: `Patients can cancel their same-day bookings at any time directly through the patient portal. If you cancel your booking, the token will be released, allowing waitlisted patients to be advanced. We encourage timely cancellations (at least 1 hour before the expected consultation window) as a courtesy to the doctor and other patients in line.`,
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Consultation Fee Payments at Clinics",
    content: `All doctor consultation fees (e.g. ₹100, ₹200, or as specified on the doctor's profile) are paid directly to the doctor or receptionist at the clinic counter. JivniCare does not handle clinical fee collection or diagnostic service pricing, and is not responsible for refunding payments made at the physical clinic desk.`,
  },
  {
    icon: <Scale className="w-5 h-5" />,
    title: "Doctor Offline or Clinic Cancellation",
    content: `In the event that a doctor goes offline or cancels the queue for the day, JivniCare will immediately notify all booked patients via SMS and in-app alerts. Patients will not be charged any booking fee in such cases. The booking token status will be set to CANCELLED, and patients can schedule a fresh appointment for the next available day.`,
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white border-b border-slate-200 pt-16 pb-14">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-6">
            <Scale className="w-3.5 h-3.5" /> Billing Policy
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Refund &amp; Cancellation
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
            Need billing assistance? Contact us at{" "}
            <a href="mailto:support@jivnicare.com" className="text-primary font-semibold hover:underline">
              support@jivnicare.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
