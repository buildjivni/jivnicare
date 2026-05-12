import { PrismaService } from '../../../database/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getOverview(): Promise<{
        doctors: {
            total: number;
            verified: number;
            pending: number;
        };
        hospitals: {
            total: number;
            pending: number;
        };
        bookings: {
            total: number;
            active: number;
        };
    }>;
}
