import { Injectable } from '@nestjs/common';

@Injectable()
export class EmergencyRankingService {
  private readonly EMERGENCY_KEYWORDS = [
    'emergency', 'emergancy', 'emergncy',
    'urgent', 'accident', 'heart attack',
    'stroke', 'ambulance', 'severe', 'critical'
  ];

  /**
   * Checks if the query contains emergency intent.
   */
  isEmergencyQuery(query: string): boolean {
    const q = query.toLowerCase();
    return this.EMERGENCY_KEYWORDS.some(keyword => q.includes(keyword));
  }

  /**
   * Provides a significant relevance boost (points) if the entity supports emergency.
   */
  calculateEmergencyBoost(isEmergencyQuery: boolean, entityEmergencyAvailable: boolean): number {
    if (isEmergencyQuery && entityEmergencyAvailable) {
      return 100; // Massive boost for emergency queries matching emergency providers
    }
    
    if (entityEmergencyAvailable) {
      return 10; // Slight inherent boost for having emergency capabilities generally
    }

    return 0;
  }
}
