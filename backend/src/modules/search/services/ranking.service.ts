import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { TypoHandlerService } from './typo-handler.service';
import { KeywordMapperService } from './keyword-mapper.service';
import { EmergencyRankingService } from './emergency-ranking.service';
import { Prisma } from '@prisma/client';
import { SearchQueryDto } from '../dto/search.dto';

@Injectable()
export class RankingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly typoHandler: TypoHandlerService,
    private readonly keywordMapper: KeywordMapperService,
    private readonly emergencyRanking: EmergencyRankingService,
  ) {}

  async searchAndRank(dto: SearchQueryDto) {
    const { q = '', district, specialty, emergency, page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    // 1. Intelligence Pre-processing
    const correctedQuery = this.typoHandler.correctQuery(q);
    const expandedTerms = this.keywordMapper.expandQuery(correctedQuery);
    const mappedSpecialties = this.keywordMapper.extractSpecialties(correctedQuery);
    const isEmergency = emergency || this.emergencyRanking.isEmergencyQuery(correctedQuery);

    // 2. Fetch Candidates
    const [doctors, hospitals] = await Promise.all([
      this.fetchDoctors(expandedTerms, mappedSpecialties, district, specialty, isEmergency, skip, limit),
      this.fetchHospitals(expandedTerms, district, specialty, isEmergency, skip, limit)
    ]);

    // 3. Trust & Relevance Ranking
    const rankedDoctors = doctors.map((doc: any) => ({
      ...doc,
      score: this.calculateDoctorScore(doc, isEmergency, district)
    })).sort((a: any, b: any) => b.score - a.score);

    const rankedHospitals = hospitals.map((hosp: any) => ({
      ...hosp,
      score: this.calculateHospitalScore(hosp, isEmergency, district)
    })).sort((a: any, b: any) => b.score - a.score);

    return {
      normalizedQuery: correctedQuery,
      doctors: rankedDoctors,
      hospitals: rankedHospitals,
    };
  }

  private async fetchDoctors(
    terms: string[], mappedSpecialties: string[], 
    district?: string, specialty?: string, emergency?: boolean, 
    skip = 0, limit = 20
  ) {
    const where: Prisma.DoctorWhereInput = {};

    if (district) where.district = { equals: district, mode: 'insensitive' };
    if (emergency) where.emergencyAvailable = true;
    
    // Combine direct specialty filter with symptom-mapped specialties
    const specFilters = [];
    if (specialty) specFilters.push({ slug: specialty.toLowerCase() });
    mappedSpecialties.forEach(s => specFilters.push({ slug: s.toLowerCase() }));
    
    if (specFilters.length > 0) {
      where.specialties = { some: { OR: specFilters } };
    }

    if (terms.length > 0 && terms[0] !== '') {
      where.OR = terms.flatMap(term => [
        { name: { contains: term, mode: 'insensitive' } },
        { user: { name: { contains: term, mode: 'insensitive' } } },
        { specialties: { some: { name: { contains: term, mode: 'insensitive' } } } }
      ]);
    }

    return this.prisma.doctor.findMany({
      where,
      include: {
        user: { select: { name: true } },
        specialties: { select: { name: true, slug: true } }
      },
      skip,
      take: limit * 2, // overfetch slightly to allow local sorting
    });
  }

  private async fetchHospitals(
    terms: string[], district?: string, specialty?: string, emergency?: boolean, 
    skip = 0, limit = 20
  ) {
    const where: Prisma.HospitalWhereInput = {};

    if (district) where.district = { equals: district, mode: 'insensitive' };
    if (emergency) where.emergencyAvailable = true;

    if (terms.length > 0 && terms[0] !== '') {
      where.OR = terms.flatMap(term => [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } }
      ]);
    }

    return this.prisma.hospital.findMany({
      where,
      skip,
      take: limit * 2,
    });
  }

  // --- Scoring Algorithms ---

  private calculateDoctorScore(doc: any, isEmergencyQuery: boolean, requestedDistrict?: string): number {
    let score = 0;

    // 1. Core Trust Metrics
    if (doc.verificationStatus === 'VERIFIED') score += 50;
    if (doc.verificationStatus === 'SUSPENDED') score -= 100;
    if (!doc.isAcceptingAppointments) score -= 100;
    
    score += (doc.rating || 0) * 2; // Up to 10 points
    
    // 2. Profile Completeness
    score += (doc.profileCompletionPercentage || 0) * 0.2; // Up to 20 points

    // 3. Contextual Relevance
    if (requestedDistrict && doc.district?.toLowerCase() === requestedDistrict.toLowerCase()) {
      score += 30;
    }

    // 4. Emergency
    score += this.emergencyRanking.calculateEmergencyBoost(isEmergencyQuery, doc.emergencyAvailable);

    return score;
  }

  private calculateHospitalScore(hosp: any, isEmergencyQuery: boolean, requestedDistrict?: string): number {
    let score = 0;

    if (hosp.verificationStatus === 'VERIFIED') score += 50;
    if (hosp.verificationStatus === 'SUSPENDED') score -= 100;

    score += (hosp.rating || 0) * 2;

    if (requestedDistrict && hosp.district?.toLowerCase() === requestedDistrict.toLowerCase()) {
      score += 30;
    }

    score += this.emergencyRanking.calculateEmergencyBoost(isEmergencyQuery, hosp.emergencyAvailable);

    return score;
  }
}
