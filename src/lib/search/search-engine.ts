// =============================================================
//  JivniCare — Smart Healthcare Search Engine
//  Supports: typo tolerance, fuzzy matching, Hindi-English mixed
//  search, symptom mapping, phonetic similarity, ranked results.
//  Zero external dependencies — pure TypeScript.
// =============================================================

import type { Doctor } from "@/types";

// ── 1. TEXT NORMALIZATION ────────────────────────────────────────────────────

function normalize(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")                        // collapse spaces
    .replace(/[^\w\s]/g, "")                     // strip punctuation
    .replace(/dr\.?\s*/g, "")                    // remove "Dr." prefix
    .replace(/doctor\s*/g, "")                   // remove "doctor"
    .trim();
}

// ── 2. LEVENSHTEIN DISTANCE (pure JS, O(m*n)) ────────────────────────────────

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (__, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// Normalized similarity: 1.0 = identical, 0.0 = totally different
function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

// Is "query" a fuzzy match for "target"? (tolerates up to 2-3 edits)
function fuzzyMatch(query: string, target: string): boolean {
  if (!query || !target) return false;
  // Direct substring (fastest path)
  if (target.includes(query) || query.includes(target)) return true;
  // Per-word fuzzy check
  const qWords = query.split(" ").filter(Boolean);
  const tWords = target.split(" ").filter(Boolean);
  return qWords.some(qw =>
    tWords.some(tw => {
      if (tw.startsWith(qw) || qw.startsWith(tw)) return true;
      const maxEdits = qw.length <= 4 ? 1 : qw.length <= 7 ? 2 : 3;
      return levenshtein(qw, tw) <= maxEdits;
    })
  );
}

// ── 3. PHONETIC NORMALIZATION (Bihar user patterns) ─────────────────────────

const PHONETIC_RULES: [RegExp, string][] = [
  [/ph/g,  "f"],   // phever → fever
  [/ck/g,  "k"],   // docter → doktor
  [/ae/g,  "e"],   // paediatric → pediatric
  [/ea/g,  "e"],   // heart → hert
  [/gh/g,  "g"],   // ghum → gum
  [/th/g,  "t"],   // throut → trout
  [/tion/g,"shn"], // pronunciation
  [/sion/g,"shn"],
  [/ou/g,  "u"],   // colour → culur
  [/oo/g,  "u"],   // tooth → tuth
  [/ee/g,  "i"],   // teeth → tith
  [/ie/g,  "i"],
  [/ue/g,  "u"],
  [/ai/g,  "e"],
  [/oe/g,  "o"],
  [/qu/g,  "kw"],
  [/x/g,   "ks"],
];

function phonetize(word: string): string {
  let result = word.toLowerCase();
  for (const [pattern, replacement] of PHONETIC_RULES) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// ── 4. COMPREHENSIVE SYNONYM + HINDI MAP ────────────────────────────────────

interface SynonymEntry {
  specialties: string[];
  keywords: string[];
}

const SYNONYM_MAP: Record<string, SynonymEntry> = {
  // ── Hindi symptoms ────────────────────────────────
  "bukhar":           { specialties: ["General Physician"], keywords: ["fever", "viral", "infection"] },
  "bukar":            { specialties: ["General Physician"], keywords: ["fever"] },
  "taapmaan":         { specialties: ["General Physician"], keywords: ["fever"] },
  "pet dard":         { specialties: ["General Physician", "Gastroenterologist"], keywords: ["stomach", "gastro", "abdomen"] },
  "pet":              { specialties: ["General Physician"], keywords: ["stomach", "abdomen"] },
  "dard":             { specialties: ["General Physician", "Orthopedist"], keywords: ["pain"] },
  "sir dard":         { specialties: ["Neurologist", "General Physician"], keywords: ["headache", "migraine"] },
  "sirdard":          { specialties: ["Neurologist"], keywords: ["headache"] },
  "sir":              { specialties: ["Neurologist"], keywords: ["head", "migraine"] },
  "khansi":           { specialties: ["General Physician"], keywords: ["cough", "infection"] },
  "khanshi":          { specialties: ["General Physician"], keywords: ["cough"] },
  "saans":            { specialties: ["General Physician", "Pulmonologist"], keywords: ["breathing", "asthma"] },
  "sans":             { specialties: ["General Physician"], keywords: ["breathing"] },
  "aankh":            { specialties: ["Ophthalmologist"], keywords: ["eye"] },
  "ankh":             { specialties: ["Ophthalmologist"], keywords: ["eye"] },
  "netra":            { specialties: ["Ophthalmologist"], keywords: ["eye"] },
  "dil":              { specialties: ["Cardiologist"], keywords: ["heart"] },
  "dill":             { specialties: ["Cardiologist"], keywords: ["heart"] },
  "haddi":            { specialties: ["Orthopedist"], keywords: ["bone", "fracture"] },
  "haath dard":       { specialties: ["Orthopedist"], keywords: ["hand", "joint"] },
  "ghutna":           { specialties: ["Orthopedist"], keywords: ["knee", "joint"] },
  "kamar":            { specialties: ["Orthopedist"], keywords: ["back", "spine"] },
  "kamar dard":       { specialties: ["Orthopedist"], keywords: ["back pain", "spine"] },
  "bachcha":          { specialties: ["Pediatrician"], keywords: ["child", "baby"] },
  "bacha":            { specialties: ["Pediatrician"], keywords: ["child"] },
  "bachche":          { specialties: ["Pediatrician"], keywords: ["child"] },
  "bal":              { specialties: ["Pediatrician"], keywords: ["child"] },
  "navajaata":        { specialties: ["Pediatrician"], keywords: ["newborn"] },
  "mahila":           { specialties: ["Gynecologist"], keywords: ["women", "female"] },
  "stree":            { specialties: ["Gynecologist"], keywords: ["women"] },
  "prasav":           { specialties: ["Gynecologist"], keywords: ["maternity", "pregnancy", "delivery"] },
  "garbh":            { specialties: ["Gynecologist"], keywords: ["pregnancy"] },
  "daant":            { specialties: ["Dentist"], keywords: ["tooth", "dental"] },
  "daat":             { specialties: ["Dentist"], keywords: ["tooth"] },
  "daanth":           { specialties: ["Dentist"], keywords: ["tooth"] },
  "twacha":           { specialties: ["Dermatologist"], keywords: ["skin"] },
  "khujli":           { specialties: ["Dermatologist"], keywords: ["itch", "allergy", "skin"] },
  "muhaase":          { specialties: ["Dermatologist"], keywords: ["acne", "pimple", "skin"] },
  "baalo":            { specialties: ["Dermatologist"], keywords: ["hair", "hairfall"] },
  "baal":             { specialties: ["Dermatologist"], keywords: ["hair"] },
  "nazar":            { specialties: ["Ophthalmologist"], keywords: ["vision", "eye", "spectacle"] },
  "chashma":          { specialties: ["Ophthalmologist"], keywords: ["spectacle", "eye", "vision"] },
  "sugar":            { specialties: ["General Physician", "Endocrinologist"], keywords: ["diabetes", "blood sugar"] },
  "madhumeh":         { specialties: ["General Physician"], keywords: ["diabetes"] },
  "bp":               { specialties: ["General Physician", "Cardiologist"], keywords: ["blood pressure", "hypertension"] },
  "blood pressure":   { specialties: ["General Physician", "Cardiologist"], keywords: ["hypertension", "bp"] },
  "motapa":           { specialties: ["General Physician"], keywords: ["obesity", "weight"] },
  "thand":            { specialties: ["General Physician"], keywords: ["cold", "fever", "cough"] },
  "jukam":            { specialties: ["General Physician"], keywords: ["cold", "cough"] },
  "ulti":             { specialties: ["General Physician"], keywords: ["vomiting", "nausea"] },
  "dast":             { specialties: ["General Physician"], keywords: ["diarrhea"] },
  "pagal":            { specialties: ["Neurologist", "Psychiatrist"], keywords: ["mental", "neuro"] },
  "dimag":            { specialties: ["Neurologist"], keywords: ["brain", "neuro"] },
  "aankhon":          { specialties: ["Ophthalmologist"], keywords: ["eye"] },
  "sunte nahi":       { specialties: ["ENT Specialist"], keywords: ["ear", "hearing"] },
  "kaan":             { specialties: ["ENT Specialist"], keywords: ["ear", "ENT"] },
  "gala":             { specialties: ["ENT Specialist"], keywords: ["throat", "ENT"] },
  "naak":             { specialties: ["ENT Specialist"], keywords: ["nose", "ENT"] },

  // ── Hindi mixed ───────────────────────────────────
  "baccha doctor":    { specialties: ["Pediatrician"], keywords: ["child doctor"] },
  "bachche ka doctor":{ specialties: ["Pediatrician"], keywords: ["child doctor"] },
  "pet doctor":       { specialties: ["General Physician", "Gastroenterologist"], keywords: ["stomach doctor"] },
  "heart ka doctor":  { specialties: ["Cardiologist"], keywords: ["heart"] },
  "mahila doctor":    { specialties: ["Gynecologist"], keywords: ["women doctor"] },
  "aankhon ka doctor":{ specialties: ["Ophthalmologist"], keywords: ["eye doctor"] },
  "daanth ka doctor": { specialties: ["Dentist"], keywords: ["dental"] },
  "skin doctor":      { specialties: ["Dermatologist"], keywords: ["derma"] },
  "hadi doctor":      { specialties: ["Orthopedist"], keywords: ["bone doctor"] },
  "haddi specialist": { specialties: ["Orthopedist"], keywords: ["bone specialist"] },
  "dil ka doctor":    { specialties: ["Cardiologist"], keywords: ["heart doctor"] },
  "dil specialist":   { specialties: ["Cardiologist"], keywords: ["heart specialist"] },
  "naak kaan gala":   { specialties: ["ENT Specialist"], keywords: ["ENT", "ear nose throat"] },

  // ── English symptoms ──────────────────────────────
  "fever":            { specialties: ["General Physician"], keywords: ["viral", "infection", "temperature"] },
  "fevar":            { specialties: ["General Physician"], keywords: ["fever"] },
  "cold":             { specialties: ["General Physician"], keywords: ["cough", "viral", "infection"] },
  "cough":            { specialties: ["General Physician"], keywords: ["viral", "infection", "khansi"] },
  "headache":         { specialties: ["Neurologist"], keywords: ["migraine", "head pain"] },
  "migraine":         { specialties: ["Neurologist"], keywords: ["headache"] },
  "heart":            { specialties: ["Cardiologist"], keywords: ["cardiac", "cardio"] },
  "heart pain":       { specialties: ["Cardiologist"], keywords: ["chest pain", "cardiac"] },
  "chest pain":       { specialties: ["Cardiologist"], keywords: ["heart", "cardiac"] },
  "chest":            { specialties: ["Cardiologist"], keywords: ["heart"] },
  "bone":             { specialties: ["Orthopedist"], keywords: ["fracture", "joint"] },
  "joint":            { specialties: ["Orthopedist"], keywords: ["arthritis", "bone"] },
  "spine":            { specialties: ["Orthopedist"], keywords: ["back pain", "disc"] },
  "back pain":        { specialties: ["Orthopedist"], keywords: ["spine", "disc"] },
  "knee":             { specialties: ["Orthopedist"], keywords: ["joint", "ghutna"] },
  "fracture":         { specialties: ["Orthopedist"], keywords: ["bone", "break"] },
  "child":            { specialties: ["Pediatrician"], keywords: ["baby", "kids", "newborn"] },
  "baby":             { specialties: ["Pediatrician"], keywords: ["infant", "newborn"] },
  "kids":             { specialties: ["Pediatrician"], keywords: ["child", "baby"] },
  "newborn":          { specialties: ["Pediatrician"], keywords: ["infant", "baby"] },
  "pregnancy":        { specialties: ["Gynecologist"], keywords: ["maternity", "delivery", "garbh"] },
  "maternity":        { specialties: ["Gynecologist"], keywords: ["pregnancy", "delivery"] },
  "women":            { specialties: ["Gynecologist"], keywords: ["female", "mahila"] },
  "pcod":             { specialties: ["Gynecologist"], keywords: ["hormones", "women"] },
  "eye":              { specialties: ["Ophthalmologist"], keywords: ["vision", "cataract", "lasik"] },
  "cataract":         { specialties: ["Ophthalmologist"], keywords: ["eye surgery"] },
  "lasik":            { specialties: ["Ophthalmologist"], keywords: ["eye", "vision correction"] },
  "vision":           { specialties: ["Ophthalmologist"], keywords: ["eye", "spectacle"] },
  "tooth":            { specialties: ["Dentist"], keywords: ["dental", "root canal"] },
  "teeth":            { specialties: ["Dentist"], keywords: ["dental", "tooth"] },
  "dental":           { specialties: ["Dentist"], keywords: ["tooth", "gum"] },
  "hair":             { specialties: ["Dermatologist"], keywords: ["hairfall", "alopecia"] },
  "hairfall":         { specialties: ["Dermatologist"], keywords: ["hair loss"] },
  "acne":             { specialties: ["Dermatologist"], keywords: ["pimple", "skin"] },
  "skin":             { specialties: ["Dermatologist"], keywords: ["acne", "allergy", "rash"] },
  "rash":             { specialties: ["Dermatologist"], keywords: ["skin", "allergy"] },
  "allergy":          { specialties: ["Dermatologist", "General Physician"], keywords: ["rash", "skin"] },
  "diabetes":         { specialties: ["General Physician"], keywords: ["sugar", "insulin"] },
  "hypertension":     { specialties: ["General Physician", "Cardiologist"], keywords: ["bp", "blood pressure"] },
  "stomach":          { specialties: ["General Physician"], keywords: ["abdomen", "digestion"] },
  "vomiting":         { specialties: ["General Physician"], keywords: ["nausea", "ulti"] },
  "diarrhea":         { specialties: ["General Physician"], keywords: ["loose motion", "dast"] },
  "emergency":        { specialties: [], keywords: ["urgent", "24x7", "emergency"] },
  "urgent":           { specialties: [], keywords: ["emergency", "immediate"] },
  "accident":         { specialties: ["Orthopedist", "Surgeon"], keywords: ["emergency", "trauma"] },
  "trauma":           { specialties: ["Orthopedist", "Surgeon"], keywords: ["emergency", "accident"] },
};

// ── 5. QUERY EXPANSION ENGINE ────────────────────────────────────────────────

interface ExpandedQuery {
  original: string;
  normalized: string;
  terms: string[];              // all terms to search
  specialties: string[];        // specialty targets
  keywords: string[];           // additional keyword hints
  didYouMean?: string;          // spelling suggestion
  district?: string;            // location boost target
}

import { HEALTHCARE_SPECIALTIES } from "@/lib/seo/metadata";

// Known specialty names for "did you mean" correction
const KNOWN_SPECIALTIES = HEALTHCARE_SPECIALTIES;
const KNOWN_TERMS = [
  "fever", "headache", "heart", "bone", "child", "skin", "eye", "tooth",
  "pregnancy", "diabetes", "emergency", "hair", "allergy", "cough",
  "bukhar", "bachcha", "daant", "dil", "haddi", "aankh", "mahila",
  ...Object.keys(SYNONYM_MAP),
];

function expandQuery(raw: string): ExpandedQuery {
  const norm = normalize(raw);
  const words = norm.split(" ").filter(Boolean);
  const terms = new Set<string>([norm, ...words]);
  const specialties = new Set<string>();
  const keywords = new Set<string>();

  // Full phrase lookup
  const fullEntry = SYNONYM_MAP[norm];
  if (fullEntry) {
    fullEntry.specialties.forEach(s => specialties.add(s));
    fullEntry.keywords.forEach(k => keywords.add(k));
    fullEntry.keywords.forEach(k => terms.add(k));
  }

  // Per-word lookup
  for (const word of words) {
    const entry = SYNONYM_MAP[word];
    if (entry) {
      entry.specialties.forEach(s => specialties.add(s));
      entry.keywords.forEach(k => { keywords.add(k); terms.add(k); });
    }
    // Phonetic variant lookup
    const phonetic = phonetize(word);
    if (phonetic !== word) {
      const pEntry = SYNONYM_MAP[phonetic];
      if (pEntry) {
        pEntry.specialties.forEach(s => specialties.add(s));
        pEntry.keywords.forEach(k => { keywords.add(k); terms.add(k); });
      }
    }
  }

  // "Did you mean" — find closest known term
  let didYouMean: string | undefined;
  if (specialties.size === 0 && keywords.size === 0) {
    let bestScore = 0;
    let bestTerm = "";
    for (const word of words) {
      for (const known of KNOWN_TERMS) {
        const sim = similarity(word, known);
        if (sim > bestScore && sim > 0.6 && sim < 1) {
          bestScore = sim;
          bestTerm = known;
        }
      }
    }
    if (bestTerm) {
      // Resolve to specialty
      const specMatch = KNOWN_SPECIALTIES.find(
        s => s.toLowerCase().includes(bestTerm) || bestTerm.includes(s.toLowerCase().split(" ")[0])
      );
      const entry = SYNONYM_MAP[bestTerm];
      if (specMatch) didYouMean = specMatch;
      else if (entry?.specialties.length) didYouMean = entry.specialties[0];
      else didYouMean = bestTerm.charAt(0).toUpperCase() + bestTerm.slice(1);
    }
  }

  return {
    original: raw,
    normalized: norm,
    terms: [...terms],
    specialties: [...specialties],
    keywords: [...keywords],
    didYouMean,
  };
}

// ── 6. SCORE-BASED DOCTOR RANKER ─────────────────────────────────────────────

interface ScoredDoctor {
  doctor: Doctor;
  score: number;
  matchReason?: string; // for debug/analytics
}

function scoreDoctor(doctor: Doctor, eq: ExpandedQuery): number {
  let score = 0;
  const norm = eq.normalized;
  const d = {
    name:      normalize(doctor.name),
    specialty: normalize(doctor.specialty),
    clinic:    normalize(doctor.clinic),
    location:  normalize(doctor.location),
    about:     normalize(doctor.about),
    education: normalize(doctor.education),
    tags:      doctor.tags.map(normalize),
    available: normalize(doctor.available),
  };

  // ── Priority 1: Exact doctor name match (100pts) ──
  if (d.name.includes(norm)) score += 100;
  else if (fuzzyMatch(norm, d.name)) score += 70;

  // ── Priority 2: Specialty exact match (90pts) ──
  const targetSpecs = eq.specialties.map(s => s.toLowerCase());
  if (targetSpecs.some(s => d.specialty === s)) score += 90;
  else if (targetSpecs.some(s => d.specialty.includes(s) || s.includes(d.specialty))) score += 70;
  else if (targetSpecs.some(s => fuzzyMatch(s, d.specialty))) score += 50;

  // ── Priority 3: Specialty partial/fuzzy (by raw terms) ──
  for (const term of eq.terms) {
    if (term.length < 2) continue;
    if (d.specialty.includes(term)) score += 60;
    else if (fuzzyMatch(term, d.specialty)) score += 35;
  }

  // ── Priority 4: Tag match (40pts each) ──
  for (const term of eq.terms) {
    if (d.tags.some(tag => tag.includes(term))) score += 40;
    else if (d.tags.some(tag => fuzzyMatch(term, tag))) score += 20;
  }

  // ── Priority 5: Clinic / hospital match (35pts) ──
  for (const term of eq.terms) {
    if (d.clinic.includes(term)) score += 35;
    else if (fuzzyMatch(term, d.clinic)) score += 18;
  }

  // ── Priority 6: Location / city match (30pts) ──
  for (const term of eq.terms) {
    if (d.location.includes(term)) score += 30;
    else if (fuzzyMatch(term, d.location)) score += 15;
  }

  // ── Priority 7: About / education text (15pts) ──
  for (const term of eq.terms) {
    if (d.about.includes(term)) score += 15;
    if (d.education.includes(term)) score += 10;
  }

  // ── Priority 8: Keyword hints from synonym map ──
  for (const kw of eq.keywords) {
    if (d.specialty.includes(kw) || d.about.includes(kw) || d.tags.some(t => t.includes(kw))) {
      score += 25;
    }
  }

  // ── Priority 9: District / Location Boosting (Resiliency) ──
  if (eq.district) {
    const targetDistrict = normalize(eq.district);
    if (d.location.includes(targetDistrict)) {
      score += 50; // Strong boost for local doctors
    }
  }

  // ── Availability boost ──
  if (d.available.includes("today")) score += 5;

  // ── Rating boost (small) ──
  score += doctor.rating;

  return score;
}

// ── 7. MAIN SEARCH FUNCTION ──────────────────────────────────────────────────

export interface SearchResult {
  results: Doctor[];
  total: number;
  expandedQuery: ExpandedQuery;
  isFuzzy: boolean;      // true if we fell back to fuzzy matching
  didYouMean?: string;
}

const SCORE_THRESHOLD = 25; // minimum score to appear in results

export function searchDoctors(rawQuery: string, doctors: Doctor[], district: string = ""): SearchResult {
  if (!rawQuery.trim()) {
    return {
      results: doctors,
      total: doctors.length,
      expandedQuery: expandQuery(""),
      isFuzzy: false,
    };
  }

  const eq = expandQuery(rawQuery);
  if (district) eq.district = district;

  // Score every doctor
  const scored: ScoredDoctor[] = doctors
    .map(doctor => ({ doctor, score: scoreDoctor(doctor, eq) }))
    .filter(({ score }) => score >= SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  // If no results with threshold, try fuzzy fallback (lower threshold)
  if (scored.length === 0) {
    const fuzzyFallback: ScoredDoctor[] = doctors
      .map(doctor => ({ doctor, score: scoreDoctor(doctor, eq) }))
      .filter(({ score }) => score >= 15)
      .sort((a, b) => b.score - a.score);

    return {
      results: fuzzyFallback.map(s => s.doctor),
      total: fuzzyFallback.length,
      expandedQuery: eq,
      isFuzzy: true,
      didYouMean: eq.didYouMean,
    };
  }

  return {
    results: scored.map(s => s.doctor),
    total: scored.length,
    expandedQuery: eq,
    isFuzzy: false,
    didYouMean: scored.length < 3 ? eq.didYouMean : undefined,
  };
}

// ── 8. LOCAL SUGGESTION GENERATOR ───────────────────────────────────────────
// For SmartSearchBar fallback when backend API is not running

export interface LocalSuggestion {
  type: "specialty" | "symptom" | "doctor" | "location";
  text: string;
  hint?: string;
}

export function generateLocalSuggestions(query: string, doctors: Doctor[]): LocalSuggestion[] {
  if (query.length < 1) return [];
  const norm = normalize(query);
  const suggestions: LocalSuggestion[] = [];
  const seen = new Set<string>();

  // Match synonyms / Hindi terms
  for (const [key, entry] of Object.entries(SYNONYM_MAP)) {
    if (key.startsWith(norm) || fuzzyMatch(norm, key)) {
      for (const spec of entry.specialties) {
        if (!seen.has(spec)) {
          seen.add(spec);
          suggestions.push({ type: "specialty", text: spec, hint: `For "${key}"` });
        }
      }
    }
  }

  // Match specialty names directly
  for (const spec of KNOWN_SPECIALTIES) {
    const specNorm = normalize(spec);
    if (specNorm.includes(norm) || fuzzyMatch(norm, specNorm)) {
      if (!seen.has(spec)) {
        seen.add(spec);
        suggestions.push({ type: "specialty", text: spec });
      }
    }
  }

  // Match doctor names
  for (const doc of doctors) {
    const dName = normalize(doc.name);
    if (dName.includes(norm) || fuzzyMatch(norm, dName)) {
      if (!seen.has(doc.name)) {
        seen.add(doc.name);
        suggestions.push({ type: "doctor", text: doc.name, hint: doc.specialty });
      }
    }
  }

  // Match locations
  const locations = [...new Set(doctors.map(d => d.location.split(",")[1]?.trim()).filter(Boolean))];
  for (const loc of locations) {
    if (loc && normalize(loc).includes(norm)) {
      if (!seen.has(loc)) {
        seen.add(loc);
        suggestions.push({ type: "location", text: loc, hint: "Location" });
      }
    }
  }

  return suggestions.slice(0, 8);
}

// ── 9. SEARCH ANALYTICS (localStorage) ─────────────────────────────────────

const ANALYTICS_KEY = "jc_search_analytics";

interface SearchAnalyticsEntry {
  query: string;
  resultCount: number;
  timestamp: number;
  isFuzzy?: boolean;
}

export function trackSearch(query: string, resultCount: number, isFuzzy = false): void {
  if (typeof window === "undefined" || !query.trim()) return;
  try {
    const existing: SearchAnalyticsEntry[] = JSON.parse(
      localStorage.getItem(ANALYTICS_KEY) ?? "[]"
    );
    existing.unshift({ query: query.trim(), resultCount, timestamp: Date.now(), isFuzzy });
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(existing.slice(0, 200)));
  } catch { /* ignore */ }
}

function getSearchAnalytics(): SearchAnalyticsEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ANALYTICS_KEY) ?? "[]");
  } catch { return []; }
}

export function getTopSearches(limit = 10): { query: string; count: number }[] {
  const all = getSearchAnalytics();
  const counts: Record<string, number> = {};
  for (const entry of all) {
    counts[entry.query] = (counts[entry.query] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([query, count]) => ({ query, count }));
}
