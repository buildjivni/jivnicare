import { PrismaService } from '../../database/prisma.service';
import { TargetType } from '@prisma/client';
export declare class TrustService {
    private prisma;
    constructor(prisma: PrismaService);
    getDoctorBadge(doctorId: string): Promise<{
        isVerified: boolean;
        verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
        doctor: {
            id: string;
            name: string;
            profileImage: string | null;
            rating: number;
        };
    }>;
    getHospitalBadge(hospitalId: string): Promise<{
        isVerified: boolean;
        verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
        emergencyPriority: boolean;
        hospital: {
            id: string;
            name: string;
            emergencyAvailable: boolean;
            ambulanceAvailable: boolean;
            rating: number;
        };
    }>;
    reportEntity(reporterId: string, targetType: TargetType, targetId: string, reason: string): Promise<{
        message: string;
    }>;
    getEmergencyHospitals(district?: string): Promise<{
        count: number;
        hospitals: {
            phone: string;
            id: string;
            name: string;
            district: string;
            emergencyAvailable: boolean;
            verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
            slug: string;
            rating: number;
            address: string;
            ambulanceAvailable: boolean;
        }[];
    }>;
    getAuditLogs(page?: number, limit?: number, action?: string): Promise<{
        data: ({
            admin: {
                phone: string;
                name: string | null;
                role: import("@prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            createdAt: Date;
            action: string;
            targetType: import("@prisma/client").$Enums.TargetType;
            targetId: string;
            reason: string | null;
            adminId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getReportedQueue(page?: number, limit?: number): Promise<{
        data: ({
            admin: {
                phone: string;
                name: string | null;
                role: import("@prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            createdAt: Date;
            action: string;
            targetType: import("@prisma/client").$Enums.TargetType;
            targetId: string;
            reason: string | null;
            adminId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
