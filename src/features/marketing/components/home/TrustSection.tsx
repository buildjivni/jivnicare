"use client";

import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, Star, PhoneCall, Quote, Calendar } from "lucide-react";

export function TrustSection() {
  return (
    <section className="py-12 md:py-16 relative bg-white overflow-hidden">
      {/* Calm Medical Accents */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-72 md:w-[600px] h-72 md:h-[600px] bg-primary/5 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-72 md:w-[600px] h-72 md:h-[600px] bg-secondary/5 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-primary text-xs font-black uppercase tracking-widest mb-8">
              <ShieldCheck className="w-4 h-4" /> Trusted Healthcare
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8 text-slate-900 leading-[1.1]">
              A Medical Platform <br />
              <span className="text-primary">Built on Trust.</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed mb-10 max-w-lg font-bold">
              We understand that healthcare is personal. <span className="text-primary font-black">Jivni</span><span className="text-secondary font-black">Care</span> ensures every doctor is verified and every appointment is handled with professional care.
            </p>
            
            <div className="space-y-6">
              {[
                { title: "Doctor Verification", desc: "Every medical degree and registration is manually verified by our team.", icon: <ShieldCheck className="w-6 h-6" /> },
                { title: "Safe & Secure", desc: "Your personal health records are encrypted and never shared without your consent.", icon: <Star className="w-6 h-6" /> },
                { title: "Real-Time Tracking", desc: "Know exactly when your turn is with our live OPD queue tracking system.", icon: <PhoneCall className="w-6 h-6" /> }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-black text-lg md:text-xl mb-1">{item.title}</h4>
                    <p className="text-slate-600 text-base font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-5/12 w-full"
          >
            <div className="bg-slate-50 border border-slate-100 p-8 md:p-12 rounded-[3rem] shadow-premium relative overflow-hidden">
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-8 h-8 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-black text-xl leading-tight">Patient Stories</h4>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider"> Patient Voices</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  {/* Testimonial 1 */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group hover:shadow-md transition-all">
                    <div className="absolute top-6 right-6 text-slate-100 group-hover:text-primary/10 transition-colors"><Quote className="w-10 h-10" /></div>
                    <p className="text-slate-700 text-base font-bold leading-relaxed italic mb-6 relative z-10">
                      "I booked an appointment for my mother. We reached the clinic and were seen exactly at our time. No waiting at all!"
                    </p>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-black text-white">MK</div>
                       <div>
                         <p className="text-sm text-slate-900 font-black">Manoj Kumar</p>
                         <p className="text-[10px] text-secondary font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Verified Patient</p>
                       </div>
                    </div>
                  </div>

                  {/* Testimonial 2 */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group hover:shadow-md transition-all">
                    <div className="absolute top-6 right-6 text-slate-100 group-hover:text-primary/10 transition-colors"><Quote className="w-10 h-10" /></div>
                    <p className="text-slate-700 text-base font-bold leading-relaxed italic mb-6 relative z-10">
                      "Highly professional doctors. The <span className="text-primary font-black">Jivni</span><span className="text-secondary font-black">Care</span> verification badge gives me trust that my health is in safe hands."
                    </p>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-black text-white">SP</div>
                       <div>
                         <p className="text-sm text-slate-900 font-black">Sunita Prasad</p>
                         <p className="text-[10px] text-secondary font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Verified Patient</p>
                       </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Join Our Growing Network</p>
                   <div className="flex -space-x-2">
                     {[
                       { char: "M", bg: "bg-primary text-white" },
                       { char: "S", bg: "bg-[#4A8C4A] text-white" },
                       { char: "A", bg: "bg-amber-500 text-white" },
                       { char: "R", bg: "bg-purple-500 text-white" }
                     ].map((item, idx) => (
                       <div 
                         key={idx} 
                         className={`w-9 h-9 rounded-full border-2 border-white ${item.bg} shadow-sm flex items-center justify-center text-[11px] font-black select-none`}
                       >
                         {item.char}
                       </div>
                     ))}
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
