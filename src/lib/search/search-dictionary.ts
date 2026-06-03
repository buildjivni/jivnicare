/**
 * Symptom-to-Specialty Dictionary Map
 * A lightweight, fast mapping for medical search intent without external NLP engines.
 */

export const symptomToSpecialtyMap: Record<string, string[]> = {
  // General
  "fever": ["General Physician", "General Medicine", "Internal Medicine"],
  "bukhar": ["General Physician", "General Medicine", "Internal Medicine"],
  "cold": ["General Physician", "ENT"],
  "cough": ["General Physician", "ENT", "Pulmonologist"],
  "khasi": ["General Physician", "ENT", "Pulmonologist"],
  "general physician": ["General Physician", "General Medicine"],
  "general medicine": ["General Medicine", "General Physician"],
  "doctor": ["General Physician", "General Medicine"],
  

  // Cardiology
  "heart": ["Cardiology", "Cardiologist", "Cardiac Surgeon"],
  "chest pain": ["Cardiology", "Cardiologist", "General Physician"],
  "dil": ["Cardiology", "Cardiologist"],
  "blood pressure": ["Cardiology", "Cardiologist", "Internal Medicine"],
  "bp": ["Cardiology", "Cardiologist", "Internal Medicine"],
  "cardiology": ["Cardiology", "Cardiologist"],
  "cardiologist": ["Cardiology", "Cardiologist"],

  // Dermatology
  "skin": ["Dermatology", "Dermatologist"],
  "hair": ["Dermatology", "Dermatologist"],
  "hairfall": ["Dermatology", "Dermatologist"],
  "acne": ["Dermatology", "Dermatologist"],
  "pimple": ["Dermatology", "Dermatologist"],
  "khujli": ["Dermatology", "Dermatologist"],
  "dermatology": ["Dermatology", "Dermatologist"],
  "dermatologist": ["Dermatology", "Dermatologist"],


  // Pediatrics
  "child": ["Pediatrics", "Pediatrician"],
  "baby": ["Pediatrics", "Pediatrician"],
  "kid": ["Pediatrics", "Pediatrician"],
  "bacha": ["Pediatrics", "Pediatrician"],

  // Orthopedics
  "bone": ["Orthopedics", "Orthopedic Surgeon", "Orthopedist"],
  "joint": ["Orthopedics", "Orthopedic Surgeon", "Rheumatologist"],
  "knee": ["Orthopedics", "Orthopedic Surgeon"],
  "back pain": ["Orthopedics", "Orthopedic Surgeon", "Physiotherapist"],
  "haddi": ["Orthopedics", "Orthopedic Surgeon"],

  // Gynecology
  "pregnancy": ["Gynecology", "Gynecologist", "Obstetrician"],
  "period": ["Gynecology", "Gynecologist"],
  "women": ["Gynecology", "Gynecologist"],
  "aurat": ["Gynecology", "Gynecologist"],

  // Neurology
  "brain": ["Neurology", "Neurologist", "Neurosurgeon"],
  "headache": ["Neurology", "Neurologist", "General Physician"],
  "migraine": ["Neurology", "Neurologist"],
  "sar dard": ["Neurology", "Neurologist", "General Physician"],

  // Gastroenterology
  "stomach": ["Gastroenterology", "Gastroenterologist", "General Physician"],
  "gas": ["Gastroenterology", "Gastroenterologist"],
  "acidity": ["Gastroenterology", "Gastroenterologist", "General Physician"],
  "pet dard": ["Gastroenterology", "Gastroenterologist"],
  "digestion": ["Gastroenterology", "Gastroenterologist"],

  // Dental
  "tooth": ["Dentistry", "Dentist", "Orthodontist"],
  "teeth": ["Dentistry", "Dentist"],
  "gums": ["Dentistry", "Dentist", "Periodontist"],
  "daant": ["Dentistry", "Dentist"],

  // Eye
  "eye": ["Ophthalmology", "Ophthalmologist", "Eye Specialist"],
  "vision": ["Ophthalmology", "Ophthalmologist"],
  "aankh": ["Ophthalmology", "Ophthalmologist"],
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
