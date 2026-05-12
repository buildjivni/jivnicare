import { PrismaService } from '../../../database/prisma.service';
export declare class PlatformAnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getOverview(): Promise<{
        searches: {
            total: number;
            today: number;
        };
        profileViews: {
            total: number;
            today: number;
        };
        failedSearches: {
            today: number;
        };
    }>;
}
