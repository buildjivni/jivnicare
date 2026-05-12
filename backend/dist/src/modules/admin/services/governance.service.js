"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
const admin_audit_service_1 = require("./admin-audit.service");
const client_1 = require("@prisma/client");
let GovernanceService = class GovernanceService {
    prisma;
    auditService;
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async suspendDoctor(adminId, doctorId, reason) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { id: doctorId },
            include: { user: true },
        });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor not found');
        const updatedDoctor = await this.prisma.$transaction(async (tx) => {
            const doc = await tx.doctor.update({
                where: { id: doctorId },
                data: {
                    verificationStatus: 'SUSPENDED',
                    isAcceptingAppointments: false,
                },
            });
            await tx.user.update({
                where: { id: doctor.userId },
                data: { isVerified: false },
            });
            await this.auditService.logAction(adminId, 'SUSPEND', client_1.TargetType.DOCTOR, doctorId, reason);
            await tx.notification.create({
                data: {
                    userId: doctor.userId,
                    title: 'Account Suspended',
                    message: `Your doctor profile has been suspended by an administrator. Reason: ${reason || 'Violation of platform policies.'}`,
                    metadata: { action: 'SUSPEND', entity: 'DOCTOR' },
                },
            });
            return doc;
        });
        return updatedDoctor;
    }
    async suspendHospital(adminId, hospitalId, reason) {
        const hospital = await this.prisma.hospital.findUnique({
            where: { id: hospitalId },
        });
        if (!hospital)
            throw new common_1.NotFoundException('Hospital not found');
        const updatedHospital = await this.prisma.$transaction(async (tx) => {
            const hosp = await tx.hospital.update({
                where: { id: hospitalId },
                data: { verificationStatus: 'SUSPENDED' },
            });
            await this.auditService.logAction(adminId, 'SUSPEND', client_1.TargetType.HOSPITAL, hospitalId, reason);
            return hosp;
        });
        return updatedHospital;
    }
};
exports.GovernanceService = GovernanceService;
exports.GovernanceService = GovernanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        admin_audit_service_1.AdminAuditService])
], GovernanceService);
//# sourceMappingURL=governance.service.js.map