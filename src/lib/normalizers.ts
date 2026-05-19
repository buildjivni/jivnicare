/**
 * JivniCare Healthcare Data Normalization Utilities
 * Prevents free-text fragmentation in qualifications, specialties, and languages.
 */

// 1. Qualification Normalization Mapping
const QUALIFICATION_MAP: Record<string, string> = {
  "mbbs": "MBBS",
  "m.b.b.s.": "MBBS",
  "m.b.b.s": "MBBS",
  "mbbs.": "MBBS",
  
  "md": "MD",
  "m.d.": "MD",
  "m.d": "MD",
  "md.": "MD",
  
  "ms": "MS",
  "m.s.": "MS",
  "m.s": "MS",
  "ms.": "MS",
  
  "dnb": "DNB",
  "d.n.b.": "DNB",
  "d.n.b": "DNB",
  
  "bds": "BDS",
  "b.d.s.": "BDS",
  
  "mds": "MDS",
  "m.d.s.": "MDS",
  
  "dm": "DM",
  "d.m.": "DM",
  
  "mch": "MCh",
  "m.ch.": "MCh",
  "m.ch": "MCh",
  
  "phd": "PhD",
  "ph.d.": "PhD",
  
  "fcls": "FCLS",
  "fcps": "FCPS",
  "frcs": "FRCS",
  "mrcp": "MRCP",
};

/**
 * Normalizes qualification free text into a clean comma-separated standard format.
 * E.g., "mbbs, m.d. medicine" -> "MBBS, MD Medicine"
 */
export function normalizeQualifications(input: string | null | undefined): string {
  if (!input) return "";
  
  return input
    .split(",")
    .map((item) => {
      let cleaned = item.trim();
      if (!cleaned) return "";
      
      // Tokenize the item to find matching qualification abbreviations
      const words = cleaned.split(/\s+/);
      const normalizedWords = words.map((word) => {
        const lowerWord = word.toLowerCase().replace(/[,.:;]$/, "");
        if (QUALIFICATION_MAP[lowerWord]) {
          return QUALIFICATION_MAP[lowerWord];
        }
        // Capitalize the first letter of non-abbreviation words (e.g. "medicine" -> "Medicine")
        if (word.length > 1) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      });
      
      return normalizedWords.join(" ");
    })
    .filter(Boolean)
    .join(", ");
}

// 2. Specialty Normalization Mapping
const SPECIALTY_MAP: Record<string, string> = {
  "cardio": "Cardiology",
  "cardiology": "Cardiology",
  "cardiologist": "Cardiology",
  
  "derma": "Dermatology",
  "dermatology": "Dermatology",
  "dermatologist": "Dermatology",
  
  "pedia": "Pediatrics",
  "pediatrician": "Pediatrics",
  "pediatrics": "Pediatrics",
  
  "ortho": "Orthopedics",
  "orthopedic": "Orthopedics",
  "orthopedics": "Orthopedics",
  "orthopedician": "Orthopedics",
  
  "gyne": "Gynecology",
  "gynecology": "Gynecology",
  "gynecologist": "Gynecology",
  "gynaecology": "Gynecology",
  "gynaecologist": "Gynecology",
  
  "neuro": "Neurology",
  "neurology": "Neurology",
  "neurologist": "Neurology",
  
  "general medicine": "General Medicine",
  "physician": "General Medicine",
  "general physician": "General Medicine",
  "gp": "General Medicine",
  "internal medicine": "General Medicine",
  
  "ent": "ENT Specialist",
  "e.n.t": "ENT Specialist",
  "otolaryngology": "ENT Specialist",
  
  "dentist": "Dentistry",
  "dentistry": "Dentistry",
  "dental": "Dentistry",
  
  "ophthalmology": "Ophthalmology",
  "ophthalmologist": "Ophthalmology",
  "eye specialist": "Ophthalmology",
  
  "psychiatry": "Psychiatry",
  "psychiatrist": "Psychiatry",
  "mental health": "Psychiatry",
};

/**
 * Normalizes a specialty name to standard title casing and mapping.
 */
export function normalizeSpecialty(input: string | null | undefined): string {
  if (!input) return "General Medicine";
  const cleaned = input.trim().toLowerCase();
  
  if (SPECIALTY_MAP[cleaned]) {
    return SPECIALTY_MAP[cleaned];
  }
  
  // Title casing fallback
  return input
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// 3. Language Normalization Mapping
const LANGUAGE_MAP: Record<string, string> = {
  "english": "English",
  "eng": "English",
  
  "hindi": "Hindi",
  "hin": "Hindi",
  
  "bengali": "Bengali",
  "bangla": "Bengali",
  
  "maithili": "Maithili",
  "bhojpuri": "Bhojpuri",
  "magahi": "Magahi",
  "urdu": "Urdu",
  "punjabi": "Punjabi",
  "gujarati": "Gujarati",
  "marathi": "Marathi",
  "tamil": "Tamil",
  "telugu": "Telugu",
  "kannada": "Kannada",
  "malayalam": "Malayalam",
};

/**
 * Normalizes a list of language strings into clean Title Case languages.
 */
export function normalizeLanguages(input: string | string[] | null | undefined): string[] {
  if (!input) return ["English"];
  
  const rawArray = Array.isArray(input)
    ? input
    : input.split(",").map(l => l.trim());
    
  return rawArray
    .map(lang => {
      const clean = lang.trim().toLowerCase();
      if (LANGUAGE_MAP[clean]) return LANGUAGE_MAP[clean];
      if (clean.length > 1) {
        return clean.charAt(0).toUpperCase() + clean.slice(1);
      }
      return clean;
    })
    .filter(Boolean);
}
