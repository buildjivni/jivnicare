"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, HeartPulse, Stethoscope, Baby, Activity, Siren, 
  MapPin, Clock, Star, ChevronRight, Search, X, Loader2
} from "lucide-react";
import { LocationSelector } from "./LocationSelector";
import { useLocationStore } from "@/features/location/store/useLocationStore";
import { cn } from "@/lib/utils/utils";
import { getCanonicalImageUrl } from "@/lib/imageHelper";

const SPECIALTIES_CARDS = [
  {
    label: "General Physician",
    icon: <Stethoscope className="w-6 h-6" />,
    iconBg: "bg-blue-50 text-[#205E98] border border-blue-100",
    actionText: "Book Visit",
    query: "General Physician"
  },
  {
    label: "Cardiologist",
    icon: <HeartPulse className="w-6 h-6" />,
    iconBg: "bg-emerald-50 text-[#4A8C4A] border border-emerald-100",
    actionText: "Book Visit",
    query: "Cardiologist"
  },
  {
    label: "Dermatologist",
    icon: <Activity className="w-6 h-6" />,
    iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
    actionText: "Book Visit",
    query: "Dermatologist"
  },
  {
    label: "Pediatrician",
    icon: <Baby className="w-6 h-6" />,
    iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
    actionText: "Book Visit",
    query: "Pediatrician"
  },
  {
    label: "Dentist",
    icon: <Stethoscope className="w-6 h-6" />,
    iconBg: "bg-sky-50 text-sky-600 border border-sky-100",
    actionText: "Book Visit",
    query: "Dentist"
  },
  {
    label: "Emergency Support",
    icon: <Siren className="w-6 h-6 text-rose-500 animate-pulse" />,
    iconBg: "bg-rose-50 text-rose-600 border border-rose-100",
    actionText: "Get Care Now",
    query: "Emergency"
  }
];

function displayName(name: string): string {
  if (!name) return "";
  const trimmed = name.trim();
  return /^Dr\.?\s/i.test(trimmed) ? trimmed : `Dr. ${trimmed}`;
}

function getDoctorUrl(doctor: any): string {
  const slug = doctor.publicSlug || doctor.slug;
  if (slug && !/^[0-9a-f-]{36}$/i.test(slug)) return `/doctors/${slug}`;
  return `/doctors/${doctor.id}`;
}

