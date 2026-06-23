/**
 * Symptom-to-Specialty Dictionary Map
 * A lightweight, fast mapping for medical search intent without external NLP engines.
 */

export const symptomToSpecialtyMap: Record<string, string[]> = {
  // General
  "fever": ["General Physician"],
  "bukhar": ["General Physician"],
  "cold": ["General Physician", "ENT Specialist"],
  "cough": ["General Physician", "ENT Specialist", "Pulmonologist"],
  "khasi": ["General Physician", "ENT Specialist", "Pulmonologist"],
  "general physician": ["General Physician"],
  "general medicine": ["General Physician"],
  "doctor": ["General Physician"],

  // Cardiology
  "heart": ["Cardiologist"],
  "chest pain": ["Cardiologist", "General Physician"],
  "dil": ["Cardiologist"],
  "blood pressure": ["Cardiologist", "General Physician"],
  "bp": ["Cardiologist", "General Physician"],
  "cardiology": ["Cardiologist"],
  "cardiologist": ["Cardiologist"],

  // Dermatology
  "skin": ["Dermatologist & Cosmetologist"],
  "hair": ["Dermatologist & Cosmetologist"],
  "hairfall": ["Dermatologist & Cosmetologist"],
  "acne": ["Dermatologist & Cosmetologist"],
  "pimple": ["Dermatologist & Cosmetologist"],
  "khujli": ["Dermatologist & Cosmetologist"],
  "dermatology": ["Dermatologist & Cosmetologist"],
  "dermatologist": ["Dermatologist & Cosmetologist"],

  // Pediatrics
  "child": ["Pediatrician"],
  "baby": ["Pediatrician"],
  "kid": ["Pediatrician"],
  "bacha": ["Pediatrician"],

  // Orthopedics
  "bone": ["Orthopedic Surgeon"],
  "joint": ["Orthopedic Surgeon", "Rheumatologist"],
  "knee": ["Orthopedic Surgeon"],
  "back pain": ["Orthopedic Surgeon", "Physiotherapist"],
  "haddi": ["Orthopedic Surgeon"],

  // Gynecology
  "pregnancy": ["Gynecologist & Obstetrician"],
  "period": ["Gynecologist & Obstetrician"],
  "women": ["Gynecologist & Obstetrician"],
  "aurat": ["Gynecologist & Obstetrician"],

  // Neurology
  "brain": ["Neurologist"],
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
  "tooth": ["Dentist"],
  "teeth": ["Dentist"],
  "gums": ["Dentist"],
  "daant": ["Dentist"],

  // Eye
  "eye": ["Ophthalmologist"],
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
