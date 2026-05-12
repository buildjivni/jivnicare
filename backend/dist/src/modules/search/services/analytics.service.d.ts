import { PrismaService } from '../../../database/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    trackSearch(query: string, normalizedQuery: string, district: string | undefined, resultsCount: number): Promise<void>;
    getTrendingSearches(limit?: number): Promise<{
        query: any;
        count: any;
    }[]>;
}
