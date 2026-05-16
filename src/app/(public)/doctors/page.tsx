"use client";

import { useState, Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lightbulb, AlertCircle, X, ArrowUpDown, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DoctorFilters, DoctorList } from "@/components/doctors";
import { trackSearch } from "@/lib/search-engine";
import type { SearchResult } from "@/lib/search-engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Rich Skeleton Loading ────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="bg-[#f7f9fc] min-h-[calc(100vh-64px)] page-enter">
      <div className="container mx-auto px-4 max-w-6xl py-6 md:py-10">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="hidden md:block w-64 shrink-0">
            <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4">
              <div className="h-4 w-20 skeleton-shimmer rounded-full" />
              <div className="h-px bg-slate-100" />
              <div className="space-y-2.5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded skeleton-shimmer shrink-0" />
                    <div className="h-3 rounded-full skeleton-shimmer flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
          <div className="flex-1 space-y-5">
            <div className="h-10 w-44 skeleton-shimmer rounded-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 skeleton-shimmer rounded-[2rem]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Listing Content ──────────────────────────────────────────────────────
function DoctorListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Search State (Synced with URL) ──────────────────────────────────────────
  const query = searchParams.get("q") || "";
  const district = searchParams.get("district") || "";
  const sort = searchParams.get("sort") || "recommended";
  const availability = searchParams.get("availability") || "any";
  const maxFee = searchParams.get("maxFee") || "10000";
  const minExperience = searchParams.get("minExperience") || "0";
  const selectedSpecialties = useMemo(() => {
    const s = searchParams.get("specialty");
    return s ? s.split(",") : [];
  }, [searchParams]);

  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch from API ──────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/public/search?${searchParams.toString()}`);
        if (!res.ok) throw new Error("Search failed");

        const data: SearchResult = await res.json();

        if (isMounted) {
          setSearchResult(data);
          if (query.trim()) {
            trackSearch(query, data.results.length, data.isFuzzy);
          }
        }
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchResults();
    return () => { isMounted = false; };
  }, [searchParams]);

  // ── Handlers (Update URL only) ──────────────────────────────────────────────
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    router.replace(`/doctors?${params.toString()}`, { scroll: false });
  };

  const handleSpecialtyToggle = (spec: string) => {
    const isCurrentlySelected = selectedSpecialties.includes(spec);
    updateParams({ specialty: isCurrentlySelected ? null : spec });
  };

  const handleClearFilters = () => {
    router.replace("/doctors", { scroll: false });
  };

  const handleRemoveChip = (key: string) => {
    updateParams({ [key]: null });
  };

  const handleDidYouMean = () => {
    if (!searchResult?.didYouMean) return;
    updateParams({ q: searchResult.didYouMean });
  };

  const activeChips = useMemo(() => {
    const chips: { id: string; label: string; type?: string; value?: string }[] = [];
    if (availability !== 'any') chips.push({ id: 'availability', label: availability === 'today' ? 'Available Today' : 'Tomorrow' });
    if (maxFee !== '10000') chips.push({ id: 'maxFee', label: `Fee under ₹${maxFee}` });
    if (minExperience !== '0') chips.push({ id: 'minExperience', label: `${minExperience}+ Years Experience` });
    selectedSpecialties.forEach(s => chips.push({ id: `spec-${s}`, label: s, type: 'specialty', value: s }));
    return chips;
  }, [availability, maxFee, minExperience, selectedSpecialties]);

  return (
    <div className="bg-[#f7f9fc] min-h-[calc(100vh-64px)]">
      <div className="container mx-auto px-4 max-w-6xl py-6 md:py-10">

        {/* ── Alert Banners ──────────────────────────────────── */}
        <AnimatePresence>
          {searchResult?.didYouMean && query.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3"
            >
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-800">
                Did you mean: <button onClick={handleDidYouMean} className="font-bold underline">{searchResult.didYouMean}</button>?
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row gap-6">
          <DoctorFilters
            selectedSpecialties={selectedSpecialties}
            onSpecialtyToggle={handleSpecialtyToggle}
            onClearAll={handleClearFilters}
            totalResults={searchResult?.results.length || 0}
            // Pass all filter values for state sync
            availability={availability}
            maxFee={maxFee}
            minExperience={minExperience}
            onFilterChange={updateParams}
          />

          <div className="flex-1 space-y-6">
            {/* ── Active Filters & Sort ───────────────────────── */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {query ? `Search results for "${query}"` : district ? `Doctors in ${district}` : 'Top Verified Doctors'}
                  </h1>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">
                    {isLoading ? 'Searching...' : `${searchResult?.results.length || 0} specialists found`}
                  </p>
                </div>
                
                {/* Sort Dropdown (Mock/Simple for now) */}
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-xs font-bold text-slate-400 uppercase tracking-wider">Sort by</span>
                  <select 
                    value={sort}
                    onChange={(e) => updateParams({ sort: e.target.value })}
                    className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 appearance-none pr-10 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em] bg-[right_0.75rem_center] bg-no-repeat"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="wait_time">Lowest Wait Time</option>
                    <option value="experience">Most Experienced</option>
                    <option value="fee_low">Lowest Fee</option>
                  </select>
                </div>
              </div>

              {/* Filter Chips */}
              <AnimatePresence>
                {activeChips.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-2 pb-1"
                  >
                    {activeChips.map((chip) => (
                      <Badge 
                        key={chip.id}
                        variant="secondary"
                        className="pl-3 pr-1.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 group hover:border-primary/30 transition-all"
                      >
                        {chip.label}
                        <button 
                          onClick={() => chip.type === 'specialty' ? handleSpecialtyToggle(chip.value!) : handleRemoveChip(chip.id)}
                          className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    <button 
                      onClick={handleClearFilters}
                      className="text-xs font-bold text-primary hover:underline px-2"
                    >
                      Clear all
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-48 skeleton-shimmer rounded-[2rem] bg-white border border-slate-100" />
                ))}
              </div>
            ) : (
              <DoctorList
                doctors={searchResult?.results || []}
                onClearFilters={handleClearFilters}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorListing() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DoctorListingContent />
    </Suspense>
  );
}
