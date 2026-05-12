import { Injectable } from '@nestjs/common';

@Injectable()
export class TypoHandlerService {
  /**
   * Lightweight in-memory dictionary for common medical typos, 
   * especially prevalent in mixed-language searches.
   */
  private readonly TYPO_MAP: Record<string, string> = {
    // Cardiology
    cardiolgist: 'cardiologist', cardiologst: 'cardiologist', cardologist: 'cardiologist',
    
    // Dermatology
    dermatoligist: 'dermatologist', dermatlogist: 'dermatologist', dermatolgist: 'dermatologist',
    
    // Pediatrics
    pedatrician: 'pediatrician', peditrician: 'pediatrician', paeditrician: 'pediatrician',
    
    // Orthopedics
    orthopedist: 'orthopedist', orthopaedist: 'orthopedist', orthopadist: 'orthopedist',
    
    // Neurology
    neuroloist: 'neurologist', nuerologist: 'neurologist', neruologist: 'neurologist',
    
    // Gynecology
    ginecologist: 'gynecologist', gynacologist: 'gynecologist', gynaecologist: 'gynecologist',
    
    // Ophthalmology
    opthalmologist: 'ophthalmologist', opthamologist: 'ophthalmologist',
    
    // General terms
    hospitel: 'hospital', hospitl: 'hospital', hospita: 'hospital',
    emergncy: 'emergency', emergancy: 'emergency', emergeny: 'emergency',
    diabities: 'diabetes', diabetis: 'diabetes', diabates: 'diabetes',
    presure: 'pressure', pressur: 'pressure',
    doctir: 'doctor', doctar: 'doctor',
  };

  /**
   * Corrects known typos in the search query.
   */
  correctQuery(query: string): string {
    if (!query) return '';

    return query
      .toLowerCase()
      .split(/\s+/)
      .map(word => this.TYPO_MAP[word] || word)
      .join(' ');
  }
}
