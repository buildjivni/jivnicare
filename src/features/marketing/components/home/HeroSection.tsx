"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, X, ChevronRight, MapPin, 
  Loader2, AlertCircle, ArrowRight, ShieldCheck,
  Sparkles, Siren, AlertTriangle
} from "lucide-react";
import { useLocationStore } from "@/features/location/store/useLocationStore";
import { cn } from "@/lib/utils/utils";
import { DoctorCard } from "@/components/shared/DoctorCard";
function getDoctorUrl(doctor: any): string {
  const slug = doctor.publicSlug || doctor.slug;
  if (slug && !/^[0-9a-f-]{36}$/i.test(slug)) return `/doctors/${slug}`;
  return `/doctors/${doctor.id}`;
}

const PRIORITY_SPECIALTIES = [
  { name: 'General Physician', icon: '🩺', id: 'general-physician' },
  { name: 'Dentist', icon: '🦷', id: 'dentist' },
  { name: 'Dermatologist & Cosmetologist', icon: '🔬', id: 'dermatologist-cosmetologist' },
  { name: 'Gynecologist & Obstetrician', icon: '🤱', id: 'gynecologist-obstetrician' },
  { name: 'Pediatrician', icon: '👶', id: 'pediatrician' },
  { name: 'Orthopedic Surgeon', icon: '🦴', id: 'orthopedic-surgeon' },
  { name: 'ENT Specialist', icon: '👂', id: 'ent-specialist' },
  { name: 'Ophthalmologist', icon: '👁️', id: 'ophthalmologist' },
  { name: 'Cardiologist', icon: '❤️', id: 'cardiologist' },
  { name: 'Diabetologist', icon: '💉', id: 'diabetologist' },
  { name: 'Psychiatrist & Psychologist', icon: '💭', id: 'psychiatrist-psychologist' },
  { name: 'Physiotherapist', icon: '🏃', id: 'physiotherapist' },
  { name: 'Neurologist', icon: '🧠', id: 'neurologist' },
  { name: 'Gastroenterologist', icon: '🫁', id: 'gastroenterologist' },
  { name: 'Urologist', icon: '🧬', id: 'urologist' },
  { name: 'Pulmonologist', icon: '🫀', id: 'pulmonologist' },
  { name: 'Endocrinologist', icon: '⚗️', id: 'endocrinologist' },
  { name: 'Nephrologist', icon: '💊', id: 'nephrologist' },
  { name: 'Oncologist', icon: '🎗️', id: 'oncologist' },
  { name: 'Rheumatologist', icon: '🦵', id: 'rheumatologist' },
  { name: 'Dietitian & Nutritionist', icon: '🥗', id: 'dietitian-nutritionist' },
  { name: 'Sexologist', icon: '🔥', id: 'sexologist' },
  { name: 'Hair & Skin Specialist', icon: '💇', id: 'hair-skin-specialist' },
  { name: 'Ayurvedic Doctor', icon: '🌿', id: 'ayurvedic-doctor' },
  { name: 'Homeopathic Doctor', icon: '💧', id: 'homeopathic-doctor' },
  { name: 'Unani Specialist', icon: '🏺', id: 'unani-specialist' },
  { name: 'Siddha Specialist', icon: '🍂', id: 'siddha-specialist' },
  { name: 'Naturopath', icon: '🧘', id: 'naturopath' },
  { name: 'Geriatrician', icon: '🧓', id: 'geriatrician' },
  { name: 'Emergency Medicine Specialist', icon: '🚨', id: 'emergency-medicine-specialist' }
];

