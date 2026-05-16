"use client";

import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, Star, PhoneCall } from "lucide-react";


export function TrustSection() {
  return (
    <section className="py-14 md:py-24 relative bg-[#0B2136] overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-72 md:w-[500px] h-72 md:h-[500px] bg-primary rounded-full blur-[80px] md:blur-[120px] opacity-20 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-72 md:w-[500px] h-72 md:h-[500px] bg-[#258C54] rounded-full blur-[80px] md:blur-[120px] opacity-20 -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/90 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure & Confidential
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 text-white leading-tight">
              Your Family&apos;s Health, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
                Our Responsibility.
              </span>
            </h2>
            <p className="text-base md:text-lg text-slate-300 leading-relaxed mb-8 max-w-lg font-medium">
              When it comes to your health, trust is everything. On <span className="font-bold text-white">JivniCare</span>, your data, appointments, and doctors are 100% safe, verified, and reliable.
            </p>
            
            <div className="space-y-4">
              {[
                "We personally verify the medical degrees and experience of every doctor.",
                "Your personal information and medical records are 100% private and secure.",
                "Need help? Our friendly support team is always here for you."
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-5/12 w-full"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              
              <div className="relative z-10 space-y-8">
                <div>
                  <div className="text-emerald-400 text-5xl font-black mb-2">4.9/5</div>
                  <div className="flex text-amber-400 mb-2 gap-1">
                    <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
                  </div>
                  <p className="text-slate-300">Don&apos;t just take our word for it. See what our patients have to say.</p>
                </div>
                
                <hr className="border-white/10" />
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <PhoneCall className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Need Assistance?</h4>
                    <p className="text-slate-400 text-sm">Our dedicated team is always ready to help you.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
