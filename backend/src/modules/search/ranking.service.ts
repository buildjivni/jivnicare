import { Injectable } from '@nestjs/common';

@Injectable()
export class RankingService {
  /**
   * Applies weighted scoring to a raw array of doctors or hospitals.
   * Modifies the objects in place by adding a `_score` property.
   */
  rankResults(
    results: any[],
    queryTerms: string[],
    districtFilter?: string,
    specialtyFilter?: string,
  ) {
    results.forEach((item) => {
      let score = 0;

      // 1. Base trust metrics
      if (item.verificationStatus === 'VERIFIED') score += 3;
      if (item.emergencyAvailable) score += 5;

      // Rating multiplier (e.g., 4.5 rating = +4.5 points)
      if (item.rating) score += item.rating;

      // 2. District Match (High priority if exact)
      if (
        districtFilter &&
        item.district?.toLowerCase() === districtFilter.toLowerCase()
      ) {
        score += 5;
      }

      // 3. Specialty Exact Match
      if (specialtyFilter) {
        const hasSpecialty = item.specialties?.some(
          (s: any) =>
            s.slug === specialtyFilter.toLowerCase() ||
            s.name.toLowerCase() === specialtyFilter.toLowerCase(),
        );
        if (hasSpecialty) score += 10;
      }

      // 4. Keyword / Name matches from the search query
      if (queryTerms.length > 0) {
        queryTerms.forEach((term) => {
          // Name match
          if (item.name?.toLowerCase().includes(term)) score += 8;

          // Hospital match (for doctors)
          if (item.hospitalName?.toLowerCase().includes(term)) score += 5;

          // Keyword matches
          const hasKeyword = item.keywords?.some((k: any) =>
            k.term.toLowerCase().includes(term),
          );
          if (hasKeyword) score += 8;
        });
      }

      item._score = score;
    });

    // Sort descending by score
    results.sort((a, b) => b._score - a._score);
    return results;
  }
}
