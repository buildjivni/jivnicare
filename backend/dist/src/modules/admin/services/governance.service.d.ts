import { PrismaService } from '../../../database/prisma.service';
import { AdminAuditService } from './admin-audit.service';
export declare class GovernanceService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AdminAuditService);
    suspendDoctor(adminId: string, doctorId: string, reason?: string): Promise<any>;
    suspendHospital(adminId: string, hospitalId: string, reason?: string): Promise<any>;
}
