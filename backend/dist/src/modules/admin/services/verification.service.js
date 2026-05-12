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
exports.VerificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
const admin_audit_service_1 = require("./admin-audit.service");
const client_1 = require("@prisma/client");
let VerificationService = class VerificationService {
    prisma;
    auditService;
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async getPendingDoctors() {
        return this.prisma.doctor.findMany({
            where: {
                user: { isVerified: false },
                verificationStatus: 'PENDING',
            },
            include: {
                user: { select: { name: true, phone: true } },
            },
            orderBy: {
                profileCompletionPercentage: 'desc',
            },
        });
    }
    async getPendingHospitals() {
        return this.prisma.hospital.findMany({
            where: {
                verificationStatus: 'PENDING',
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }
    async moderateDoctor(adminId, doctorId, action, reason) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { id: doctorId },
            include: { user: true },
        });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor not found');
        if (doctor.verificationStatus === 'VERIFIED' && action === 'APPROVE') {
            throw new common_1.BadRequestException('Doctor is already verified');
        }
        const newStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';
        const updatedDoctor = await this.prisma.$transaction(async (tx) => {
            const doc = await tx.doctor.update({
                where: { id: doctorId },
                data: { verificationStatus: newStatus },
            });
            if (action === 'APPROVE') {
                await tx.user.update({
                    where: { id: doctor.userId },
                    data: { isVerified: true },
                });
            }
            else if (action === 'REJECT') {
                await tx.user.update({
                    where: { id: doctor.userId },
                    data: { isVerified: false },
                });
            }
            await this.auditService.logAction(adminId, action, client_1.TargetType.DOCTOR, doctorId, reason);
            const title = action === 'APPROVE' ? 'Profile Verified' : 'Profile Rejected';
            const message = action === 'APPROVE'
                ? 'Congratulations! Your doctor profile has been verified and is now live on JivniCare.'
                : `Your profile verification was rejected. Reason: ${reason || 'Please review our guidelines and update your profile.'}`;
            await tx.notification.create({
                data: {
                    userId: doctor.userId,
                    title,
                    message,
                    metadata: { action, entity: 'DOCTOR' },
                },
            });
            return doc;
        });
        return updatedDoctor;
    }
    async moderateHospital(adminId, hospitalId, action, reason) {
        const hospital = await this.prisma.hospital.findUnique({
            where: { id: hospitalId },
        });
        if (!hospital)
            throw new common_1.NotFoundException('Hospital not found');
        const newStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';
        const updatedHospital = await this.prisma.$transaction(async (tx) => {
            const hosp = await tx.hospital.update({
                where: { id: hospitalId },
                data: { verificationStatus: newStatus },
            });
            await this.auditService.logAction(adminId, action, client_1.TargetType.HOSPITAL, hospitalId, reason);
            return hosp;
        });
        return updatedHospital;
    }
};
exports.VerificationService = VerificationService;
exports.VerificationService = VerificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        admin_audit_service_1.AdminAuditService])
], VerificationService);
//# sourceMappingURL=verification.service.js.map