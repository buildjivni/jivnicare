import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SearchAnalyticsService {
  private readonly logger = new Logger(SearchAnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  // Fire-and-forget logging. Does not block the main request.
  async logSearch(
    query: string,
    normalizedQuery: string,
    resultsCount: number,
    district?: string,
  ) {
    if (!query) return;

    try {
      await this.prisma.searchAnalytics.create({
        data: {
          query,
          normalizedQuery,
          district: district?.toLowerCase(),
          resultsCount,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log search: ${error.message}`);
    }
  }

  async getTopSearches(limit: number = 10, district?: string) {
    const where: Prisma.SearchAnalyticsWhereInput = {};
    if (district) where.district = district.toLowerCase();

    const result = await this.prisma.searchAnalytics.groupBy({
      by: ['normalizedQuery'],
      where,
      _count: { normalizedQuery: true },
      orderBy: { _count: { normalizedQuery: 'desc' } },
      take: limit,
    });

    return result.map((r: any) => ({
      query: r.normalizedQuery,
      count: r._count.normalizedQuery,
    }));
  }

  async getFailedSearches(limit: number = 10, district?: string) {
    const where: Prisma.SearchAnalyticsWhereInput = { resultsCount: 0 };
    if (district) where.district = district.toLowerCase();

    const result = await this.prisma.searchAnalytics.groupBy({
      by: ['normalizedQuery'],
      where,
      _count: { normalizedQuery: true },
      orderBy: { _count: { normalizedQuery: 'desc' } },
      take: limit,
    });

    return result.map((r: any) => ({
      query: r.normalizedQuery,
      failures: r._count.normalizedQuery,
    }));
  }
}
