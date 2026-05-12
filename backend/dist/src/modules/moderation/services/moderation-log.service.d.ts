import { PrismaService } from '../../../database/prisma.service';
import { TargetType } from '@prisma/client';
export declare class ModerationLogService {
    private prisma;
    constructor(prisma: PrismaService);
    logAction(adminId: string, action: string, targetType: TargetType, targetId: string, reason?: string): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        targetType: import("@prisma/client").$Enums.TargetType;
        targetId: string;
        reason: string | null;
        adminId: string;
    }>;
}
