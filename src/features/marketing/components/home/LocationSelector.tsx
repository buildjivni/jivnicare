"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, ChevronDown, Crosshair, Loader2, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { BIHAR_DISTRICTS } from "@/lib/constants/districts";
import { useLocationStore } from "@/features/location/store/useLocationStore";
import { useRouter } from "next/navigation";

export function LocationSelector({ className, buttonClassName, onSelectAction }: { className?: string, buttonClassName?: string, onSelectAction?: () => void }) {
  const router = useRouter();
  const { district, hasHydrated, setDistrict, setCoordinates } = useLocationStore();
  const [isLocating, setIsLocating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAutoDetect = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates(pos.coords.latitude, pos.coords.longitude);
          setIsLocating(false);
          setIsOpen(false);
          if (onSelectAction) onSelectAction();
          else if (window.location.pathname === "/") router.push("/doctors");
        },
        (err) => {
          console.warn("Location access denied or failed", err);
          setIsLocating(false);
        },
        { timeout: 2000, maximumAge: 60000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleSelect = (city: string) => {
    setDistrict(city);
    setIsOpen(false);
    if (onSelectAction) onSelectAction();
  };

  if (!hasHydrated) return null; // Avoid hydration flicker

  const filteredDistricts = BIHAR_DISTRICTS.filter(d => 
    d.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayLocation = district || "Select your district";

  return (
    <div className={cn("flex flex-col items-start w-full relative", className)} ref={dropdownRef}>
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Current Location</span>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full md:w-auto min-w-[200px] h-12 md:h-14 bg-white hover:bg-slate-50 border border-slate-200 hover:border-primary/30 rounded-2xl px-4 transition-all duration-200 active:scale-[0.98] shadow-sm shadow-slate-100/50",
          buttonClassName
        )}
        aria-label="Select location"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex flex-col items-start truncate">
            <span className={cn("text-sm md:text-[15px] font-black truncate", !district ? "text-primary" : "text-slate-800")}>
              {displayLocation}
            </span>
            <span className="text-[10px] md:text-xs text-slate-400 font-medium truncate">Bihar, India</span>
          </div>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-[100%] left-0 mt-2 w-full md:w-[260px] rounded-2xl p-2 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 z-[120] animate-in fade-in slide-in-from-top-2 duration-200 origin-top">
          <button
            onClick={handleAutoDetect}
            disabled={isLocating}
            className="w-full flex items-center gap-3 px-3 py-2.5 mb-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl transition-colors text-sm font-bold"
          >
            {isLocating ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Crosshair className="w-4 h-4 shrink-0" />}
            {isLocating ? "Detecting location..." : "Use Current Location (GPS)"}
          </button>
          
          <div className="px-2 mb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                autoFocus
              />
            </div>
          </div>
          
          <div className="h-px bg-slate-100 my-1" />
          
          <div className="max-h-[240px] overflow-y-auto scrollbar-hide py-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">All Districts</div>
            {filteredDistricts.length === 0 ? (
              <p className="text-xs text-slate-500 px-3 py-2">No districts found.</p>
            ) : (
              filteredDistricts.map((city) => (
                <button 
                  key={city}
                  onClick={() => handleSelect(city)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium text-slate-700 hover:bg-slate-50 focus:bg-slate-50 transition-colors"
                >
                  {city}
                  {district === city && <Check className="w-4 h-4 text-emerald-500" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
