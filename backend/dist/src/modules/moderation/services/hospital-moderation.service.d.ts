import { PrismaService } from '../../../database/prisma.service';
import { ModerationLogService } from './moderation-log.service';
import { VerificationStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
export declare class HospitalModerationService {
    private prisma;
    private logService;
    private configService;
    private readonly logger;
    constructor(prisma: PrismaService, logService: ModerationLogService, configService: ConfigService);
    getPendingHospitals(page?: number, limit?: number): Promise<{
        data: ({
            specialties: {
                id: string;
                name: string;
                slug: string;
                doctorIds: string[];
                hospitalIds: string[];
            }[];
        } & {
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            district: string;
            emergencyAvailable: boolean;
            verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
            slug: string;
            rating: number;
            specialtyIds: string[];
            keywordIds: string[];
            description: string | null;
            address: string;
            hospitalType: string;
            ambulanceAvailable: boolean;
            website: string | null;
            images: string[];
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    setStatus(adminId: string, hospitalId: string, status: VerificationStatus, reason?: string): Promise<{
        success: boolean;
        message: string;
        hospital: {
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            district: string;
            emergencyAvailable: boolean;
            verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
            slug: string;
            rating: number;
            specialtyIds: string[];
            keywordIds: string[];
            description: string | null;
            address: string;
            hospitalType: string;
            ambulanceAvailable: boolean;
            website: string | null;
            images: string[];
        };
    }>;
}
