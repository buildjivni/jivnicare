"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lightbulb, AlertCircle } from "lucide-react";
import { DOCTORS, SPECIALTIES } from "@/data/mock-data";
import { DoctorFilters, DoctorList } from "@/components/doctors";
import { searchDoctors, trackSearch } from "@/lib/search-engine";
import type { SearchResult } from "@/lib/search-engine";

function DoctorListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Accept both ?q= (SmartSearchBar) and ?query= (filter bar)
  const queryParam = searchParams.get("q") || searchParams.get("query") || "";
  const specialtyParam = searchParams.get("specialty") || "";

  const [search, setSearch] = useState(queryParam);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    specialtyParam ? [specialtyParam] : []
  );
  const [prevQuery, setPrevQuery] = useState(queryParam);
  const [prevSpec, setPrevSpec] = useState(specialtyParam);

  // Sync state when URL params change (e.g., browser back/forward)
  if (queryParam !== prevQuery) {
    setPrevQuery(queryParam);
    setSearch(queryParam);
  }
  if (specialtyParam !== prevSpec) {
    setPrevSpec(specialtyParam);
    setSelectedSpecialties(specialtyParam ? [specialtyParam] : []);
  }

  // ── Smart Search ─────────────────────────────────────────────
  // First apply specialty filter, then run smart search on result
  const specialtyFiltered = DOCTORS.filter(doctor => {
    if (selectedSpecialties.length === 0) return true;
    return selectedSpecialties.some(specId => {
      const specName = SPECIALTIES.find(s => s.id === specId)?.name || specId;
      return (
        doctor.specialty.toLowerCase() === specName.toLowerCase() ||
        doctor.specialty.toLowerCase() === specId.toLowerCase()
      );
    });
  });

  const searchResult: SearchResult = searchDoctors(search, specialtyFiltered);
  const filteredDoctors = searchResult.results;

  // Track searches for analytics
  useEffect(() => {
    if (search.trim()) {
      trackSearch(search, filteredDoctors.length, searchResult.isFuzzy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleSpecialtyToggle = (specId: string) => {
    const isSelected = selectedSpecialties.includes(specId);
    const newSpecs = isSelected
      ? selectedSpecialties.filter(id => id !== specId)
      : [...selectedSpecialties, specId];
    setSelectedSpecialties(newSpecs);
    const params = new URLSearchParams(searchParams.toString());
    if (newSpecs.length === 1) params.set("specialty", newSpecs[0]);
    else params.delete("specialty");
    router.push(`/doctors?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedSpecialties([]);
    router.push("/doctors");
  };

  const handleDidYouMean = () => {
    if (!searchResult.didYouMean) return;
    setSearch(searchResult.didYouMean);
    const params = new URLSearchParams({ query: searchResult.didYouMean });
    router.push(`/doctors?${params}`);
  };

  return (
    <div className="bg-[#f7f9fc] min-h-[calc(100vh-64px)]">

      <div className="container mx-auto px-4 max-w-6xl py-6 md:py-10">

        {/* ── Did You Mean Banner ── */}
        {searchResult.didYouMean && search.trim() && (
          <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-800">
              Did you mean:{" "}
              <button
                onClick={handleDidYouMean}
                className="font-bold underline underline-offset-2 hover:text-amber-900 transition-colors"
              >
                {searchResult.didYouMean}
              </button>
              ?
            </p>
          </div>
        )}

        {/* ── Fuzzy Match Notice ── */}
        {searchResult.isFuzzy && search.trim() && filteredDoctors.length > 0 && (
          <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
            <p className="text-sm text-blue-800">
              Showing closest available doctors for &quot;<strong>{search}</strong>&quot;
            </p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          <DoctorFilters
            selectedSpecialties={selectedSpecialties}
            onSpecialtyToggle={handleSpecialtyToggle}
            onClearAll={handleClearFilters}
            totalResults={filteredDoctors.length}
          />
          <DoctorList
            doctors={filteredDoctors}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>
    </div>
  );
}

export default function DoctorListing() {
  return (
    <Suspense fallback={
      <div className="bg-[#f7f9fc] min-h-[calc(100vh-64px)]">
        <div className="container mx-auto px-4 max-w-6xl py-6 md:py-10">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters Skeleton */}
            <div className="w-full md:w-64 shrink-0 space-y-4">
              <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="space-y-3 pt-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            {/* List Skeleton */}
            <div className="flex-1 space-y-4">
              <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-6" />
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6">
                  <div className="w-24 h-24 bg-slate-200 rounded-2xl shrink-0 animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 w-3/4 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="w-full md:w-32 flex flex-col justify-end">
                    <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <DoctorListingContent />
    </Suspense>
  );
}
