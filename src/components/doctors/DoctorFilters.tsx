"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { SPECIALTIES } from "@/data/mock-data";
import { ChevronDown, X, SlidersHorizontal, Search } from "lucide-react";

interface DoctorFiltersProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedSpecialties: string[];
  onSpecialtyToggle: (specId: string) => void;
  onClearAll?: () => void;
  totalResults?: number;
}

const FEE_RANGES = [
  { label: "Under ₹500", id: "under500" },
  { label: "₹500 – ₹1000", id: "500to1000" },
  { label: "Above ₹1000", id: "above1000" },
];

export function DoctorFilters({
  search,
  onSearchChange,
  selectedSpecialties,
  onSpecialtyToggle,
  onClearAll,
}: DoctorFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);

  const activeFilterCount = selectedSpecialties.length;
  const visibleSpecialties = showAllSpecialties ? SPECIALTIES : SPECIALTIES.slice(0, 6);

  const FilterContent = () => (
    <div className="space-y-5" role="search" aria-label="Filter doctors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#205E98]" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-[#205E98] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </h3>
        {activeFilterCount > 0 && onClearAll && (
          <button
            onClick={onClearAll}
            className="text-xs font-bold text-[#205E98] hover:text-[#184a7a] flex items-center gap-1 transition-colors"
            aria-label="Clear all filters"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <label htmlFor="filter-search" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Search by Name
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="filter-search"
            type="text"
            placeholder="Doctor, symptom, clinic…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#205E98] focus:ring-2 focus:ring-[#205E98]/15 h-11 text-sm text-slate-800 placeholder:text-slate-400 transition-all"
            value={search}
            onChange={onSearchChange}
            aria-label="Search doctor by name or condition"
          />
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* Specialty */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Specialty</label>
        <div className="space-y-1.5" role="group" aria-label="Filter by specialty">
          {visibleSpecialties.map((spec) => {
            const isChecked = selectedSpecialties.includes(spec.id) || selectedSpecialties.includes(spec.name.toLowerCase());
            return (
              <label
                key={spec.id}
                className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all ${isChecked ? "bg-[#205E98]/6 border border-[#205E98]/15" : "hover:bg-slate-50 border border-transparent"}`}
              >
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-[#205E98] focus:ring-[#205E98] w-4 h-4 cursor-pointer"
                  checked={isChecked}
                  onChange={() => onSpecialtyToggle(spec.id)}
                  aria-label={`Filter by ${spec.name}`}
                />
                <span className={`text-sm font-medium ${isChecked ? "text-[#205E98]" : "text-slate-600"}`}>{spec.name}</span>
              </label>
            );
          })}
        </div>
        {SPECIALTIES.length > 6 && (
          <button
            onClick={() => setShowAllSpecialties(!showAllSpecialties)}
            className="flex items-center gap-1 text-xs font-bold text-[#205E98] hover:text-[#184a7a] mt-1 transition-colors"
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${showAllSpecialties ? "rotate-180" : ""}`} />
            {showAllSpecialties ? "Show less" : `Show all ${SPECIALTIES.length}`}
          </button>
        )}
      </div>

      <Separator className="bg-slate-100" />

      {/* Availability */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Availability</label>
        <div className="space-y-1.5" role="group" aria-label="Filter by availability">
          {[
            { label: "Any Day", value: "any" },
            { label: "Available Today", value: "today" },
            { label: "Tomorrow", value: "tomorrow" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-all border border-transparent">
              <input
                type="radio"
                name="avail"
                className="text-[#205E98] focus:ring-[#205E98] w-4 h-4 cursor-pointer"
                defaultChecked={opt.value === "any"}
                aria-label={`Show doctors available ${opt.label}`}
              />
              <span className="text-sm font-medium text-slate-600">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* Fee Range */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consultation Fee</label>
        <div className="space-y-1.5" role="group" aria-label="Filter by consultation fee">
          {FEE_RANGES.map((range) => (
            <label key={range.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-all border border-transparent">
              <input
                type="radio"
                name="fee"
                className="text-[#205E98] focus:ring-[#205E98] w-4 h-4 cursor-pointer"
                aria-label={`Show doctors with fee ${range.label}`}
              />
              <span className="text-sm font-medium text-slate-600">{range.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Filters */}
      <aside className="hidden md:block w-64 shrink-0 sticky top-28 self-start" aria-label="Doctor filters">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Filters Toggle Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 bg-gradient-to-t from-[#f7f9fc] to-transparent pointer-events-none">
        <Button
          onClick={() => setShowMobileFilters(true)}
          className="w-full h-12 rounded-2xl bg-[#205E98] text-white font-bold text-sm shadow-lg shadow-[#205E98]/30 pointer-events-auto flex items-center gap-2"
          aria-label="Open filters"
          aria-expanded={showMobileFilters}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters & Sort
          {activeFilterCount > 0 && (
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Mobile Filters Sheet */}
      {showMobileFilters && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto px-5 pt-4 pb-8">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10 pb-3 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-900">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterContent />
            <Button
              className="w-full h-12 rounded-2xl bg-[#205E98] text-white font-bold mt-5"
              onClick={() => setShowMobileFilters(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
