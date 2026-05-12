import { PrismaService } from '../../../database/prisma.service';
export declare class AdminDashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getOverview(): Promise<{
        doctors: {
            total: number;
            verified: number;
            pending: number;
        };
        hospitals: {
            total: number;
            verified: number;
        };
        users: {
            total: number;
        };
        recentActivity: never[];
    }>;
}
