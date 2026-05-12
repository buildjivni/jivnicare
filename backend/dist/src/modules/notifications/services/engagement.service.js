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
var EngagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
let EngagementService = EngagementService_1 = class EngagementService {
    prisma;
    logger = new common_1.Logger(EngagementService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async saveDoctor(userId, doctorId) {
        const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor not found');
        try {
            await this.prisma.savedDoctor.create({ data: { userId, doctorId } });
            return { success: true, message: 'Doctor saved successfully' };
        }
        catch {
            throw new common_1.ConflictException('Doctor is already saved');
        }
    }
    async unsaveDoctor(userId, doctorId) {
        const existing = await this.prisma.savedDoctor.findUnique({
            where: { userId_doctorId: { userId, doctorId } },
        });
        if (!existing)
            throw new common_1.NotFoundException('Saved doctor not found');
        await this.prisma.savedDoctor.delete({
            where: { userId_doctorId: { userId, doctorId } },
        });
        return { success: true, message: 'Doctor removed from saved list' };
    }
    async getSavedDoctors(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [saved, total] = await Promise.all([
            this.prisma.savedDoctor.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    doctor: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            profileImage: true,
                            district: true,
                            rating: true,
                            verificationStatus: true,
                            specialties: { select: { name: true } },
                        },
                    },
                },
            }),
            this.prisma.savedDoctor.count({ where: { userId } }),
        ]);
        return {
            saved: saved.map((s) => ({
                savedId: s.id,
                savedAt: s.createdAt,
                doctor: s.doctor,
            })),
            total,
            page,
            limit,
        };
    }
    async isSaved(userId, doctorId) {
        const found = await this.prisma.savedDoctor.findUnique({
            where: { userId_doctorId: { userId, doctorId } },
        });
        return !!found;
    }
    async getActivityFeed(adminId, limit = 20) {
        const [recentVerifications, recentSaves] = await Promise.all([
            this.prisma.moderationLog.findMany({
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    admin: { select: { name: true, phone: true } },
                },
            }),
            this.prisma.savedDoctor.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    doctor: { select: { name: true, district: true } },
                },
            }),
        ]);
        return {
            recentVerifications: recentVerifications.map((v) => ({
                id: v.id,
                action: v.action,
                targetType: v.targetType,
                targetId: v.targetId,
                adminName: v.admin.name,
                createdAt: v.createdAt,
            })),
            recentSaves: recentSaves.map((s) => ({
                doctorName: s.doctor.name,
                district: s.doctor.district,
                savedAt: s.createdAt,
            })),
        };
    }
};
exports.EngagementService = EngagementService;
exports.EngagementService = EngagementService = EngagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EngagementService);
//# sourceMappingURL=engagement.service.js.map