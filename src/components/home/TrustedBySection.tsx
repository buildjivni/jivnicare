"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const PARTNERS = [
  { name: "Ruban Memorial Hospital", logo: "https://www.rubanmemorialhospital.com/images/logo.png" },
  { name: "Paras Global Hospital", logo: "https://www.parashospitals.com/images/paras-hospital-logo.png" },
  { name: "Mediversal Hospital", logo: "https://mediversal.in/wp-content/uploads/2022/08/logo-1.png" },
  { name: "Ford Hospital", logo: "https://fordhospital.com/images/logo.png" },
  { name: "Apollo Clinics", logo: "https://www.apolloclinic.com/assets/images/logo.png" },
  { name: "Jeevandeep Hospital", logo: "https://jeevandeephospital.com/wp-content/uploads/2019/12/jeevandeep-hospital-logo.png" },
];

export function TrustedBySection() {
  return (
    <div className="w-full max-w-full overflow-hidden box-border bg-white py-4 md:py-8 border-b border-slate-100">
      <div className="container mx-auto px-4 w-full max-w-5xl box-border">
        <div className="flex flex-col items-center gap-4 md:gap-6">
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] text-center">
            Trusted by Top Hospitals
          </p>
          
          <div className="w-full flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {[
              { name: "Paras", icon: "🛡️" },
              { name: "Medanta", icon: "❤️" },
              { name: "Ruban", icon: "🩺" },
              { name: "Apollo", icon: "✨" },
              { name: "Ford", icon: "🏥" }
            ].map((p) => (
              <div key={p.name} className="flex items-center gap-1.5 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                 <span className="text-xs md:text-sm font-black text-slate-800 tracking-tighter uppercase italic">
                   {p.name}
                 </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
