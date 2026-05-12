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
exports.TrustService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let TrustService = class TrustService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDoctorBadge(doctorId) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { id: doctorId },
            select: {
                id: true,
                name: true,
                verificationStatus: true,
                profileImage: true,
                rating: true,
            },
        });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor not found');
        return {
            isVerified: doctor.verificationStatus === 'VERIFIED',
            verificationStatus: doctor.verificationStatus,
            doctor: {
                id: doctor.id,
                name: doctor.name,
                profileImage: doctor.profileImage,
                rating: doctor.rating,
            },
        };
    }
    async getHospitalBadge(hospitalId) {
        const hospital = await this.prisma.hospital.findUnique({
            where: { id: hospitalId },
            select: {
                id: true,
                name: true,
                verificationStatus: true,
                emergencyAvailable: true,
                ambulanceAvailable: true,
                rating: true,
            },
        });
        if (!hospital)
            throw new common_1.NotFoundException('Hospital not found');
        return {
            isVerified: hospital.verificationStatus === 'VERIFIED',
            verificationStatus: hospital.verificationStatus,
            emergencyPriority: hospital.verificationStatus === 'VERIFIED' && hospital.emergencyAvailable,
            hospital: {
                id: hospital.id,
                name: hospital.name,
                emergencyAvailable: hospital.emergencyAvailable,
                ambulanceAvailable: hospital.ambulanceAvailable,
                rating: hospital.rating,
            },
        };
    }
    async reportEntity(reporterId, targetType, targetId, reason) {
        if (!reason || reason.trim().length < 10) {
            throw new common_1.BadRequestException('Please provide a detailed reason (min 10 characters).');
        }
        if (targetType === client_1.TargetType.DOCTOR) {
            const doc = await this.prisma.doctor.findUnique({ where: { id: targetId } });
            if (!doc)
                throw new common_1.NotFoundException('Doctor not found');
        }
        else if (targetType === client_1.TargetType.HOSPITAL) {
            const hosp = await this.prisma.hospital.findUnique({ where: { id: targetId } });
            if (!hosp)
                throw new common_1.NotFoundException('Hospital not found');
        }
        const recentReport = await this.prisma.moderationLog.findFirst({
            where: {
                adminId: reporterId,
                targetId,
                action: 'REPORTED',
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
        });
        if (recentReport) {
            throw new common_1.BadRequestException('You have already reported this profile in the last 24 hours.');
        }
        await this.prisma.moderationLog.create({
            data: {
                adminId: reporterId,
                action: 'REPORTED',
                targetType,
                targetId,
                reason: reason.trim(),
            },
        });
        return {
            message: 'Report submitted. Our team will review this profile shortly.',
        };
    }
    async getEmergencyHospitals(district) {
        const where = {
            verificationStatus: 'VERIFIED',
            emergencyAvailable: true,
        };
        if (district) {
            where.district = { equals: district, mode: 'insensitive' };
        }
        const hospitals = await this.prisma.hospital.findMany({
            where,
            orderBy: { rating: 'desc' },
            select: {
                id: true,
                name: true,
                slug: true,
                district: true,
                address: true,
                phone: true,
                emergencyAvailable: true,
                ambulanceAvailable: true,
                rating: true,
                verificationStatus: true,
            },
        });
        return {
            count: hospitals.length,
            hospitals,
        };
    }
    async getAuditLogs(page = 1, limit = 30, action) {
        const skip = (page - 1) * limit;
        const where = {};
        if (action)
            where.action = action.toUpperCase();
        const [logs, total] = await Promise.all([
            this.prisma.moderationLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    admin: { select: { name: true, phone: true, role: true } },
                },
            }),
            this.prisma.moderationLog.count({ where }),
        ]);
        return {
            data: logs,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async getReportedQueue(page = 1, limit = 20) {
        return this.getAuditLogs(page, limit, 'REPORTED');
    }
};
exports.TrustService = TrustService;
exports.TrustService = TrustService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrustService);
//# sourceMappingURL=trust.service.js.map