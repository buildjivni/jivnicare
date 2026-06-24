"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search, X, TrendingUp, Zap, ChevronRight, MapPin, Clock,
  Stethoscope, User, Sparkles, Mic, Activity, Thermometer, HeartPulse, Baby, Brain, Siren
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { generateLocalSuggestions, getTopSearches } from "@/lib/search/search-engine";
import type { LocalSuggestion } from "@/lib/search/search-engine";

// ── Types ─────────────────────────────────────────────────────────────────────
interface TrendingItem { query: string; count: number }

const TYPE_META = {
  specialty: { icon: <Stethoscope className="w-4 h-4" />, color: "text-primary bg-primary/10", label: "Specialty" },
  symptom:   { icon: <Activity className="w-4 h-4" />,    color: "text-amber-600 bg-amber-50",    label: "Symptom"  },
  doctor:    { icon: <User className="w-4 h-4" />,        color: "text-emerald-600 bg-emerald-50",label: "Doctor"   },
  location:  { icon: <MapPin className="w-4 h-4" />,      color: "text-slate-500 bg-slate-100",   label: "Location" },
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Quick Hints ───────────────────────────────────────────────────────────────
const QUICK_HINTS = [
  { label: "General Physician", q: "fever",       icon: <Thermometer className="w-3.5 h-3.5" /> },
  { label: "Cardiologist",      q: "heart",       icon: <HeartPulse className="w-3.5 h-3.5" /> },
  { label: "Pediatrician",      q: "child",       icon: <Baby className="w-3.5 h-3.5" /> },
  { label: "Neurologist",       q: "neuro",       icon: <Brain className="w-3.5 h-3.5" /> },
  { label: "Dentist",           q: "dentist",     icon: <Stethoscope className="w-3.5 h-3.5" /> },
  { label: "Emergency",         q: "emergency",   icon: <Siren className="w-3.5 h-3.5 text-destructive" /> },
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface SmartSearchBarProps {
  placeholder?: string;
  district?: string;
  compact?: boolean;
  className?: string;
  innerClassName?: string;
  disableFocusStyles?: boolean;
  onSearch?: (q: string) => void;
  autoFocus?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function SmartSearchBar({
  placeholder,
  district,
  compact = false,
  className,
  innerClassName,
  disableFocusStyles = false,
  onSearch,
  autoFocus = false,
}: SmartSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const initialQuery = searchParams?.get("q") || searchParams?.get("query") || "";
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<LocalSuggestion[]>([]);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);

  const debouncedQuery = useDebounce(query, 160);

  const isEmergency = /emerg|accid|icu|ambulan|urgent/i.test(query);
  const showPanel = focused && (query.length > 0 || recentSearches.length > 0 || trending.length > 0);

  // Placeholder cycling
  const PLACEHOLDERS = [
    "Search General Physicians, Cardiologists...",
    "Search symptoms like fever, headache...",
    "Find Top Verified Clinics & Hospitals...",
    "Search by doctor name (e.g. Dr. Sharma)...",
  ];
  const [phIdx, setPhIdx] = useState(0);
  useEffect(() => {
    if (focused) return;
    const t = setInterval(() => setPhIdx(i => (i + 1) % PLACEHOLDERS.length), 2800);
    return () => clearInterval(t);
   
  }, [focused]);

  // Load trending + recents on mount
  useEffect(() => {
    setTrending(getTopSearches(6));
    try {
      const stored = localStorage.getItem("jivnicare_recent_searches");
      if (stored) setRecentSearches(JSON.parse(stored).slice(0, 5));
    } catch { /* ignore */ }
  }, [district]);

  // Sync with URL
  useEffect(() => {
    const q = searchParams?.get("q") || searchParams?.get("query") || "";
     
    if (q) setQuery(q);
  }, [searchParams]);

  // Generate suggestions
  useEffect(() => {
     
    setSuggestions([]);
    if (!focused || debouncedQuery.length < 1) return;
    setIsLoading(true);
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 700);
    // Fetch suggestions from public search API (limit results to 7)
    const backendUrl = `/api/public/search?q=${encodeURIComponent(debouncedQuery)}${district ? `&district=${district}` : ""}&limit=7`;
    fetch(backendUrl, { signal: ctrl.signal })
      .then(r => r.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          const mapped: LocalSuggestion[] = data.results.map((d: any) => ({
            type: "doctor",
            text: d.name,
            hint: d.specialty
          }));
          // Add local specialty matches for better UX
          const localSpecs = generateLocalSuggestions(debouncedQuery, []);
          setSuggestions([...localSpecs.slice(0, 3), ...mapped]);
        } else {
          setSuggestions(generateLocalSuggestions(debouncedQuery, []));
        }
      })
      .catch(() => setSuggestions(generateLocalSuggestions(debouncedQuery, [])))
      .finally(() => { clearTimeout(timeout); setIsLoading(false); });
    return () => { ctrl.abort(); clearTimeout(timeout); };
  }, [debouncedQuery, focused, district]);
  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock scroll when search panel is open on mobile
  useEffect(() => {
    if (showPanel && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showPanel]);

  // Save + navigate
  const doSearch = useCallback((q: string) => {
    const t = q.trim();
    if (!t) return;
    try {
      const prev = JSON.parse(localStorage.getItem("jivnicare_recent_searches") ?? "[]");
      const next = [t, ...prev.filter((s: string) => s !== t)].slice(0, 8);
      localStorage.setItem("jivnicare_recent_searches", JSON.stringify(next));
      setRecentSearches(next.slice(0, 5));
    } catch { /* ignore */ }
    setFocused(false);
    setHighlightIdx(-1);
    if (onSearch) { onSearch(t); return; }
    const params = new URLSearchParams({ q: t });
    if (district) params.set("district", district);
    router.push(`/doctors?${params}`);
  }, [district, onSearch, router]);

  // Keyboard navigation
  const allSuggestions = suggestions.map(s => s.text);
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (highlightIdx >= 0 && allSuggestions[highlightIdx]) doSearch(allSuggestions[highlightIdx]);
      else doSearch(query);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx(i => Math.min(i + 1, allSuggestions.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx(i => Math.max(i - 1, -1));
    }
    if (e.key === "Escape") {
      setFocused(false);
      setHighlightIdx(-1);
      inputRef.current?.blur();
    }
  };

  const activePlaceholder = placeholder ?? PLACEHOLDERS[phIdx];

  return (
    <div ref={panelRef} className={cn(
      "relative w-full max-w-full transition-all duration-200 box-border", 
      className,
      focused && "max-md:!fixed max-md:!inset-0 max-md:!z-[200] max-md:!bg-white max-md:!p-4 max-md:!flex max-md:!flex-col max-md:!max-w-none max-md:!w-full max-md:!h-[100dvh] max-md:!rounded-none"
    )}>

      {/* ── MOBILE FULL SCREEN HEADER ───────────────────────────────────────── */}
      {focused && (
        <div className="md:hidden flex items-center mb-4 gap-3">
          <button 
            onClick={() => { setFocused(false); setHighlightIdx(-1); inputRef.current?.blur(); }}
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <span className="font-bold text-lg text-slate-900">Search</span>
        </div>
      )}

      {/* ── INPUT CONTAINER ──────────────────────────────────────────────── */}
      <div
        className={cn(
          "relative flex items-center transition-all duration-200 shrink-0",
          compact ? "h-11 rounded-[14px]" : "h-[56px] md:h-[64px] rounded-2xl",
          disableFocusStyles ? "border-transparent" : "border-2",
          focused && !disableFocusStyles
            ? isEmergency
              ? "border-destructive shadow-[0_0_0_4px_rgba(239,68,68,0.12)] bg-white"
              : "border-primary ring-4 ring-primary/10 bg-white"
            : !disableFocusStyles && "border-slate-100 bg-white shadow-soft hover:border-slate-200 hover:shadow-premium",
          innerClassName
        )}
      >
        {/* Left icon */}
        <div className={cn("flex items-center justify-center shrink-0 transition-colors duration-200", compact ? "w-11" : "w-14")}>
          {isEmergency
            ? <Zap className={cn("text-red-500 animate-pulse", compact ? "w-4 h-4" : "w-5 h-5")} />
            : focused && !query
            ? <Sparkles className={cn("text-primary", compact ? "w-4 h-4" : "w-5 h-5")} />
            : <Search className={cn(focused ? "text-primary" : "text-slate-400", compact ? "w-4 h-4" : "w-5 h-5")} />
          }
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          id="smart-search-input"
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setHighlightIdx(-1); }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKey}
          placeholder={activePlaceholder}
          style={{ outline: "none", boxShadow: "none" }}
          className={cn(
            "flex-1 w-full min-w-0 h-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 ring-0 focus:border-none shadow-none !outline-none !shadow-none text-slate-900 placeholder:text-slate-400 transition-colors px-1",
            compact ? "text-[13px] md:text-sm font-medium" : "text-base md:text-[15px] font-semibold"
          )}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          aria-label="Search doctors, symptoms, or specialties"
          aria-expanded={showPanel}
          aria-haspopup="listbox"
          aria-controls="search-suggestions-list"
          role="combobox"
          aria-autocomplete="list"
        />

        {/* Clear btn */}
        {query && (
          <button
            onClick={() => { setQuery(""); setSuggestions([]); setHighlightIdx(-1); inputRef.current?.focus(); }}
            className="w-7 h-7 flex items-center justify-center mr-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Clear search"
            tabIndex={-1}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Search button */}
        <button
          onClick={() => doSearch(query)}
          className={cn(
            "shrink-0 mr-1.5 font-bold text-white rounded-[10px] md:rounded-[12px] transition-all duration-150 active:scale-95 flex items-center justify-center",
            compact
              ? "w-8 h-8 md:w-9 md:h-9"
              : "px-5 md:px-7 py-2.5 text-sm gap-2",
            isEmergency
              ? "bg-red-500 hover:bg-red-600 shadow-sm"
              : "bg-primary hover:bg-primary/90 shadow-sm"
          )}
          aria-label="Search"
        >
          {compact
            ? <Search className="w-3.5 h-3.5 md:w-4 md:h-4" />
            : <><Search className="w-4 h-4" /><span className="hidden sm:inline">Search</span></>
          }
        </button>
      </div>

      {/* ── DROPDOWN PANEL ───────────────────────────────────────────────── */}
      {showPanel && (
        <div
          id="search-suggestions-list"
          className="absolute top-full left-0 right-0 mt-2.5 bg-white md:rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] md:border border-slate-100/80 z-[110] md:max-h-[60vh] overflow-y-auto overscroll-contain overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-md:static max-md:mt-4 max-md:max-h-none max-md:flex-1 max-md:rounded-2xl max-md:shadow-none max-md:border-none max-md:bg-transparent"
          role="listbox"
          aria-label="Search suggestions"
        >

          {/* Emergency Banner */}
          {isEmergency && (
            <button
              onClick={() => doSearch("emergency 24x7")}
              className="w-full flex items-center gap-3 px-5 py-3.5 bg-red-50 border-b border-red-100 hover:bg-red-100 transition-colors"
              role="option"
            >
              <div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <Zap className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-red-700">Find Emergency Hospitals Now</p>
                <p className="text-xs text-red-400 mt-0.5">24×7 hospitals with immediate care</p>
              </div>
              <ChevronRight className="w-4 h-4 text-red-300 shrink-0" />
            </button>
          )}

          {/* Loading state */}
          {isLoading && query.length > 0 && (
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 100}ms` }} />
                ))}
              </div>
              <p className="text-xs text-slate-400 font-medium">Searching doctors…</p>
            </div>
          )}

          {/* Suggestions list */}
          {!isLoading && query.length > 0 && suggestions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-5 pt-3 pb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suggestions</p>
              </div>
              {suggestions.map((s, i) => {
                const meta = TYPE_META[s.type] ?? TYPE_META.specialty;
                const isHighlighted = i === highlightIdx;
                return (
                  <button
                    key={`${s.type}-${i}`}
                    onClick={() => doSearch(s.text)}
                    onMouseEnter={() => setHighlightIdx(i)}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-5 py-3 transition-colors text-left",
                      isHighlighted ? "bg-primary/5" : "hover:bg-slate-50"
                    )}
                    role="option"
                    aria-selected={isHighlighted}
                  >
                    <span className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm", meta.color)}>
                      {meta.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{s.text}</p>
                      {s.hint && <p className="text-xs text-slate-400 mt-0.5">{s.hint}</p>}
                    </div>
                    <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 border", meta.color, "border-current/10")}>
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* No suggestions → show quick hints */}
          {!isLoading && query.length > 0 && suggestions.length === 0 && (
            <div className="px-5 pb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-3 pb-2.5">Try these searches</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_HINTS.map(h => (
                  <button
                    key={h.q}
                    onClick={() => doSearch(h.q)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/30 rounded-xl text-[11px] md:text-xs font-semibold text-muted-foreground hover:text-primary transition-all active:scale-95"
                  >
                    <span className="text-muted-foreground">{h.icon}</span>
                    {h.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recents (empty query) */}
          {!query && recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-5 pt-3.5 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent</p>
                </div>
                <button
                  onClick={() => { localStorage.removeItem("jivnicare_recent_searches"); setRecentSearches([]); }}
                  className="text-[10px] text-slate-400 hover:text-slate-600 font-medium transition-colors"
                >
                  Clear all
                </button>
              </div>
              {recentSearches.map((r, i) => (
                <button
                  key={i}
                  onClick={() => doSearch(r)}
                  className="w-full flex items-center gap-3.5 px-5 py-2.5 hover:bg-slate-50 transition-colors text-left group"
                  role="option"
                >
                  <Clock className="w-4 h-4 text-slate-300 group-hover:text-slate-400 shrink-0 transition-colors" />
                  <p className="text-sm text-slate-700 font-medium flex-1 truncate">{r}</p>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-200 group-hover:text-slate-400 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* Trending (empty query) */}
          {!query && trending.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-5 pt-3.5 pb-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trending Searches</p>
              </div>
              <div className="flex flex-wrap gap-2 px-5 pb-4">
                {trending.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => doSearch(t.query)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-2xl text-xs font-semibold text-emerald-700 transition-all"
                  >
                    <TrendingUp className="w-3 h-3" />
                    {t.query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state with quick hints */}
          {!query && recentSearches.length === 0 && trending.length === 0 && (
            <div className="px-5 pb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-3.5 pb-2.5">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_HINTS.map(h => (
                  <button
                    key={h.q}
                    onClick={() => doSearch(h.q)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/30 rounded-2xl text-xs font-semibold text-muted-foreground hover:text-primary transition-all active:scale-95"
                  >
                    <span className="text-muted-foreground">{h.icon}</span>
                    {h.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Location footer */}
          {district && (
            <div className="px-5 py-2.5 bg-primary/4 border-t border-slate-100/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs text-primary font-semibold">Searching in {district}</p>
              </div>
              <p className="text-[10px] text-slate-400">{district.toLowerCase() === "deoghar" ? "Jharkhand, India" : "Bihar, India"}</p>
            </div>
          )}

          {/* Keyboard hint */}
          {focused && suggestions.length > 0 && (
            <div className="flex items-center gap-2 px-5 py-2 border-t border-slate-50 bg-slate-50/50">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] text-slate-400 font-mono">↑↓</kbd>
              <p className="text-[10px] text-slate-400">navigate</p>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] text-slate-400 font-mono ml-2">↵</kbd>
              <p className="text-[10px] text-slate-400">select</p>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] text-slate-400 font-mono ml-2">Esc</kbd>
              <p className="text-[10px] text-slate-400">close</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
