import { PrismaService } from '../../../database/prisma.service';
import { TargetType } from '@prisma/client';
export declare class AdminAuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    logAction(adminId: string, action: string, targetType: TargetType, targetId: string, reason?: string): Promise<void>;
}
