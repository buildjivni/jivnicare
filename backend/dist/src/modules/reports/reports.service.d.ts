import { PrismaService } from '../../database/prisma.service';
import { ReportStatus, TargetType } from '@prisma/client';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    createReport(reporterId: string, data: {
        targetType: TargetType;
        targetId: string;
        reason: string;
        description?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        targetType: import("@prisma/client").$Enums.TargetType;
        targetId: string;
        reason: string;
        status: import("@prisma/client").$Enums.ReportStatus;
        adminNotes: string | null;
        reporterId: string;
    }>;
    getAdminReports(status?: ReportStatus): Promise<({
        reporter: {
            phone: string;
            id: string;
            name: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        targetType: import("@prisma/client").$Enums.TargetType;
        targetId: string;
        reason: string;
        status: import("@prisma/client").$Enums.ReportStatus;
        adminNotes: string | null;
        reporterId: string;
    })[]>;
    updateReportStatus(reportId: string, adminId: string, data: {
        status: ReportStatus;
        adminNotes?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        targetType: import("@prisma/client").$Enums.TargetType;
        targetId: string;
        reason: string;
        status: import("@prisma/client").$Enums.ReportStatus;
        adminNotes: string | null;
        reporterId: string;
    }>;
}
