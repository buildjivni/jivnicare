import Link from "next/link";
import { Building2, Stethoscope, ArrowRight, ShieldCheck, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Header Section */}
        <section className="text-center max-w-3xl mx-auto py-16 md:py-24">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
            <Building2 className="w-4 h-4" />
            JivniCare for Healthcare Partners
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            Grow your practice with Bihar&apos;s most trusted healthcare platform.
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            Whether you are an independent doctor or a multi-specialty hospital, JivniCare connects you directly with patients seeking reliable healthcare.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/partners/onboard">
              <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base w-full sm:w-auto transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5">
                Onboard as a Doctor
              </Button>
            </Link>
            <Link href="/partners/onboard">
              <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-base w-full sm:w-auto transition-all hover:border-slate-300">
                Register a Clinic / Hospital
              </Button>
            </Link>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Users className="w-6 h-6 text-primary" />,
              title: "Reach More Patients",
              desc: "Get discovered by thousands of patients in your district actively searching for your specialty."
            },
            {
              icon: <Zap className="w-6 h-6 text-amber-500" />,
              title: "Zero Setup Friction",
              desc: "Our simple dashboard lets you manage bookings, update availability, and view patient details effortlessly."
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
              title: "Verified Trust",
              desc: "Build your digital reputation. Authentic patient reviews and verified badges help establish trust instantly."
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}
