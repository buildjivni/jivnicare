import { PrismaService } from '../../database/prisma.service';
export declare class SeoService {
    private prisma;
    constructor(prisma: PrismaService);
    getSitemapData(): Promise<{
        doctors: {
            updatedAt: Date;
            slug: string;
        }[];
        hospitals: {
            updatedAt: Date;
            slug: string;
        }[];
    }>;
    getActiveDistricts(): Promise<string[]>;
}
