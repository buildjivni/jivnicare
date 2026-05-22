/**
 * Symptom-to-Specialty Dictionary Map
 * A lightweight, fast mapping for medical search intent without external NLP engines.
 */

export const symptomToSpecialtyMap: Record<string, string[]> = {
  // General
  "fever": ["General Physician", "Internal Medicine"],
  "bukhar": ["General Physician", "Internal Medicine"],
  "cold": ["General Physician", "ENT"],
  "cough": ["General Physician", "ENT", "Pulmonologist"],
  "khasi": ["General Physician", "ENT", "Pulmonologist"],
  
  // Cardiology
  "heart": ["Cardiologist", "Cardiac Surgeon"],
  "chest pain": ["Cardiologist", "General Physician"],
  "dil": ["Cardiologist"],
  "blood pressure": ["Cardiologist", "Internal Medicine"],
  "bp": ["Cardiologist", "Internal Medicine"],

  // Dermatology
  "skin": ["Dermatologist"],
  "hair": ["Dermatologist"],
  "hairfall": ["Dermatologist"],
  "acne": ["Dermatologist"],
  "pimple": ["Dermatologist"],
  "khujli": ["Dermatologist"],

  // Pediatrics
  "child": ["Pediatrician"],
  "baby": ["Pediatrician"],
  "kid": ["Pediatrician"],
  "bacha": ["Pediatrician"],

  // Orthopedics
  "bone": ["Orthopedic Surgeon", "Orthopedist"],
  "joint": ["Orthopedic Surgeon", "Rheumatologist"],
  "knee": ["Orthopedic Surgeon"],
  "back pain": ["Orthopedic Surgeon", "Physiotherapist"],
  "haddi": ["Orthopedic Surgeon"],

  // Gynecology
  "pregnancy": ["Gynecologist", "Obstetrician"],
  "period": ["Gynecologist"],
  "women": ["Gynecologist"],
  "aurat": ["Gynecologist"],

  // Neurology
  "brain": ["Neurologist", "Neurosurgeon"],
  "headache": ["Neurologist", "General Physician"],
  "migraine": ["Neurologist"],
  "sar dard": ["Neurologist", "General Physician"],

  // Gastroenterology
  "stomach": ["Gastroenterologist", "General Physician"],
  "gas": ["Gastroenterologist"],
  "acidity": ["Gastroenterologist", "General Physician"],
  "pet dard": ["Gastroenterologist"],
  "digestion": ["Gastroenterologist"],

  // Dental
  "tooth": ["Dentist", "Orthodontist"],
  "teeth": ["Dentist"],
  "gums": ["Dentist", "Periodontist"],
  "daant": ["Dentist"],

  // Eye
  "eye": ["Ophthalmologist", "Eye Specialist"],
  "vision": ["Ophthalmologist"],
  "aankh": ["Ophthalmologist"],
};

/**
 * Normalizes a query and looks for matching specialties in the dictionary.
 * @param query The user's search query
 * @returns Array of inferred specialties, or empty array if none found
 */
export function getInferredSpecialties(query: string): string[] {
  if (!query) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  let inferred: string[] = [];

  // Exact match first
  if (symptomToSpecialtyMap[normalizedQuery]) {
    inferred = [...symptomToSpecialtyMap[normalizedQuery]];
  }

  // Partial match for multiple words
  const words = normalizedQuery.split(/\s+/);
  for (const word of words) {
    if (symptomToSpecialtyMap[word]) {
      inferred = [...inferred, ...symptomToSpecialtyMap[word]];
    }
  }

  // Remove duplicates
  return Array.from(new Set(inferred));
}
