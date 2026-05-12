import { PrismaService } from '../../../database/prisma.service';
export declare class HospitalAnalyticsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    logView(hospitalId: string): Promise<void>;
    getPopularHospitals(limit?: number): Promise<{
        hospital: {
            id: string;
            name: string;
            district: string;
            emergencyAvailable: boolean;
        } | undefined;
        views: any;
    }[]>;
}
