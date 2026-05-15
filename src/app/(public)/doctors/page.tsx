"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lightbulb, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DoctorFilters, DoctorList } from "@/components/doctors";
import { SmartSearchBar } from "@/components/shared/SmartSearchBar";
import { trackSearch } from "@/lib/search-engine";
import type { SearchResult } from "@/lib/search-engine";

// ── Rich Skeleton Loading ────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="bg-[#f7f9fc] min-h-[calc(100vh-64px)]">
      <div className="container mx-auto px-4 max-w-6xl py-6 md:py-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Skeleton */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4 animate-pulse">
              <div className="h-4 w-20 bg-slate-200 rounded-full" />
              <div className="h-px bg-slate-100" />
              <div className="space-y-2.5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-slate-100 shrink-0" />
                    <div className="h-3 rounded-full bg-slate-100 flex-1" style={{ width: `${60 + (i * 7) % 35}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Results Skeleton */}
          <div className="flex-1 space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-6 w-44 bg-slate-200 rounded-full animate-pulse" />
                <div className="h-3 w-36 bg-slate-100 rounded-full animate-pulse" />
              </div>
              <div className="h-10 w-36 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="h-32 bg-gradient-to-r from-slate-100 to-slate-50" />
                  <div className="p-5 space-y-3">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 -mt-14 rounded-full bg-slate-200 border-4 border-white shrink-0" />
                      <div className="flex-1 space-y-2 pt-3">
                        <div className="h-4 bg-slate-200 rounded-full w-3/4" />
                        <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                      </div>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full w-full" />
                    <div className="h-12 bg-primary/8 rounded-2xl w-full mt-2" />
                  </div>
                </div>
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

  // Accept both ?q= (SmartSearchBar) and ?query= (filter bar)
  const queryParam = searchParams.get("q") || searchParams.get("query") || "";
  const specialtyParam = searchParams.get("specialty") || "";

  const [search, setSearch] = useState(queryParam);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    specialtyParam ? [specialtyParam] : []
  );
  const [prevQuery, setPrevQuery] = useState(queryParam);
  const [prevSpec, setPrevSpec] = useState(specialtyParam);

  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state when URL params change (e.g., browser back/forward)
  if (queryParam !== prevQuery) {
    setPrevQuery(queryParam);
    setSearch(queryParam);
  }
  if (specialtyParam !== prevSpec) {
    setPrevSpec(specialtyParam);
    setSelectedSpecialties(specialtyParam ? [specialtyParam] : []);
  }

  // ── Fetch from API ──────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        const districtParam = searchParams.get("district");
        if (districtParam) params.set("district", districtParam);
        selectedSpecialties.forEach(spec => params.append("specialty", spec));

        const res = await fetch(`/api/public/search?${params.toString()}`);
        if (!res.ok) throw new Error("Search failed");

        const data: SearchResult = await res.json();

        if (isMounted) {
          setSearchResult(data);
          if (search.trim()) {
            trackSearch(search, data.results.length, data.isFuzzy);
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
  }, [search, selectedSpecialties]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSpecialtyToggle = (specId: string) => {
    const isSelected = selectedSpecialties.includes(specId);
    const newSpecs = isSelected
      ? selectedSpecialties.filter(id => id !== specId)
      : [...selectedSpecialties, specId];
    setSelectedSpecialties(newSpecs);

    const params = new URLSearchParams(searchParams.toString());
    if (newSpecs.length > 0) {
      params.set("specialty", newSpecs.join(","));
    } else {
      params.delete("specialty");
    }
    router.replace(`/doctors?${params.toString()}`, { scroll: false });
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedSpecialties([]);
    router.replace("/doctors", { scroll: false });
  };

  const handleDidYouMean = () => {
    if (!searchResult?.didYouMean) return;
    setSearch(searchResult.didYouMean);
    const params = new URLSearchParams({ query: searchResult.didYouMean });
    router.push(`/doctors?${params}`);
  };

  return (
    <div className="bg-[#f7f9fc] min-h-[calc(100vh-64px)]">
      <div className="container mx-auto px-4 max-w-6xl py-6 md:py-10">

        {/* ── Alert Banners ──────────────────────────────────── */}
        <AnimatePresence>
          {searchResult?.didYouMean && search.trim() && (
            <motion.div
              key="did-you-mean"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3"
            >
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
            </motion.div>
          )}

          {searchResult?.isFuzzy && search.trim() && searchResult.results.length > 0 && (
            <motion.div
              key="fuzzy"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3"
            >
              <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
              <p className="text-sm text-blue-800">
                Showing closest available doctors for &quot;<strong>{search}</strong>&quot;
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile Search Bar ──────────────────────────────── */}
        <div className="block md:hidden mb-6">
          <SmartSearchBar district="Patna" className="w-full shadow-sm" />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <DoctorFilters
            selectedSpecialties={selectedSpecialties}
            onSpecialtyToggle={handleSpecialtyToggle}
            onClearAll={handleClearFilters}
            totalResults={searchResult?.results.length || 0}
          />

          {isLoading ? (
            <div className="flex-1 flex flex-col gap-5">
              {/* Mini loading header */}
              <div className="flex items-center justify-between animate-pulse">
                <div className="space-y-2">
                  <div className="h-6 w-40 bg-slate-200 rounded-full" />
                  <div className="h-3 w-32 bg-slate-100 rounded-full" />
                </div>
                <div className="h-10 w-36 bg-white rounded-2xl border border-slate-100" />
              </div>
              {/* Spinner + label */}
              <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-3xl border border-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-slate-500">Finding best doctors for you…</p>
              </div>
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
  );
}

export default function DoctorListing() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DoctorListingContent />
    </Suspense>
  );
}