const QUICK_CHIPS_COUNT = 7;
const QUICK_SPECIALTIES = PRIORITY_SPECIALTIES.slice(0, QUICK_CHIPS_COUNT);

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export function HeroSection({ initialLocation }: { initialLocation?: string | null }) {
  const { district, setDistrict } = useLocationStore();
  const router = useRouter();

  // Location Selector State (Cookie-driven for zero-flicker SSR)
  const [activeLocation, setActiveLocation] = useState(initialLocation || district || "Jamui");

  // Sync state with Zustand when store hydrates
  useEffect(() => {
    if (district) {
      setActiveLocation(district);
    } else if (initialLocation) {
      setDistrict(initialLocation);
    }
  }, [district, initialLocation, setDistrict]);

  const handleLocationChange = (loc: string) => {
    setActiveLocation(loc);
    setDistrict(loc);
    document.cookie = `jivni_district=${encodeURIComponent(loc)}; path=/; max-age=31536000; SameSite=Lax`;
  };

  // Search Input & Dropdown Focus States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Selected Specialty for Inline Results Carousel
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Live autocompletes
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 200);

  // Click outside search container to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch autocompletes live
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearchingSuggestions(true);
    let isMounted = true;

    const url = `/api/public/search?q=${encodeURIComponent(debouncedQuery)}&district=${encodeURIComponent(activeLocation)}&limit=7`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const results = data.results || [];
        const list: any[] = [];

        // 1. Doctor matches (link directly to bookings)
        results.forEach((doc: any) => {
          list.push({
            type: "doctor",
            text: doc.name,
            hint: `${doc.specialty} • ${doc.clinicName}`,
            value: doc
          });
        });

        // 2. Specialty matches (expand inline)
        PRIORITY_SPECIALTIES.forEach(spec => {
          if (spec.name.toLowerCase().includes(debouncedQuery.toLowerCase()) && !list.some(item => item.type === "specialty" && item.text === spec.name)) {
            list.push({
              type: "specialty",
              text: spec.name,
              hint: "Inline results available",
              value: spec.name
            });
          }
        });

        setSuggestions(list);
      })
      .catch(err => {
        console.error("Suggestions fetch error:", err);
      })
      .finally(() => {
        if (isMounted) setIsSearchingSuggestions(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, activeLocation]);

  // Fetch inline carousel results on Specialty/Emergency selection
  useEffect(() => {
    if (!selectedSpecialty) {
      setDoctors([]);
      setHasFetched(false);
      return;
    }

    let isMounted = true;
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const isEmergencyQuery = selectedSpecialty === "Emergency";
        const url = isEmergencyQuery
          ? `/api/public/search?district=${encodeURIComponent(activeLocation)}&isEmergency=true&limit=10`
          : `/api/public/search?speciality=${encodeURIComponent(selectedSpecialty)}&district=${encodeURIComponent(activeLocation)}&limit=10`;
        
        const res = await fetch(url);
        if (res.ok && isMounted) {
          const data = await res.json();
          setDoctors(data.results || []);
          setHasFetched(true);
        }
      } catch (err) {
        console.error("Hero live specialty fetch failed:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDoctors();
    return () => {
      isMounted = false;
    };
  }, [selectedSpecialty, activeLocation]);

  // Selection actions
  const handleSelectSpecialty = (specName: string) => {
    setSelectedSpecialty(specName);
    setSearchQuery(specName);
    setIsSearchFocused(false);
  };

  const handleSelectEmergency = () => {
    setSelectedSpecialty("Emergency");
    setSearchQuery("Emergency Care");
    setIsSearchFocused(false);
  };

  const handleSelectSymptom = (specName: string, sympLabel: string) => {
    setSelectedSpecialty(specName);
    setSearchQuery(sympLabel);
    setIsSearchFocused(false);
  };

  const handleSelectDoctor = (doc: any) => {
    setIsSearchFocused(false);
    router.push(getDoctorUrl(doc));
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase() === "emergency" || trimmed.toLowerCase() === "emergency care") {
      handleSelectEmergency();
      return;
    }

    // If it perfectly matches a specialty, select it inline
    const specMatch = PRIORITY_SPECIALTIES.find(s => s.name.toLowerCase() === trimmed.toLowerCase());
    if (specMatch) {
      handleSelectSpecialty(specMatch.name);
      return;
    }

    setIsSearchFocused(false);
    router.push(`/doctors?q=${encodeURIComponent(trimmed)}`);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedSpecialty("");
    setDoctors([]);
    setHasFetched(false);
    setSuggestions([]);
  };

  // Scroll helper
  const handleScrollToGrid = () => {
    const el = document.getElementById("specialties");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full pt-12 md:pt-20 pb-14 bg-white overflow-hidden text-slate-800" aria-label="Find Doctors">
      {/* Visual background elements */}
      <div className="absolute top-0 inset-x-0 h-[450px] bg-gradient-to-b from-slate-50/70 to-transparent -z-10" />
      <div className="absolute top-[10%] right-[-10%] w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute top-[30%] left-[-10%] w-72 h-72 bg-emerald-50/20 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4 max-w-4xl space-y-8 relative z-10">
        
        {/* Central Core Booking Panel Stack */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-5 sm:p-7 space-y-6 max-w-xl mx-auto">
          
          {/* ── BOX 1: LOCATION SEGMENTED SELECTOR ── */}
          <div className="space-y-1.5 text-left">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Location
            </span>
            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={() => handleLocationChange("Jamui")}
                className={cn(
                  "flex-1 h-11 md:h-12 rounded-2xl text-xs md:text-sm font-black border transition-all flex items-center justify-center gap-1.5 active:scale-95",
                  activeLocation === "Jamui"
                    ? "bg-[#5696C7] text-white border-[#5696C7] shadow-sm shadow-[#5696C7]/15"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                )}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                Jamui
              </button>
              <button
                type="button"
                onClick={() => handleLocationChange("Deoghar")}
                className={cn(
                  "flex-1 h-11 md:h-12 rounded-2xl text-xs md:text-sm font-black border transition-all flex items-center justify-center gap-1.5 active:scale-95",
                  activeLocation === "Deoghar"
                    ? "bg-[#5696C7] text-white border-[#5696C7] shadow-sm shadow-[#5696C7]/15"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                )}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                Deoghar
              </button>
            </div>
          </div>

          {/* ── BOX 2: UNIFIED SEARCH INPUT ── */}
          <div className="space-y-1.5 text-left relative" ref={searchContainerRef}>
            <label htmlFor="unified-search" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Search Doctors or Specialties
            </label>
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
              <Search className="absolute left-4 w-5 h-5 text-slate-400 shrink-0 pointer-events-none" />
              <input
                id="unified-search"
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedSpecialty(""); // Clear inline carousel when typing new query
                }}
                placeholder="Search doctors, specialty, symptom, or emergency..."
                className="w-full h-12 md:h-14 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#5696C7]/40 focus:ring-2 focus:ring-[#5696C7]/5 rounded-2xl pl-12 pr-12 text-sm md:text-[15px] font-bold text-slate-900 placeholder:text-slate-400 transition-all"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="Clear search query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Dropdown Suggestions Panel */}
            <AnimatePresence>
              {isSearchFocused && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-2 max-h-80 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2.5 space-y-3"
                >
                  {searchQuery.trim().length < 2 ? (
                    <>
                      {/* 1. Emergency option */}
                      <button
                        type="button"
                        onClick={() => handleSelectEmergency()}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-xl bg-red-500 flex items-center justify-center shrink-0">
                          <Siren className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-xs font-black text-red-700">Need Urgent Care? Search Emergency</p>
                          <p className="text-[10px] text-red-500 font-bold mt-0.5">Find 24/7 emergency-enabled clinics</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-red-400 shrink-0" />
                      </button>

                      {/* 2. Common Specialties */}
                      <div className="px-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Common Specialties</p>
                        <div className="flex flex-wrap gap-2">
                          {QUICK_SPECIALTIES.map(spec => (
                            <button
                              key={spec.id}
                              type="button"
                              onClick={() => handleSelectSpecialty(spec.name)}
                              className="h-8 px-3 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5"
                            >
                              <span>{spec.icon}</span>
                              {spec.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. Common Symptoms */}
                      <div className="px-4 pt-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Symptom Suggestions</p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: "Fever / Bukhar", q: "Bukhar", spec: "General Physician" },
                            { label: "Stomach Pain / Pet Dard", q: "Pet Dard", spec: "General Physician" },
                            { label: "Headache / Sir Dard", q: "Sir Dard", spec: "Neurologist" },
                            { label: "Cough / Khansi", q: "Khansi", spec: "General Physician" },
                            { label: "Itching / Khujli", q: "Khujli", spec: "Dermatologist & Cosmetologist" },
                          ].map(symp => (
                            <button
                              key={symp.q}
                              type="button"
                              onClick={() => handleSelectSymptom(symp.spec, symp.label)}
                              className="h-8 px-3 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5"
                            >
                              <span>🤒</span>
                              {symp.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Active searching state */}
                      {isSearchingSuggestions && (
                        <div className="px-4 py-2 flex items-center gap-2 text-slate-400 text-xs font-semibold">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Searching suggestions...
                        </div>
                      )}

                      {/* Matched suggestions list */}
                      {!isSearchingSuggestions && suggestions.length > 0 && (
                        <div className="divide-y divide-slate-100">
                          {suggestions.map((item, idx) => (
                            <button
                              key={`${item.type}-${idx}`}
                              type="button"
                              onClick={() => {
                                if (item.type === "doctor") {
                                  handleSelectDoctor(item.value);
                                } else if (item.type === "specialty") {
                                  handleSelectSpecialty(item.value);
                                }
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between"
                            >
                              <div>
                                <p className="text-sm font-bold text-slate-800">{item.text}</p>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">{item.hint}</p>
                              </div>
                              <span className={cn(
                                "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                                item.type === "doctor"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : "bg-[#5696C7]/10 text-[#5696C7] border-[#5696C7]/15"
                              )}>
                                {item.type}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* No suggestions or fallback press enter to search */}
                      {!isSearchingSuggestions && suggestions.length === 0 && (
                        <button
                          type="button"
                          onClick={() => handleSearchSubmit()}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-[#5696C7] hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Search className="w-3.5 h-3.5" />
                          Press Enter to search for "{searchQuery}"
                        </button>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RESULTS CAROUSEL AREA ── */}
        <div className="w-full pt-4">
          <AnimatePresence mode="wait">
            {!selectedSpecialty ? (
              <motion.div
                key="initial-placeholder"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl p-8 text-center max-w-xl mx-auto"
              >
                <Sparkles className="w-8 h-8 text-[#5696C7]/40 mx-auto mb-3" />
                <h4 className="text-slate-800 font-black text-sm mb-1">Discover Available Doctors</h4>
                <p className="text-xs text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">
                  Select your location and pick a specialty or symptom above to see live doctor queues in {activeLocation}.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="search-results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full space-y-6 pt-2"
              >
                {isLoading ? (
                  /* Premium Skeleton Loading State */
                  <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="shrink-0 snap-start w-[290px] sm:w-[320px] h-[360px] rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between p-4 animate-pulse"
                      >
                        <div className="h-[100px] w-full bg-slate-200 rounded-xl" />
                        <div className="space-y-2.5 mt-4">
                          <div className="h-5 w-2/3 bg-slate-200 rounded" />
                          <div className="h-4 w-1/2 bg-slate-200 rounded" />
                        </div>
                        <div className="h-10 w-full bg-slate-200 rounded-xl mt-auto" />
                      </div>
                    ))}
                  </div>
                ) : hasFetched && doctors.length > 0 ? (
                  /* Swipeable Carousel of Canonical Doctor Cards */
                  <div className="space-y-6">
                    <div className={cn(
                      "flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0",
                      doctors.length === 1 && "justify-center"
                    )}>
                      {doctors.map((doctor, idx) => (
                        <div
                          key={doctor.id}
                          className="shrink-0 snap-start w-[290px] sm:w-[320px] h-full"
                        >
                          <DoctorCard doctor={doctor} priority={idx < 2} />
                        </div>
                      ))}
                    </div>
                    
                    {/* View All Doctors CTA Button */}
                    <div className="flex justify-center pt-2">
                      <Link
                        href={selectedSpecialty === "Emergency"
                          ? `/doctors?isEmergency=true&district=${encodeURIComponent(activeLocation)}`
                          : `/doctors?specialty=${encodeURIComponent(selectedSpecialty)}&district=${encodeURIComponent(activeLocation)}`}
                      >
                        <button className="h-12 px-6 rounded-2xl bg-[#5696C7] hover:bg-[#3d7dae] text-white font-black text-sm flex items-center justify-center gap-1.5 shadow-md shadow-[#5696C7]/10 transition-all active:scale-95">
                          <span>Explore All {selectedSpecialty === "Emergency" ? "Emergency" : selectedSpecialty} Specialists in {activeLocation}</span>
                          <ChevronRight className="w-4.5 h-4.5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ) : hasFetched && doctors.length === 0 ? (
                  /* Friendly No Results Empty State */
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 max-w-lg mx-auto text-center space-y-4 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-slate-900 text-base">No Doctors Found</h3>
                      <p className="text-sm text-slate-600 font-medium">
                        Humare network mein abhi {activeLocation} par koi {selectedSpecialty === "Emergency" ? "emergency-enabled" : `verified ${selectedSpecialty}`} doctor nahi mila.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <button
                        onClick={handleScrollToGrid}
                        className="w-full sm:w-auto h-11 px-5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      >
                        Browse Other Specialties
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <Link href="/doctors" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto h-11 px-5 rounded-xl bg-[#5696C7] hover:bg-[#3d7dae] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1">
                          View All Doctors
                        </button>
                      </Link>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
