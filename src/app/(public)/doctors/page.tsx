"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lightbulb, AlertCircle, Loader2 } from "lucide-react";
import { DoctorFilters, DoctorList } from "@/components/doctors";
import { trackSearch } from "@/lib/search-engine";
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

  // ── Fetch from API ─────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("q", search);
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
    
    return () => {
      isMounted = false;
    };
  }, [search, selectedSpecialties]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleSpecialtyToggle = (specId: string) => {
    const isSelected = selectedSpecialties.includes(specId);
    const newSpecs = isSelected
      ? selectedSpecialties.filter(id => id !== specId)
      : [...selectedSpecialties, specId];
    setSelectedSpecialties(newSpecs);
    
    // Update URL without refresh
    const params = new URLSearchParams(searchParams.toString());
    if (newSpecs.length > 0) {
      params.set("specialty", newSpecs.join(','));
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

        {/* ── Did You Mean Banner ── */}
        {searchResult?.didYouMean && search.trim() && (
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
        {searchResult?.isFuzzy && search.trim() && searchResult.results.length > 0 && (
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
            totalResults={searchResult?.results.length || 0}
          />
          
          {isLoading ? (
             <div className="flex-1 flex justify-center items-center py-20">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
    <Suspense fallback={
      <div className="bg-[#f7f9fc] min-h-[calc(100vh-64px)]">
        <div className="container mx-auto px-4 max-w-6xl py-6 md:py-10">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-64 shrink-0 space-y-4">
              <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="flex-1 space-y-4">
               <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-6" />
            </div>
          </div>
        </div>
      </div>
    }>
      <DoctorListingContent />
    </Suspense>
  );
}

