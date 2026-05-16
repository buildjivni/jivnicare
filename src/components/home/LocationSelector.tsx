"use client";

import { useState, useEffect } from "react";
import { MapPin, ChevronDown, Crosshair, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef } from "react";

const CITIES = [
  "Patna",
  "Gaya",
  "Muzaffarpur",
  "Bhagalpur",
  "Darbhanga",
  "Purnia",
];

export function LocationSelector({ className, buttonClassName }: { className?: string, buttonClassName?: string }) {
  const [location, setLocation] = useState("Patna");
  const [isLocating, setIsLocating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Optionally load from local storage
    const saved = localStorage.getItem("jivnicare_location");
    if (saved) setLocation(saved);
  }, []);

  const [isOpen, setIsOpen] = useState(false);
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
    // Simulate location detection delay
    setTimeout(() => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation("Patna");
            localStorage.setItem("jivnicare_location", "Patna");
            setIsLocating(false);
            setIsOpen(false);
          },
          (err) => {
            console.warn("Location access denied or failed", err);
            setIsLocating(false);
          },
          { timeout: 5000 }
        );
      } else {
        setIsLocating(false);
      }
    }, 800);
  };

  const handleSelect = (city: string) => {
    setLocation(city);
    localStorage.setItem("jivnicare_location", city);
    setIsOpen(false);
  };

  if (!mounted) return null;

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
            <span className="text-sm md:text-[15px] font-black text-slate-800 truncate">{location}</span>
            <span className="text-[10px] md:text-xs text-slate-400 font-medium truncate">Bihar, India</span>
          </div>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-[100%] left-0 mt-2 w-full md:w-[240px] rounded-2xl p-2 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 z-[120] animate-in fade-in slide-in-from-top-2 duration-200 origin-top">
          <button
            onClick={handleAutoDetect}
            disabled={isLocating}
            className="w-full flex items-center gap-3 px-3 py-2.5 mb-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl transition-colors text-sm font-bold"
          >
            {isLocating ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Crosshair className="w-4 h-4 shrink-0" />}
            {isLocating ? "Detecting location..." : "Use Current Location"}
          </button>
          
          <div className="h-px bg-slate-100 my-1" />
          
          <div className="max-h-[240px] overflow-y-auto scrollbar-hide py-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Popular Cities</div>
            {CITIES.map((city) => (
              <button 
                key={city}
                onClick={() => handleSelect(city)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium text-slate-700 hover:bg-slate-50 focus:bg-slate-50 transition-colors"
              >
                {city}
                {location === city && <Check className="w-4 h-4 text-emerald-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
