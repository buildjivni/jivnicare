import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fire-and-forget method to asynchronously log search queries to the DB for later analysis.
   */
  async trackSearch(query: string, normalizedQuery: string, district: string | undefined, resultsCount: number) {
    if (!query) return;

    try {
      // Execute asynchronously to avoid blocking the user's search response
      setTimeout(async () => {
        try {
          await this.prisma.searchAnalytics.create({
            data: {
              query,
              normalizedQuery,
              district,
              resultsCount,
            },
          });
        } catch (e) {
          this.logger.error(`Failed to track search query asynchronously: ${e.message}`);
        }
      }, 0);
    } catch (e) {
      this.logger.error(`Failed to dispatch search tracking: ${e.message}`);
    }
  }

  /**
   * Fetches trending searches based on frequency
   */
  async getTrendingSearches(limit: number = 5) {
    // A production-grade implementation would use grouping/aggregation
    // For now, we simulate finding the most frequent recent queries
    const results = await this.prisma.searchAnalytics.groupBy({
      by: ['normalizedQuery'],
      _count: { normalizedQuery: true },
      orderBy: { _count: { normalizedQuery: 'desc' } },
      take: limit,
    });

    return results.map((r: any) => ({
      query: r.normalizedQuery,
      count: r._count.normalizedQuery,
    }));
  }
}
