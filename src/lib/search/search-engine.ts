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
  "dard":             { specialties: ["General Physician", "Orthopedic Surgeon"], keywords: ["pain"] },
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
  "haddi":            { specialties: ["Orthopedic Surgeon"], keywords: ["bone", "fracture"] },
  "haath dard":       { specialties: ["Orthopedic Surgeon"], keywords: ["hand", "joint"] },
  "ghutna":           { specialties: ["Orthopedic Surgeon"], keywords: ["knee", "joint"] },
  "kamar":            { specialties: ["Orthopedic Surgeon"], keywords: ["back", "spine"] },
  "kamar dard":       { specialties: ["Orthopedic Surgeon"], keywords: ["back pain", "spine"] },
  "bachcha":          { specialties: ["Pediatrician"], keywords: ["child", "baby"] },
  "bacha":            { specialties: ["Pediatrician"], keywords: ["child"] },
  "bachche":          { specialties: ["Pediatrician"], keywords: ["child"] },
  "bal":              { specialties: ["Pediatrician"], keywords: ["child"] },
  "navajaata":        { specialties: ["Pediatrician"], keywords: ["newborn"] },
  "mahila":           { specialties: ["Gynecologist & Obstetrician"], keywords: ["women", "female"] },
  "stree":            { specialties: ["Gynecologist & Obstetrician"], keywords: ["women"] },
  "prasav":           { specialties: ["Gynecologist & Obstetrician"], keywords: ["maternity", "pregnancy", "delivery"] },
  "garbh":            { specialties: ["Gynecologist & Obstetrician"], keywords: ["pregnancy"] },
  "daant":            { specialties: ["Dentist"], keywords: ["tooth", "dental"] },
  "daat":             { specialties: ["Dentist"], keywords: ["tooth"] },
  "daanth":           { specialties: ["Dentist"], keywords: ["tooth"] },
  "twacha":           { specialties: ["Dermatologist & Cosmetologist"], keywords: ["skin"] },
  "khujli":           { specialties: ["Dermatologist & Cosmetologist"], keywords: ["itch", "allergy", "skin"] },
  "muhaase":          { specialties: ["Dermatologist & Cosmetologist"], keywords: ["acne", "pimple", "skin"] },
  "baalo":            { specialties: ["Dermatologist & Cosmetologist"], keywords: ["hair", "hairfall"] },
  "baal":             { specialties: ["Dermatologist & Cosmetologist"], keywords: ["hair"] },
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
  "pagal":            { specialties: ["Neurologist", "Psychiatrist & Psychologist"], keywords: ["mental", "neuro"] },
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
  "mahila doctor":    { specialties: ["Gynecologist & Obstetrician"], keywords: ["women doctor"] },
  "aankhon ka doctor":{ specialties: ["Ophthalmologist"], keywords: ["eye doctor"] },
  "daanth ka doctor": { specialties: ["Dentist"], keywords: ["dental"] },
  "skin doctor":      { specialties: ["Dermatologist & Cosmetologist"], keywords: ["derma"] },
  "hadi doctor":      { specialties: ["Orthopedic Surgeon"], keywords: ["bone doctor"] },
  "haddi specialist": { specialties: ["Orthopedic Surgeon"], keywords: ["bone specialist"] },
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
  "bone":             { specialties: ["Orthopedic Surgeon"], keywords: ["fracture", "joint"] },
  "joint":            { specialties: ["Orthopedic Surgeon"], keywords: ["arthritis", "bone"] },
  "spine":            { specialties: ["Orthopedic Surgeon"], keywords: ["back pain", "disc"] },
  "back pain":        { specialties: ["Orthopedic Surgeon"], keywords: ["spine", "disc"] },
  "knee":             { specialties: ["Orthopedic Surgeon"], keywords: ["joint", "ghutna"] },
  "fracture":         { specialties: ["Orthopedic Surgeon"], keywords: ["bone", "break"] },
  "child":            { specialties: ["Pediatrician"], keywords: ["baby", "kids", "newborn"] },
  "baby":             { specialties: ["Pediatrician"], keywords: ["infant", "newborn"] },
  "kids":             { specialties: ["Pediatrician"], keywords: ["child", "baby"] },
  "newborn":          { specialties: ["Pediatrician"], keywords: ["infant", "baby"] },
  "pregnancy":        { specialties: ["Gynecologist & Obstetrician"], keywords: ["maternity", "delivery", "garbh"] },
  "maternity":        { specialties: ["Gynecologist & Obstetrician"], keywords: ["pregnancy", "delivery"] },
  "women":            { specialties: ["Gynecologist & Obstetrician"], keywords: ["female", "mahila"] },
  "pcod":             { specialties: ["Gynecologist & Obstetrician"], keywords: ["hormones", "women"] },
  "eye":              { specialties: ["Ophthalmologist"], keywords: ["vision", "cataract", "lasik"] },
  "cataract":         { specialties: ["Ophthalmologist"], keywords: ["eye surgery"] },
  "lasik":            { specialties: ["Ophthalmologist"], keywords: ["eye", "vision correction"] },
  "vision":           { specialties: ["Ophthalmologist"], keywords: ["eye", "spectacle"] },
  "tooth":            { specialties: ["Dentist"], keywords: ["dental", "root canal"] },
  "teeth":            { specialties: ["Dentist"], keywords: ["dental", "tooth"] },
  "dental":           { specialties: ["Dentist"], keywords: ["tooth", "gum"] },
  "hair":             { specialties: ["Dermatologist & Cosmetologist"], keywords: ["hairfall", "alopecia"] },
  "hairfall":         { specialties: ["Dermatologist & Cosmetologist"], keywords: ["hair loss"] },
  "acne":             { specialties: ["Dermatologist & Cosmetologist"], keywords: ["pimple", "skin"] },
  "skin":             { specialties: ["Dermatologist & Cosmetologist"], keywords: ["acne", "allergy", "skin"] },
  "rash":             { specialties: ["Dermatologist & Cosmetologist"], keywords: ["skin", "allergy"] },
  "allergy":          { specialties: ["Dermatologist & Cosmetologist", "General Physician"], keywords: ["rash", "skin"] },
  "diabetes":         { specialties: ["General Physician"], keywords: ["sugar", "insulin"] },
  "hypertension":     { specialties: ["General Physician", "Cardiologist"], keywords: ["bp", "blood pressure"] },
  "stomach":          { specialties: ["General Physician"], keywords: ["abdomen", "digestion"] },
  "vomiting":         { specialties: ["General Physician"], keywords: ["nausea", "ulti"] },
  "diarrhea":         { specialties: ["General Physician"], keywords: ["loose motion", "dast"] },
  "emergency":        { specialties: [], keywords: ["urgent", "24x7", "emergency"] },
  "urgent":           { specialties: [], keywords: ["emergency", "immediate"] },
  "accident":         { specialties: ["Orthopedic Surgeon", "General Physician"], keywords: ["emergency", "trauma"] },
  "trauma":           { specialties: ["Orthopedic Surgeon", "General Physician"], keywords: ["emergency", "accident"] },
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
  const norm = eq.normalized;
  
  // 1. Keyword Match (Max 40 pts)
  let keywordScore = 0;
  if (norm.trim()) {
    const d = {
      name:      normalize(doctor.name),
      specialty: normalize(doctor.specialty),
      clinic:    normalize(doctor.clinic),
      about:     normalize(doctor.about),
      diseases:  (doctor.diseases || []).map(normalize),
    };

    // Calculate match scores for different fields
    let nameMatch = 0;
    if (d.name.includes(norm) || norm.includes(d.name)) nameMatch = 40;
    else if (fuzzyMatch(norm, d.name)) nameMatch = 30;

    let specialtyMatch = 0;
    if (d.specialty.includes(norm) || norm.includes(d.specialty)) specialtyMatch = 40;
    else if (fuzzyMatch(norm, d.specialty)) specialtyMatch = 30;
    
    // Check if query maps to any matched specialties in the query expansion
    const targetSpecs = eq.specialties.map(s => s.toLowerCase());
    if (targetSpecs.some(s => d.specialty === s || d.specialty.includes(s) || s.includes(d.specialty))) {
      specialtyMatch = Math.max(specialtyMatch, 40);
    } else if (targetSpecs.some(s => fuzzyMatch(s, d.specialty))) {
      specialtyMatch = Math.max(specialtyMatch, 30);
    }

    let clinicMatch = 0;
    if (d.clinic.includes(norm) || norm.includes(d.clinic)) clinicMatch = 30;
    else if (fuzzyMatch(norm, d.clinic)) clinicMatch = 20;

    let bioMatch = 0;
    if (d.about.includes(norm)) bioMatch = 20;
    else if (fuzzyMatch(norm, d.about)) bioMatch = 10;

    let diseaseMatch = 0;
    if (d.diseases.some(disease => disease.includes(norm) || norm.includes(disease))) diseaseMatch = 30;
    else if (d.diseases.some(disease => fuzzyMatch(norm, disease))) diseaseMatch = 15;

    // Additional matching based on keywords in query expansion
    for (const kw of eq.keywords) {
      const kwNorm = normalize(kw);
      if (d.specialty.includes(kwNorm) || d.name.includes(kwNorm)) {
        specialtyMatch = Math.max(specialtyMatch, 30);
      }
      if (d.clinic.includes(kwNorm)) {
        clinicMatch = Math.max(clinicMatch, 20);
      }
      if (d.about.includes(kwNorm)) {
        bioMatch = Math.max(bioMatch, 15);
      }
      if (d.diseases.some(dis => dis.includes(kwNorm))) {
        diseaseMatch = Math.max(diseaseMatch, 25);
      }
    }

    keywordScore = Math.max(nameMatch, specialtyMatch, clinicMatch, bioMatch, diseaseMatch);
  }

  // 2. Availability (Max 25 pts)
  let availabilityScore = 0;
  if (doctor.isQueueActive) {
    availabilityScore += 15;
  }
  if (doctor.isAvailableToday) {
    availabilityScore += 10;
  }

  // 3. Distance (Max 20 pts)
  let distanceScore = 0;
  if (doctor.distanceKm !== undefined && doctor.distanceKm !== null) {
    const dist = doctor.distanceKm;
    if (dist <= 2) distanceScore = 20;
    else if (dist <= 5) distanceScore = 15;
    else if (dist <= 10) distanceScore = 10;
    else if (dist <= 20) distanceScore = 5;
  }

  // 4. Profile Complete (Max 10 pts)
  let profileCompleteScore = 0;
  if (doctor.image && doctor.image.trim() && !doctor.image.includes("placeholder")) {
    profileCompleteScore += 4;
  }
  if (doctor.about && doctor.about.trim().length > 10) {
    profileCompleteScore += 3;
  }
  if (doctor.diseases && doctor.diseases.length > 0) {
    profileCompleteScore += 3;
  }

  // 5. Early Partner (Max 5 pts)
  let earlyPartnerScore = 0;
  if (doctor.partnerTier === "EARLY_PARTNER") {
    earlyPartnerScore = 5;
  }

  return keywordScore + availabilityScore + distanceScore + profileCompleteScore + earlyPartnerScore;
}

