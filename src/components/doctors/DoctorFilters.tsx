"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { HEALTHCARE_SPECIALTIES } from "@/lib/seo/metadata";
import { ChevronDown, X, SlidersHorizontal, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DoctorFiltersProps {
  selectedSpecialties: string[];
  onSpecialtyToggle: (specId: string) => void;
  onClearAll?: () => void;
  totalResults?: number;
  // New props for functional filtering
  availability: string;
  maxFee: string;
  minExperience: string;
  onFilterChange: (updates: Record<string, string | null>) => void;
}

const FEE_RANGES = [
  { label: "Any Fee", value: "10000" },
  { label: "Under ₹500", value: "500" },
  { label: "Under ₹1000", value: "1000" },
];

const EXPERIENCE_RANGES = [
  { label: "Any Experience", value: "0" },
  { label: "5+ Years", value: "5" },
  { label: "10+ Years", value: "10" },
  { label: "15+ Years", value: "15" },
];

export function DoctorFilters({
  selectedSpecialties,
  onSpecialtyToggle,
  onClearAll,
  totalResults = 0,
  availability,
  maxFee,
  minExperience,
  onFilterChange,
}: DoctorFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);

  // Count active filters (excluding defaults)
  const activeFilterCount = [
    selectedSpecialties.length > 0,
    availability !== 'any',
    maxFee !== '10000',
    minExperience !== '0'
  ].filter(Boolean).length;

  const visibleSpecialties = showAllSpecialties ? HEALTHCARE_SPECIALTIES : HEALTHCARE_SPECIALTIES.slice(0, 6);

  const FilterContent = () => (
    <div className="space-y-6" role="group" aria-label="Filter doctors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </h3>
        {activeFilterCount > 0 && onClearAll && (
          <button
            onClick={onClearAll}
            className="text-xs font-bold text-primary hover:text-[#184a7a] flex items-center gap-1 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <Separator className="bg-slate-100" />

      {/* Availability */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Availability</label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Any Day", value: "any" },
            { label: "Today", value: "today" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange({ availability: opt.value })}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                availability === opt.value 
                ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                : "bg-white text-slate-600 border-slate-200 hover:border-primary/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* Specialty */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Specialty</label>
        <div className="space-y-1" role="radiogroup" aria-label="Filter by specialty">
          {visibleSpecialties.map((spec) => {
            const isChecked = selectedSpecialties.includes(spec);
            return (
              <div
                key={spec}
                onClick={() => onSpecialtyToggle(spec)}
                className={`flex items-center gap-3 cursor-pointer p-2.5 rounded-xl transition-all ${isChecked ? "bg-primary/5" : "hover:bg-slate-50"}`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isChecked ? "bg-primary border-primary" : "bg-white border-slate-300"}`}>
                  {isChecked && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className={`text-sm font-bold ${isChecked ? "text-primary" : "text-slate-600"}`}>{spec}</span>
              </div>
            );
          })}
        </div>
        {HEALTHCARE_SPECIALTIES.length > 6 && (
          <button
            onClick={() => setShowAllSpecialties(!showAllSpecialties)}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-[#184a7a] pl-2 transition-colors"
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${showAllSpecialties ? "rotate-180" : ""}`} />
            {showAllSpecialties ? "Show less" : `Show all ${HEALTHCARE_SPECIALTIES.length}`}
          </button>
        )}
      </div>

      <Separator className="bg-slate-100" />

      {/* Experience */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Min. Experience</label>
        <div className="space-y-1">
          {EXPERIENCE_RANGES.map((range) => (
            <label key={range.value} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 transition-all">
              <input
                type="radio"
                name="experience"
                checked={minExperience === range.value}
                onChange={() => onFilterChange({ minExperience: range.value })}
                className="text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <span className={`text-sm font-bold ${minExperience === range.value ? "text-slate-900" : "text-slate-600"}`}>{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* Fee Range */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consultation Fee</label>
        <div className="space-y-1">
          {FEE_RANGES.map((range) => (
            <label key={range.value} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 transition-all">
              <input
                type="radio"
                name="fee"
                checked={maxFee === range.value}
                onChange={() => onFilterChange({ maxFee: range.value })}
                className="text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <span className={`text-sm font-bold ${maxFee === range.value ? "text-slate-900" : "text-slate-600"}`}>{range.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Filters */}
      <aside className="hidden md:block w-64 shrink-0 sticky top-28 self-start">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Filters Toggle Button */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-sm">
        <Button
          onClick={() => setShowMobileFilters(true)}
          className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-sm shadow-2xl flex items-center justify-center gap-3 group active:scale-95 transition-all"
        >
          <SlidersHorizontal className="w-5 h-5" />
          FILTERS & SORT
          {activeFilterCount > 0 && (
            <span className="bg-primary text-white text-[10px] px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Mobile Filters Sheet */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            key="mobile-filters"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-[60] flex flex-col justify-end"
          >
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-white rounded-t-[2.5rem] max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <h2 className="font-black text-xl text-slate-900 uppercase tracking-tight">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="overflow-y-auto p-6 pb-24">
                <FilterContent />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pt-12">
                <Button
                  className="w-full h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-blue-900/20"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Show {totalResults} Doctors
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
