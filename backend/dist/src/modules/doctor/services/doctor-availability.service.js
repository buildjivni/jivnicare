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
exports.DoctorAvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
const doctor_profile_service_1 = require("./doctor-profile.service");
let DoctorAvailabilityService = class DoctorAvailabilityService {
    prisma;
    profileService;
    constructor(prisma, profileService) {
        this.prisma = prisma;
        this.profileService = profileService;
    }
    async updateAvailability(userId, dto) {
        const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor profile not found');
        if (dto.availableTimeSlots) {
            this.validateTimeSlots(dto.availableTimeSlots);
        }
        const updatedDoctor = await this.prisma.doctor.update({
            where: { id: doctor.id },
            data: {
                ...(dto.availableDays && { availableDays: dto.availableDays }),
                ...(dto.availableTimeSlots && { availableTimeSlots: dto.availableTimeSlots }),
                ...(dto.maxAppointmentsPerDay !== undefined && { maxAppointmentsPerDay: dto.maxAppointmentsPerDay }),
            },
        });
        const score = this.profileService.calculateProfileCompletion(updatedDoctor);
        return this.prisma.doctor.update({
            where: { id: doctor.id },
            data: { profileCompletionPercentage: score },
        });
    }
    async updateBookingSettings(userId, dto) {
        const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor profile not found');
        return this.prisma.doctor.update({
            where: { id: doctor.id },
            data: dto,
        });
    }
    validateTimeSlots(slots) {
        for (const slot of slots) {
            const [startHour, startMin] = slot.start.split(':').map(Number);
            const [endHour, endMin] = slot.end.split(':').map(Number);
            const startTotal = startHour * 60 + startMin;
            const endTotal = endHour * 60 + endMin;
            if (startTotal >= endTotal) {
                throw new common_1.BadRequestException(`Invalid time slot: ${slot.start} to ${slot.end}. Start time must be before end time.`);
            }
        }
        const sortedSlots = [...slots].sort((a, b) => {
            const aStart = parseInt(a.start.replace(':', ''), 10);
            const bStart = parseInt(b.start.replace(':', ''), 10);
            return aStart - bStart;
        });
        for (let i = 0; i < sortedSlots.length - 1; i++) {
            const current = sortedSlots[i];
            const next = sortedSlots[i + 1];
            const currentEnd = parseInt(current.end.replace(':', ''), 10);
            const nextStart = parseInt(next.start.replace(':', ''), 10);
            if (currentEnd > nextStart) {
                throw new common_1.BadRequestException('Time slots cannot overlap');
            }
        }
    }
};
exports.DoctorAvailabilityService = DoctorAvailabilityService;
exports.DoctorAvailabilityService = DoctorAvailabilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        doctor_profile_service_1.DoctorProfileService])
], DoctorAvailabilityService);
//# sourceMappingURL=doctor-availability.service.js.map