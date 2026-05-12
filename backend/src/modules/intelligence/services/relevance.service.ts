import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

const BIHAR_DISTRICTS = [
  'Patna', 'Gaya', 'Muzaffarpur', 'Darbhanga', 'Bhagalpur',
  'Begusarai', 'Munger', 'Samastipur', 'Nalanda', 'Sitamarhi',
];

@Injectable()
export class RelevanceService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Trending searches from analytics ─────────────────────────
  async getTrendingSearches(district?: string, limit = 10) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days

    const where: any = { createdAt: { gte: since } };
    if (district) where.district = district;

    const raw = await this.prisma.searchAnalytics.groupBy({
      by: ['normalizedQuery'],
      where,
      _count: { normalizedQuery: true },
      orderBy: { _count: { normalizedQuery: 'desc' } },
      take: limit,
    });

    return raw.map(r => ({
      query: r.normalizedQuery,
      count: r._count.normalizedQuery,
    }));
  }

  // ── District-wise trending (for Bihar-specific discovery) ─────
  async getDistrictTrending(limit = 5) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const result: Record<string, { query: string; count: number }[]> = {};

    for (const district of BIHAR_DISTRICTS) {
      const raw = await this.prisma.searchAnalytics.groupBy({
        by: ['normalizedQuery'],
        where: { district, createdAt: { gte: since } },
        _count: { normalizedQuery: true },
        orderBy: { _count: { normalizedQuery: 'desc' } },
        take: limit,
      });

      if (raw.length > 0) {
        result[district] = raw.map(r => ({
          query: r.normalizedQuery,
          count: r._count.normalizedQuery,
        }));
      }
    }

    return result;
  }

  // ── Trending specialties platform-wide ────────────────────────
  async getTrendingSpecialties(limit = 8) {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    // Get top viewed doctor specialties from profile analytics
    const topViewed = await this.prisma.profileAnalytics.groupBy({
      by: ['targetId'],
      where: { targetType: 'DOCTOR', createdAt: { gte: since } },
      _count: { targetId: true },
      orderBy: { _count: { targetId: 'desc' } },
      take: 20,
    });

    if (topViewed.length === 0) {
      // Fallback to static popular specialties
      return [
        { name: 'Cardiologist', slug: 'cardiologist', viewCount: 0 },
        { name: 'General Physician', slug: 'general-physician', viewCount: 0 },
        { name: 'Pediatrician', slug: 'pediatrician', viewCount: 0 },
        { name: 'Dermatologist', slug: 'dermatologist', viewCount: 0 },
        { name: 'Orthopedist', slug: 'orthopedist', viewCount: 0 },
      ];
    }

    // Get specialties of the top-viewed doctors
    const doctorIds = topViewed.map(d => d.targetId);
    const doctors = await this.prisma.doctor.findMany({
      where: { id: { in: doctorIds } },
      include: { specialties: { select: { name: true, slug: true } } },
    });

    const specCount: Record<string, { name: string; slug: string; viewCount: number }> = {};
    topViewed.forEach(view => {
      const doc = doctors.find(d => d.id === view.targetId);
      doc?.specialties.forEach(s => {
        if (!specCount[s.slug]) {
          specCount[s.slug] = { name: s.name, slug: s.slug, viewCount: 0 };
        }
        specCount[s.slug].viewCount += view._count.targetId;
      });
    });

    return Object.values(specCount)
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  }

  // ── "Did you mean?" correction ────────────────────────────────
  didYouMean(correctedQuery: string, originalQuery: string): string | undefined {
    if (correctedQuery.toLowerCase() !== originalQuery.toLowerCase()) {
      return correctedQuery;
    }
    return undefined;
  }

  // ── Zero-results helper ───────────────────────────────────────
  async getZeroResultHelp(query: string) {
    // Get available specialties for fallback
    const specialties = await this.prisma.specialty.findMany({
      take: 6,
      select: { name: true, slug: true },
    });

    return {
      message: `No results found for "${query}". Try one of these:`,
      suggestions: specialties.map(s => s.name),
      emergencyNote: 'For medical emergencies, search "emergency" to find 24x7 hospitals.',
    };
  }
}
