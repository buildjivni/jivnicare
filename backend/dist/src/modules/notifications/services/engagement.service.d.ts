import { PrismaService } from '../../../database/prisma.service';
export declare class EngagementService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    saveDoctor(userId: string, doctorId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    unsaveDoctor(userId: string, doctorId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getSavedDoctors(userId: string, page?: number, limit?: number): Promise<{
        saved: {
            savedId: string;
            savedAt: Date;
            doctor: {
                id: string;
                name: string;
                district: string;
                specialties: {
                    name: string;
                }[];
                verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
                slug: string;
                profileImage: string | null;
                rating: number;
            };
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    isSaved(userId: string, doctorId: string): Promise<boolean>;
    getActivityFeed(adminId: string, limit?: number): Promise<{
        recentVerifications: {
            id: string;
            action: string;
            targetType: import("@prisma/client").$Enums.TargetType;
            targetId: string;
            adminName: string | null;
            createdAt: Date;
        }[];
        recentSaves: {
            doctorName: string;
            district: string;
            savedAt: Date;
        }[];
    }>;
}
