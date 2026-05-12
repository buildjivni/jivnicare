import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class PlatformAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    // 24 hours ago
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalSearches,
      searchesToday,
      totalViews,
      viewsToday,
      failedSearchesToday,
    ] = await Promise.all([
      this.prisma.searchAnalytics.count(),
      this.prisma.searchAnalytics.count({
        where: { createdAt: { gte: yesterday } },
      }),
      this.prisma.profileAnalytics.count(),
      this.prisma.profileAnalytics.count({
        where: { createdAt: { gte: yesterday } },
      }),
      this.prisma.searchAnalytics.count({
        where: { resultsCount: 0, createdAt: { gte: yesterday } },
      }),
    ]);

    return {
      searches: { total: totalSearches, today: searchesToday },
      profileViews: { total: totalViews, today: viewsToday },
      failedSearches: { today: failedSearchesToday },
    };
  }
}
