import { ReportsService } from './reports.service';
import { ReportStatus, TargetType } from '@prisma/client';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    submitReport(userId: string, body: {
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
    updateReport(reportId: string, adminId: string, body: {
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
