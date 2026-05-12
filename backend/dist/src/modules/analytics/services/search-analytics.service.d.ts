import { PrismaService } from '../../../database/prisma.service';
export declare class SearchAnalyticsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    logSearch(query: string, normalizedQuery: string, resultsCount: number, district?: string): Promise<void>;
    getTopSearches(limit?: number, district?: string): Promise<{
        query: any;
        count: any;
    }[]>;
    getFailedSearches(limit?: number, district?: string): Promise<{
        query: any;
        failures: any;
    }[]>;
}
