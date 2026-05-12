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
exports.DoctorDashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
let DoctorDashboardService = class DoctorDashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { userId },
            include: {
                specialties: true,
                keywords: true,
                user: {
                    select: { phone: true, isVerified: true },
                },
            },
        });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor profile not found');
        return {
            profile: doctor,
            verificationStatus: doctor.verificationStatus,
        };
    }
    async updateProfile(userId, updateDto) {
        const { specialties, keywords, ...doctorData } = updateDto;
        const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor profile not found');
        const updatePayload = { ...doctorData };
        if (specialties) {
            updatePayload.specialties = {
                set: [],
                connectOrCreate: specialties.map((sp) => ({
                    where: { slug: sp.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
                    create: {
                        name: sp,
                        slug: sp.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    },
                })),
            };
        }
        if (keywords) {
            updatePayload.keywords = {
                set: [],
                connectOrCreate: keywords.map((kw) => ({
                    where: { term: kw.toLowerCase() },
                    create: { term: kw.toLowerCase() },
                })),
            };
        }
        const updatedDoctor = await this.prisma.doctor.update({
            where: { userId },
            data: updatePayload,
            include: { specialties: true, keywords: true },
        });
        if (doctorData.name) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { name: doctorData.name },
            });
        }
        return {
            message: 'Doctor profile updated successfully',
            doctor: updatedDoctor,
        };
    }
    async updateSettings(userId, settingsDto) {
        const doctor = await this.prisma.doctor.update({
            where: { userId },
            data: settingsDto,
            select: { emergencyAvailable: true },
        });
        return {
            message: 'Settings updated successfully',
            settings: doctor,
        };
    }
};
exports.DoctorDashboardService = DoctorDashboardService;
exports.DoctorDashboardService = DoctorDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DoctorDashboardService);
//# sourceMappingURL=doctor-dashboard.service.js.map