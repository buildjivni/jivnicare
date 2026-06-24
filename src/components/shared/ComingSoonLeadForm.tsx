"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ComingSoonLeadFormProps {
  defaultCity?: string;
  defaultSpecialty?: string;
  source?: string;
}

export function ComingSoonLeadForm({
  defaultCity = "",
  defaultSpecialty = "",
  source = "coming-soon-location"
}: ComingSoonLeadFormProps) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState(defaultCity);
  const [specialty, setSpecialty] = useState(defaultSpecialty);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (defaultCity) setCity(defaultCity);
  }, [defaultCity]);

  useEffect(() => {
    if (defaultSpecialty) setSpecialty(defaultSpecialty);
  }, [defaultSpecialty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error("Kripya valid 10-digit mobile number enter karein");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/public/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name: name.trim() || undefined,
          city: city.trim() || undefined,
          specialty: specialty.trim() || undefined,
          roleInterest: "PATIENT",
          source,
        }),
      });

      if (!res.ok) throw new Error();
      setIsSuccess(true);
      toast.success("Aapki request record ho gayi hai!");
    } catch (err) {
      toast.error("Request submit karne mein error aayi. Kripya baad mein try karein.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-[2rem] bg-emerald-50 border border-emerald-100 text-center max-w-md mx-auto shadow-sm"
      >
        <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
          <Sparkles className="w-8 h-8 text-white animate-pulse" />
        </div>
        <h4 className="text-lg font-black text-slate-900 mb-2">Thank you! Request recorded.</h4>
        <p className="text-sm text-slate-600 font-medium leading-relaxed">
          Hamein aapki details mil gayi hain. Jaise hi verified doctors onboard honge, hum aapko SMS ke jariye notify karenge.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-slate-50/50 rounded-[2.5rem] p-6 md:p-8 border border-slate-100 max-w-md mx-auto text-left shadow-inner">
      <h4 className="text-lg font-heading font-black text-slate-900 mb-2 tracking-tight">
        {city ? `JivniCare is coming to ${city}` : "Doctor nahi mila? Hamein batayein"}
      </h4>
      <p className="text-xs text-slate-500 font-bold mb-6 leading-relaxed">
        Hum jald hi {city || "naye districts"} mein launch ho rahe hain. Niche apni details enter karein taaki launch hote hi hum aapko notify kar sakein.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Mobile Number (Required)
          </label>
          <input
            type="tel"
            required
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="w-full h-11 px-4 text-sm bg-white border border-slate-100 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-bold"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Aapka Naam (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Ramesh Kumar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 px-4 text-sm bg-white border border-slate-100 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            City / Locality (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Patna"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full h-11 px-4 text-sm bg-white border border-slate-100 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Desired Doctor Specialty (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Pediatrician, Cardiologist"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full h-11 px-4 text-sm bg-white border border-slate-100 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold transition-all shadow-md shadow-primary/10 mt-2"
        >
          {isSubmitting ? "Submitting..." : "Get Launch Notification"}
        </Button>
      </form>
    </div>
  );
}
