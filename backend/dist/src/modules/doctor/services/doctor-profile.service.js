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
exports.DoctorProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
let DoctorProfileService = class DoctorProfileService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfileByUserId(userId) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { userId },
            include: { specialties: true },
        });
        if (!doctor) {
            throw new common_1.NotFoundException('Doctor profile not found');
        }
        return doctor;
    }
    async updateProfile(userId, dto) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { userId },
            include: { specialties: true },
        });
        if (!doctor) {
            throw new common_1.NotFoundException('Doctor profile not found');
        }
        const { specialties, ...rest } = dto;
        const updateData = { ...rest };
        if (specialties) {
            updateData.specialties = {
                set: [],
                connectOrCreate: specialties.map(s => ({
                    where: { name: s },
                    create: { name: s, slug: s.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
                })),
            };
        }
        const updatedDoctor = await this.prisma.doctor.update({
            where: { id: doctor.id },
            data: updateData,
            include: { specialties: true },
        });
        const completionPercentage = this.calculateProfileCompletion(updatedDoctor);
        return this.prisma.doctor.update({
            where: { id: doctor.id },
            data: { profileCompletionPercentage: completionPercentage },
            include: { specialties: true },
        });
    }
    calculateProfileCompletion(doctor) {
        let score = 0;
        let totalFields = 8;
        if (doctor.bio && doctor.bio.trim().length > 0)
            score++;
        if (doctor.experience !== undefined && doctor.experience > 0)
            score++;
        if (doctor.fee !== undefined && doctor.fee > 0)
            score++;
        if (doctor.district && doctor.district.trim().length > 0)
            score++;
        if (doctor.hospitalName && doctor.hospitalName.trim().length > 0)
            score++;
        if (doctor.profileImage && doctor.profileImage.trim().length > 0)
            score++;
        if (doctor.specialties && doctor.specialties.length > 0)
            score++;
        if (doctor.availableDays && doctor.availableDays.length > 0 && doctor.availableTimeSlots)
            score++;
        return Math.round((score / totalFields) * 100);
    }
};
exports.DoctorProfileService = DoctorProfileService;
exports.DoctorProfileService = DoctorProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DoctorProfileService);
//# sourceMappingURL=doctor-profile.service.js.map