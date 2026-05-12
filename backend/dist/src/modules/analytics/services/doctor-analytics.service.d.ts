import { PrismaService } from '../../../database/prisma.service';
export declare class DoctorAnalyticsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    logView(doctorId: string): Promise<void>;
    getPopularDoctors(limit?: number): Promise<{
        doctor: {
            id: string;
            name: string;
            district: string;
            specialties: {
                name: string;
            }[];
        } | undefined;
        views: any;
    }[]>;
}
