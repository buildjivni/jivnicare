import { Injectable } from '@nestjs/common';

@Injectable()
export class KeywordMapperService {
  /**
   * Symptom -> Specialty mapping (Hindi + English + Hinglish)
   */
  public readonly SYMPTOM_MAP: Record<string, string[]> = {
    // Fever / General
    bukhar: ['general physician', 'fever', 'general medicine'],
    fever: ['general physician', 'general medicine', 'bukhar'],
    'viral fever': ['general physician', 'general medicine'],
    malaria: ['general physician', 'infectious disease'],

    // Pediatrics
    baccha: ['pediatrician', 'child specialist'],
    bache: ['pediatrician', 'child specialist'],
    child: ['pediatrician', 'child specialist'],

    // Orthopedics / Bones
    haddi: ['orthopedist', 'orthopedics', 'bone doctor'],
    bone: ['orthopedist', 'orthopedics', 'bone doctor'],
    'joint pain': ['orthopedist', 'rheumatologist'],
    'back pain': ['orthopedist', 'neurologist'],
    kamar: ['orthopedist'], // kamar dard (back pain)

    // Gastroenterology / Stomach
    pet: ['gastroenterologist', 'stomach', 'general physician'],
    stomach: ['gastroenterologist', 'general physician'],
    acidity: ['gastroenterologist', 'general physician'],

    // Cardiology / Heart
    heart: ['cardiologist', 'heart specialist'],
    dil: ['cardiologist'],
    'chest pain': ['cardiologist', 'general physician'],

    // Dermatology / Skin
    skin: ['dermatologist', 'skin specialist'],
    allergy: ['dermatologist', 'allergist'],
    khujli: ['dermatologist'], // itching
    hair: ['dermatologist', 'trichologist'],

    // Gynecology / Women
    pregnancy: ['gynecologist', 'obstetrician'],
    women: ['gynecologist'],
    aurat: ['gynecologist'],
    mahila: ['gynecologist'],

    // Neurology / Brain
    brain: ['neurologist', 'neurosurgeon'],
    headache: ['neurologist', 'general physician'],
    sar: ['neurologist', 'general physician'], // sar dard

    // Dentistry
    tooth: ['dentist', 'dental'],
    teeth: ['dentist', 'dental'],
    daant: ['dentist'],
  };

  /**
   * Extracts mapped specialties from the query to boost relevance.
   */
  extractSpecialties(query: string): string[] {
    const specialties = new Set<string>();
    
    // Check multi-word keys first
    for (const [symptom, mappedSpecs] of Object.entries(this.SYMPTOM_MAP)) {
      if (query.includes(symptom)) {
        mappedSpecs.forEach(spec => specialties.add(spec));
      }
    }

    return Array.from(specialties);
  }

  /**
   * Expands the query with English translations to hit standard database records.
   */
  expandQuery(query: string): string[] {
    const terms = query.split(/\s+/);
    const expanded = new Set<string>(terms);

    terms.forEach(term => {
      // Direct symptom to english expansion (simplistic approach for fast querying)
      if (this.SYMPTOM_MAP[term]) {
        this.SYMPTOM_MAP[term].forEach(t => expanded.add(t));
      }
    });

    return Array.from(expanded);
  }
}
