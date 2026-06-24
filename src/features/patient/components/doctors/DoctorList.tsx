"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DoctorCard } from "@/components/shared/DoctorCard";
import { Button } from "@/components/ui/button";
import type { Doctor } from "@/types";
import { Stethoscope, SearchX, MapPin, Sparkles, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { getStableKey } from "@/lib/getStableKey";
import { useSearchParams } from "next/navigation";

function DoctorRequestForm() {
  const searchParams = useSearchParams();
  const searchedDistrict = searchParams.get("district") || "";

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState(searchedDistrict);
  const [specialty, setSpecialty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (searchedDistrict) {
      setCity(searchedDistrict);
    }
  }, [searchedDistrict]);

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
          source: searchedDistrict ? "coming-soon-location" : "search-zero-results",
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
        className="p-8 rounded-[2rem] bg-emerald-50 border border-emerald-100 text-center max-w-md mx-auto mt-8 shadow-sm"
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
    <div className="bg-slate-50/50 rounded-[2.5rem] p-6 md:p-8 border border-slate-100 max-w-md mx-auto text-left mt-10 shadow-inner">
      <h4 className="text-lg font-heading font-black text-slate-900 mb-2 tracking-tight">
        {searchedDistrict ? `JivniCare is coming to ${searchedDistrict}` : "Doctor nahi mila? Hamein batayein"}
      </h4>
      <p className="text-xs text-slate-500 font-bold mb-6 leading-relaxed">
        {searchedDistrict 
          ? `Hum jald hi ${searchedDistrict} mein launch ho rahe hain. Niche apni details enter karein taaki launch hote hi hum aapko notify kar sakein.`
          : "Aap jis doctor ya specialty ko dhoondh rahe hain, unki details niche likhein. Hum jald se jald unhe platform par lane ki koshish karenge."
        }
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mobile Number (Required)</label>
          <input
            type="tel"
            required
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Aapka Naam (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Amit Kumar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">City / locality (Required)</label>
            <input
              type="text"
              required
              placeholder="e.g. Patna"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Specialty (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Cardiologist"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold transition-all"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-[#184a7a] text-white font-black text-lg shadow-xl shadow-primary/10 flex items-center justify-center gap-2 mt-2 transition-all active:scale-[0.98]"
        >
          {isSubmitting ? "Submitting..." : searchedDistrict ? "Notify Me On Launch" : "Submit Doctor Request"}
        </Button>
      </form>
    </div>
  );
}

interface DoctorListProps {
  doctors: Doctor[];
  onClearFilters: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export function DoctorList({ doctors, onClearFilters, hasMore, isLoadingMore, onLoadMore }: DoctorListProps) {
  return (
    <div className="flex-1 w-full min-w-0">
      {/* ── Empty State ────────────────────────────────────────────────────────── */}
      {doctors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 px-6">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <SearchX className="w-10 h-10 text-slate-300" />
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-primary/5 rounded-full"
            />
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No results match your filters</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed">
            We couldn&apos;t find any doctors matching these criteria. Try adjusting your filters or search for something more general.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-12">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-left flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-black text-emerald-900 uppercase tracking-wider">Tip</p>
                <p className="text-sm text-emerald-700 font-medium mt-1">Try removing one filter at a time to see more results.</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 text-left flex items-start gap-4">
              <MapPin className="w-6 h-6 text-blue-500 shrink-0" />
              <div>
                <p className="text-sm font-black text-blue-900 uppercase tracking-wider">Location</p>
                <p className="text-sm text-blue-700 font-medium mt-1">Check nearby districts if no doctors are available in yours.</p>
              </div>
            </div>
          </div>

          <Button
            onClick={onClearFilters}
            className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-blue-900/20 flex items-center gap-2 mx-auto"
          >
            <RefreshCcw className="w-5 h-5" />
            Reset All Filters
          </Button>

          <DoctorRequestForm />
        </div>
      ) : (
        /* ── Results Grid ────────────────────────────────────────────────────── */
        <div className="flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-8">
              {doctors.map((doctor, idx) => (
                <motion.div 
                  key={getStableKey(doctor, idx)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(idx * 0.04, 0.25) }}
                >
                  <DoctorCard doctor={doctor} priority={idx < 4} />
                </motion.div>
              ))}
          </div>
          
          {/* Load More Pagination */}
          {hasMore && (
            <div className="flex justify-center pb-24 md:pb-12">
              <Button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                variant="outline"
                className="h-12 px-8 rounded-full border-2 border-primary/20 text-primary font-bold hover:bg-primary/5 transition-all shadow-sm"
              >
                {isLoadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                    Loading...
                  </div>
                ) : (
                  "Load More Doctors"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
