"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, Phone, MessageCircle, Mail, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/features/marketing/components/brand/Logo";

const faqs = [
  {
    question: "How do I know the doctor is verified?",
    answer: "Every doctor on JivniCare undergoes a strict 3-step verification process checking their medical registration number, active license, and clinic authenticity before they are listed."
  },
  {
    question: "What happens if I miss my turn in the live queue?",
    answer: "If you miss your turn, your token is moved down the queue slightly. You will not lose your appointment entirely, but you may have to wait for the next available slot."
  },
  {
    question: "Is my medical data secure?",
    answer: "Absolutely. JivniCare uses end-to-end encryption for all patient records and appointment details. We do not sell or share your data with third parties."
  },
  {
    question: "Can I cancel my appointment?",
    answer: "Yes, you can cancel your appointment anytime before the consultation begins. Please check the specific doctor's profile for their refund policy if applicable."
  }
];

export function HelpEcosystem({ className }: { className?: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className={cn("w-full bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden", className)}>
      <div className="p-6 md:p-8 bg-white border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 mb-2">
            <HelpCircle className="w-6 h-6 text-primary" />
            Support & Transparency
          </h3>
          <p className="text-sm font-medium text-slate-500 max-w-md">
            We believe in 100% operational transparency. Find answers to common questions or reach out to our dedicated support team.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <a href="tel:8235351897" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors shadow-sm w-full sm:w-auto">
            <Phone className="w-4 h-4" /> Call Support
          </a>
          <a href="https://wa.me/918235351897" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-sm transition-colors border border-emerald-200 w-full sm:w-auto">
            <MessageCircle className="w-4 h-4" /> WhatsApp Us
          </a>
        </div>
      </div>

      <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Frequently Asked Questions</h4>
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={cn(
                "rounded-2xl border transition-all duration-200 overflow-hidden",
                openIdx === idx ? "bg-white border-primary/20 shadow-sm" : "bg-white/50 border-slate-200 hover:bg-white"
              )}
            >
              <button 
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
              >
                <span className="font-bold text-slate-800 text-sm pr-4">{faq.question}</span>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0", openIdx === idx && "rotate-180")} />
              </button>
              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-4 pb-4 pt-1 text-sm text-slate-600 font-medium leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div>
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
             <span style={{ color: '#4A90D9' }}>Jivni</span><span style={{ color: '#529C60' }}>Care</span> Trust Guarantee
           </h4>
           <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-[calc(100%-2rem)] flex flex-col justify-center">
             <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center mb-5 shadow-sm">
               <Logo className="w-8 h-8" />
             </div>
             <h5 className="text-lg font-black text-slate-900 mb-3">Your Health, Our Priority</h5>
             <p className="text-sm text-slate-600 leading-relaxed font-medium mb-6">
               <span style={{ color: '#4A90D9' }}>Jivni</span><span style={{ color: '#529C60' }}>Care</span> operates under strict medical and data compliance. We ensure that every clinic listed on our platform meets high standards of hygiene, professionalism, and medical authenticity.
             </p>
             <div className="space-y-3 mt-auto">
               <div className="flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-emerald-500" /> <span className="text-xs font-bold text-slate-700">ISO 27001 Data Security</span>
               </div>
               <div className="flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-emerald-500" /> <span className="text-xs font-bold text-slate-700">100% Refund on Clinic No-Show</span>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
