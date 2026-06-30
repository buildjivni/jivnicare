"use client";

import { useState, useEffect } from "react";
import { MapPin, Crosshair, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { useLocationStore } from "@/features/location/store/useLocationStore";
import { useRouter } from "next/navigation";

export function LocationSelector({ 
  className, 
  buttonClassName, 
  onSelectAction 
}: { 
  className?: string;
  buttonClassName?: string;
  onSelectAction?: () => void;
}) {
  const router = useRouter();
  const { district, hasHydrated, setDistrict, setCoordinates } = useLocationStore();
  const [isLocating, setIsLocating] = useState(false);
  const [inputValue, setInputValue] = useState("Jamui");

  useEffect(() => {
    if (district !== undefined) {
      setInputValue(district || "Jamui");
    }
  }, [district]);

  // Set default to Jamui if store is hydrated and empty
  useEffect(() => {
    if (hasHydrated && !district) {
      setDistrict("Jamui");
    }
  }, [hasHydrated, district, setDistrict]);

  const handleGPSDetect = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoordinates(latitude, longitude);
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              {
                headers: { "Accept-Language": "en" }
              }
            );
            if (res.ok) {
              const data = await res.json();
              const addr = data.address;
              const detectedCity = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || addr.county || "";
              if (detectedCity) {
                setDistrict(detectedCity);
                setInputValue(detectedCity);
                if (onSelectAction) {
                  onSelectAction();
                } else if (window.location.pathname === "/") {
                  router.push("/doctors");
                }
              }
            }
          } catch (err) {
            console.warn("Nominatim reverse geocoding failed:", err);
          } finally {
            setIsLocating(false);
          }
        },
        (err) => {
          console.warn("Location access denied or failed", err);
          setIsLocating(false);
        },
        { timeout: 5000, maximumAge: 60000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleBlurOrSubmit = () => {
    const val = inputValue.trim();
    if (val !== district) {
      setDistrict(val);
      if (onSelectAction) {
        onSelectAction();
      }
    }
  };

  return (
    <div className={cn("flex flex-col items-start w-full relative", className)}>
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
        Current Location
      </span>
      <div className="relative flex items-center w-full">
        <div className="absolute left-4 z-10 w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4 text-emerald-600" />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlurOrSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleBlurOrSubmit();
            }
          }}
          placeholder="Enter city or district..."
          className={cn(
            "w-full h-12 md:h-14 bg-white border border-slate-200 focus:border-primary/40 focus:ring-2 focus:ring-primary/5 rounded-2xl pl-14 pr-12 text-sm md:text-[15px] font-black text-slate-800 placeholder:text-slate-400 transition-all shadow-sm shadow-slate-100/50",
            buttonClassName
          )}
        />
        <button
          type="button"
          onClick={handleGPSDetect}
          disabled={isLocating}
          title="Auto-detect location using GPS"
          className="absolute right-3 p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Crosshair className="w-4 h-4" />
          )}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mt-2 ml-1 text-xs">
        <span className="text-slate-400 font-medium">Active Locations:</span>
        <button
          type="button"
          onClick={() => {
            setInputValue("Jamui");
            setDistrict("Jamui");
            if (onSelectAction) onSelectAction();
            else if (window.location.pathname === "/") router.push("/doctors");
          }}
          className="text-primary font-bold hover:underline"
        >
          Jamui
        </button>
        <span className="text-slate-300 font-medium">•</span>
        <button
          type="button"
          onClick={() => {
            setInputValue("Deoghar");
            setDistrict("Deoghar");
            if (onSelectAction) onSelectAction();
            else if (window.location.pathname === "/") router.push("/doctors");
          }}
          className="text-primary font-bold hover:underline"
        >
          Deoghar
        </button>
      </div>
    </div>
  );
}
