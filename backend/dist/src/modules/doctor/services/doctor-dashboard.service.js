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
    async getDashboardStats(userId) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { userId },
        });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor profile not found');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [todayAppointments, pendingBookings, completedAppointments] = await Promise.all([
            this.prisma.queueToken.count({
                where: {
                    queue: { doctorId: doctor.id, date: { gte: today, lt: tomorrow } },
                    status: { in: ['WAITING', 'IN_CONSULTATION', 'COMPLETED'] },
                },
            }),
            this.prisma.queueToken.count({
                where: {
                    queue: { doctorId: doctor.id },
                    status: 'WAITING',
                },
            }),
            this.prisma.queueToken.count({
                where: {
                    queue: { doctorId: doctor.id },
                    status: 'COMPLETED',
                },
            })
        ]);
        return {
            profileCompletionPercentage: doctor.profileCompletionPercentage,
            verificationStatus: doctor.verificationStatus,
            isAcceptingAppointments: doctor.isAcceptingAppointments,
            emergencyAvailable: doctor.emergencyAvailable,
            stats: {
                todayAppointments,
                pendingBookings,
                completedAppointments,
                maxAppointmentsPerDay: doctor.maxAppointmentsPerDay,
            }
        };
    }
};
exports.DoctorDashboardService = DoctorDashboardService;
exports.DoctorDashboardService = DoctorDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DoctorDashboardService);
//# sourceMappingURL=doctor-dashboard.service.js.map