// ── 7. MAIN SEARCH FUNCTION ──────────────────────────────────────────────────

export interface SearchResult {
  results: Doctor[];
  total: number;
  expandedQuery: ExpandedQuery;
  isFuzzy: boolean;      // true if we fell back to fuzzy matching
  didYouMean?: string;
  emptyMessage?: string;
}

const SCORE_THRESHOLD = 15; // minimum score to appear in results

export function searchDoctors(rawQuery: string, doctors: Doctor[], district: string = ""): SearchResult {
  const trimmedQuery = rawQuery.trim();

  // Return empty + message if query is exactly 1 character
  if (trimmedQuery.length === 1) {
    return {
      results: [],
      total: 0,
      expandedQuery: expandQuery(rawQuery),
      isFuzzy: false,
      emptyMessage: "Type at least 2 characters",
    };
  }

  // If query is empty, show all verified doctors sorted by score
  if (!trimmedQuery) {
    const eq = expandQuery("");
    if (district) eq.district = district;
    const scored = doctors
      .map(doctor => ({ doctor, score: scoreDoctor(doctor, eq) }))
      .sort((a, b) => b.score - a.score)
      .map(s => s.doctor);
    return {
      results: scored,
      total: scored.length,
      expandedQuery: eq,
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
      .filter(({ score }) => score >= 5)
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
