"use client";

import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, Star, PhoneCall, Quote } from "lucide-react";


export function TrustSection() {
  return (
    <section className="py-14 md:py-24 relative bg-slate-950 overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-72 md:w-[500px] h-72 md:h-[500px] bg-primary rounded-full blur-[100px] md:blur-[140px] opacity-20 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-72 md:w-[500px] h-72 md:h-[500px] bg-secondary rounded-full blur-[100px] md:blur-[140px] opacity-15 -translate-x-1/3 translate-y-1/3" />
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
              <ShieldCheck className="w-4 h-4 text-secondary" /> Operational Integrity
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 text-white leading-tight">
              A Medical Infrastructure <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
                You Can Trust.
              </span>
            </h2>
            <p className="text-base md:text-lg text-slate-300 leading-relaxed mb-8 max-w-lg font-medium">
              We operate with strict healthcare compliance. <span className="font-bold text-white">JivniCare</span> guarantees 100% doctor verification, medical data privacy, and a seamless, anxiety-free clinical experience.
            </p>
            
            <div className="space-y-5">
              {[
                "Strict multi-step verification for every doctor's medical degrees and active licenses.",
                "End-to-end encryption for your medical records and personal health data.",
                "Dedicated operational support team available 24/7 to assist with your appointments."
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-secondary shrink-0 mt-0.5" />
                  <span className="text-slate-300 font-medium leading-relaxed">{item}</span>
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
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg leading-tight">Verified Experiences</h4>
                    <p className="text-slate-400 text-sm">Real stories from our patients.</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Testimonial 1 */}
                  <div className="bg-white/10 p-5 rounded-2xl border border-white/5 backdrop-blur-md relative hover:bg-white/15 transition-colors">
                    <div className="absolute top-4 right-4 text-secondary/30"><Quote className="w-8 h-8" /></div>
                    <div className="flex gap-1.5 mb-3">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" /><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>
                    <p className="text-white text-[15px] font-medium leading-relaxed italic mb-4">"Got my token online and didn't have to wait in the clinic at all. The live queue tracking is incredibly accurate."</p>
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-black text-white shadow-sm">RV</div>
                       <p className="text-sm text-white font-bold tracking-tight">Rahul V. <span className="text-emerald-400 font-medium ml-1 flex items-center inline-flex gap-1"><CheckCircle2 className="w-3 h-3"/> Verified</span></p>
                    </div>
                  </div>

                  {/* Testimonial 2 */}
                  <div className="bg-white/10 p-5 rounded-2xl border border-white/5 backdrop-blur-md relative hover:bg-white/15 transition-colors">
                    <div className="absolute top-4 right-4 text-secondary/30"><Quote className="w-8 h-8" /></div>
                    <div className="flex gap-1.5 mb-3">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" /><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>
                    <p className="text-white text-[15px] font-medium leading-relaxed italic mb-4">"The doctor verification badge gave me absolute peace of mind. Very professional healthcare platform."</p>
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-black text-white shadow-sm">SG</div>
                       <p className="text-sm text-white font-bold tracking-tight">Sneha G. <span className="text-emerald-400 font-medium ml-1 flex items-center inline-flex gap-1"><CheckCircle2 className="w-3 h-3"/> Verified</span></p>
                    </div>
                  </div>
                </div>
                
                <hr className="border-white/10 my-4" />
                
                <div className="flex items-center justify-between">
                   <div className="flex -space-x-2">
                     <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-200" />
                     <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-300" />
                     <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-400" />
                     <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">+15k</div>
                   </div>
                   <p className="text-xs font-bold text-slate-400">Join 15,000+ Happy Patients</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
