"use client";

import { DoctorCard } from "@/components/shared/DoctorCard";
import { Button } from "@/components/ui/button";
import type { Doctor } from "@/types";
import { Stethoscope, SortAsc } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DoctorListProps {
  doctors: Doctor[];
  onClearFilters: () => void;
}

type SortKey = "relevance" | "rating" | "fee_low" | "fee_high";

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Relevance", value: "relevance" },
  { label: "Top Rated", value: "rating" },
  { label: "Fee: Low to High", value: "fee_low" },
  { label: "Fee: High to Low", value: "fee_high" },
];

const EMPTY_SUGGESTIONS = [
  "Cardiologist", "General Physician", "Dermatologist",
  "Pediatrician", "Orthopedist",
];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 animate-pulse">
      <div className="h-40 bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="flex gap-3">
          <div className="w-20 h-20 -mt-14 rounded-full bg-slate-200 border-4 border-white shrink-0" />
          <div className="flex-1 space-y-2 pt-2">
            <div className="h-4 bg-slate-200 rounded-full w-3/4" />
            <div className="h-3 bg-slate-100 rounded-full w-1/2" />
          </div>
        </div>
        <div className="h-3 bg-slate-100 rounded-full w-full" />
        <div className="h-3 bg-slate-100 rounded-full w-2/3" />
        <div className="h-10 bg-slate-100 rounded-2xl w-full mt-2" />
      </div>
    </div>
  );
}

function sortDoctors(doctors: Doctor[], sort: SortKey): Doctor[] {
  const toNum = (fee: string) => parseInt(fee.replace(/[^0-9]/g, ""), 10) || 0;
  switch (sort) {
    case "rating": return [...doctors].sort((a, b) => b.rating - a.rating);
    case "fee_low": return [...doctors].sort((a, b) => toNum(a.fee) - toNum(b.fee));
    case "fee_high": return [...doctors].sort((a, b) => toNum(b.fee) - toNum(a.fee));
    default: return doctors;
  }
}

export function DoctorList({ doctors, onClearFilters }: DoctorListProps) {
  const [sort, setSort] = useState<SortKey>("relevance");
  const [sortOpen, setSortOpen] = useState(false);
  const router = useRouter();
  const isLoading = false; // Future: wire to actual loading state

  const sorted = sortDoctors(doctors, sort);
  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label ?? "Relevance";

  return (
    <div className="flex-1 space-y-5 w-full min-w-0">
      {/* ── Header Row ─── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            {doctors.length > 0
              ? <><span className="text-[#205E98]">{doctors.length}</span> Doctors Found</>
              : "No Doctors Found"
            }
          </h1>
          {doctors.length > 0 && (
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Showing results for Patna, Bihar</p>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-2xl hover:border-[#205E98]/30 hover:text-[#205E98] transition-all shadow-sm"
            aria-label="Sort results"
          >
            <SortAsc className="w-4 h-4" />
            {currentSortLabel}
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl z-20 min-w-[180px] py-2 overflow-hidden">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSort(opt.value); setSortOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${sort === opt.value ? "text-[#205E98] bg-[#205E98]/6" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Skeleton Loading ─── */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Empty State ─── */}
      {!isLoading && doctors.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-slate-300" aria-hidden />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Doctors Found</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
            We couldn&apos;t find any doctors matching your search. Try these popular specialties:
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {EMPTY_SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="px-3 py-1.5 text-xs font-semibold text-[#205E98] bg-[#205E98]/6 border border-[#205E98]/10 rounded-full hover:bg-[#205E98]/10 transition-colors"
                onClick={() => {
                  const params = new URLSearchParams({ query: s });
                  router.push(`/doctors?${params}`);
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            className="border-slate-200 text-slate-700 font-bold hover:bg-slate-50 rounded-2xl h-10 px-5"
            onClick={onClearFilters}
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {/* ── Results Grid ─── */}
      {!isLoading && sorted.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 pb-24 md:pb-0">
          {sorted.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
}