export function HeroSection({ featuredDoctor }: { featuredDoctor?: any }) {
  const { district } = useLocationStore();
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Live search fetch with 300ms debounce
  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/public/search?q=${encodeURIComponent(trimmedQuery)}&district=${district || ""}&limit=3`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setHasSearched(true);
        }
      } catch (err) {
        console.error("Hero live search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, district]);

  // Default featured doctor data
  const defaultDoc = featuredDoctor || {
    id: "default-featured",
    name: "Alok Kumar Sharma",
    specialty: "General Physician",
    clinic: "Sharma Clinic & Diagnostic",
    location: "Jamui",
    experience: "15",
    image: "",
    availabilityStatus: "OPD Open",
    isQueueActive: true,
    fee: "₹200",
  };

  const handleSpecialtyClick = (specialtyQuery: string) => {
    setQuery(specialtyQuery);
    // Smooth scroll to the results area
    const el = document.getElementById("search-results-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full max-w-full pt-10 md:pt-16 pb-12 overflow-hidden bg-white box-border" aria-label="Find Doctors">
      {/* Calm Medical Background Accents */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-slate-50/80 to-transparent -z-10" />
      <div className="absolute top-[20%] right-[-10%] w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute top-[40%] left-[-10%] w-72 h-72 bg-emerald-50/30 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4 max-w-3xl relative z-10 box-border text-center space-y-8">
        
        {/* Header Badging */}
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-black uppercase tracking-widest shadow-sm w-fit"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% Verified OPD Network
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]"
          >
            Find and Book <br />
            <span className="text-primary">Verified Doctors.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-slate-500 font-medium max-w-xl leading-relaxed"
          >
            Skip the long clinic lines. Book your appointment securely in under 60 seconds with verified local healthcare professionals.
          </motion.p>
        </div>

        {/* ── PART 1: LOCATION + SEARCH BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full bg-white p-3 rounded-[2.5rem] shadow-[0_15px_50px_-15px_rgba(0,0,0,0.08)] border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center gap-2 relative z-20 text-left"
        >
          {/* Location Selector */}
          <div className="w-full md:w-auto md:min-w-[200px] shrink-0">
            <LocationSelector 
              className="w-full" 
              buttonClassName="border-transparent shadow-none hover:shadow-none hover:border-transparent bg-transparent hover:bg-slate-50/50"
            />
          </div>
          
          <div className="hidden md:block w-px h-10 bg-slate-200 mx-1 shrink-0" />
          <div className="md:hidden w-full h-px bg-slate-100 my-1" />

          {/* Search Input */}
          <div className="flex-1 min-w-0 relative flex items-center h-12 md:h-14">
            <Search className="absolute left-3 w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search doctors by name or specialty..."
              className="w-full h-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 pl-11 pr-10 text-slate-900 font-bold placeholder:text-slate-400 text-sm md:text-base"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* ── PART 2: SEARCH RESULTS OR FEATURED DOCTOR CARD ── */}
        <div id="search-results-section" className="w-full pt-2">
          <AnimatePresence mode="wait">
            {isLoading ? (
              /* Loading Skeleton state */
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full bg-white border border-slate-100 rounded-3xl p-6 shadow-md flex items-center justify-center gap-3 min-h-[140px]"
              >
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <span className="text-slate-500 font-bold text-sm">Searching verified doctors...</span>
              </motion.div>
            ) : hasSearched ? (
              results.length > 0 ? (
                /* Results List */
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-left pl-2">
                    Search Results ({results.length})
                  </p>
                  <div className="grid gap-4">
                    {results.map((doctor) => {
                      const docUrl = getDoctorUrl(doctor);
                      return (
                        <div
                          key={doctor.id}
                          className="bg-white border border-slate-100 rounded-3xl p-5 shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left"
                        >
                          <div className="flex gap-4 items-center min-w-0 flex-1">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50/50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-primary font-black text-lg shadow-sm">
                              {doctor.image ? (
                                <Image
                                  src={getCanonicalImageUrl(doctor.image, doctor.updatedAt) || ""}
                                  alt={doctor.name}
                                  width={56}
                                  height={56}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                doctor.name.charAt(0)
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-black text-slate-900 text-lg leading-tight truncate">
                                {displayName(doctor.name)}
                              </h3>
                              <p className="text-sm font-bold text-primary mt-0.5">{doctor.specialty}</p>
                              <p className="text-xs text-slate-400 font-medium mt-0.5 line-clamp-1">
                                {doctor.clinic || "Clinic partner"} ({doctor.location}) • {doctor.experience ? `${doctor.experience}+ yrs exp` : "Experienced"}
                              </p>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                            <div className="text-left sm:text-right">
                              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Fee</p>
                              <p className="text-base font-black text-slate-800">{doctor.fee || "₹200"}</p>
                            </div>
                            <Link href={docUrl} className="w-auto">
                              <button className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-1 transition-all duration-200 active:scale-95">
                                Book Visit
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                /* No Results State */
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-slate-50/50 border border-slate-200 rounded-3xl p-8 text-center space-y-4"
                >
                  <p className="text-sm text-slate-500 font-bold leading-relaxed">
                    No verified doctors found matching "<span className="text-slate-800">{query}</span>" {district ? `in ${district}` : ""}.
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setQuery("")}
                      className="px-5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-sm"
                    >
                      Clear Search
                    </button>
                    <Link href="/doctors">
                      <button className="px-5 py-2 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
                        Browse All Doctors
                      </button>
                    </Link>
                  </div>
                </motion.div>
              )
            ) : (
              /* Default/Initial State: Featured Doctor Card */
              <motion.div
                key="featured"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-left space-y-3"
              >
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">
                  Featured OPD Partner
                </p>
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  {/* Decorative card background accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10" />

                  <div className="flex gap-4 items-center">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50/50 border border-slate-100 overflow-hidden shadow-sm flex items-center justify-center text-primary font-black text-2xl">
                        {defaultDoc.image ? (
                          <Image
                            src={getCanonicalImageUrl(defaultDoc.image, defaultDoc.updatedAt) || ""}
                            alt={defaultDoc.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          defaultDoc.name.charAt(0)
                        )}
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-emerald-500 border-4 border-white rounded-full" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black text-primary uppercase tracking-wider bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                          Featured
                        </span>
                        <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      </div>
                      <h3 className="font-black text-slate-900 text-xl leading-tight">
                        {displayName(defaultDoc.name)}
                      </h3>
                      <p className="text-sm font-bold text-primary mt-0.5">{defaultDoc.specialty}</p>
                      <p className="text-xs text-slate-400 font-medium mt-1">
                        {defaultDoc.clinic} ({defaultDoc.location}) • {defaultDoc.experience}+ Yrs Exp
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3.5 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">OPD Consultation Fee</p>
                      <p className="text-lg font-black text-slate-800">{defaultDoc.fee || "₹200"}</p>
                    </div>
                    <Link href={getDoctorUrl(defaultDoc)}>
                      <button className="bg-primary hover:bg-primary/95 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-primary/10 flex items-center gap-1.5 transition-all duration-200 active:scale-95">
                        Book Instant Appointment
                        <ChevronRight className="w-4.5 h-4.5" />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── PART 3: SPECIALTY SEARCH TRIGGER GRID ── */}
        <div className="w-full pt-6 md:pt-10">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-black text-slate-900 uppercase tracking-wider mb-6 text-center"
          >
            Which Specialist Do You Need to See?
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full"
          >
            {SPECIALTIES_CARDS.map((card) => (
              <div
                key={card.label}
                onClick={() => handleSpecialtyClick(card.query)}
                className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3.5 shadow-soft hover:shadow-premium hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 group cursor-pointer"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm", card.iconBg)}>
                  {card.icon}
                </div>
                <div className="flex flex-col items-center md:items-start text-center md:text-left min-w-0">
                  <span className="text-sm md:text-base font-bold text-slate-800 tracking-tight leading-snug truncate w-full">
                    {card.label}
                  </span>
                  <span className="text-xs font-bold text-primary flex items-center gap-0.5 mt-0.5 group-hover:text-primary/80 transition-colors">
                    {card.actionText} <ChevronRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
