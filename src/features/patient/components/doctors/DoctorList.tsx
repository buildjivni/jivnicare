"use client";

import { DoctorCard } from "@/components/shared/DoctorCard";
import { Button } from "@/components/ui/button";
import type { Doctor } from "@/types";
import { Stethoscope, SearchX, MapPin, Sparkles, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

interface DoctorListProps {
  doctors: Doctor[];
  onClearFilters: () => void;
}

export function DoctorList({ doctors, onClearFilters }: DoctorListProps) {
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
        </div>
      ) : (
        /* ── Results Grid ────────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-24 md:pb-4">
            {doctors.map((doctor, idx) => (
              <motion.div 
                key={doctor.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: Math.min(idx * 0.04, 0.25) }}
              >
                <DoctorCard doctor={doctor} />
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}
