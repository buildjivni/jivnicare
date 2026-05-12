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
var DoctorModerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorModerationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
const moderation_log_service_1 = require("./moderation-log.service");
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
const notification_events_service_1 = require("../../notifications/notification-events.service");
let DoctorModerationService = DoctorModerationService_1 = class DoctorModerationService {
    prisma;
    logService;
    configService;
    notificationEvents;
    logger = new common_1.Logger(DoctorModerationService_1.name);
    constructor(prisma, logService, configService, notificationEvents) {
        this.prisma = prisma;
        this.logService = logService;
        this.configService = configService;
        this.notificationEvents = notificationEvents;
    }
    async getPendingDoctors(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [doctors, total] = await Promise.all([
            this.prisma.doctor.findMany({
                where: { verificationStatus: 'PENDING' },
                skip,
                take: limit,
                orderBy: { createdAt: 'asc' },
                include: {
                    user: { select: { phone: true, name: true } },
                    specialties: true,
                },
            }),
            this.prisma.doctor.count({ where: { verificationStatus: 'PENDING' } }),
        ]);
        return {
            data: doctors,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async setStatus(adminId, doctorId, status, reason) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { id: doctorId },
            include: { user: true },
        });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor not found');
        if (doctor.verificationStatus === status) {
            throw new common_1.BadRequestException(`Doctor is already marked as ${status}`);
        }
        const updatedDoctor = await this.prisma.doctor.update({
            where: { id: doctorId },
            data: { verificationStatus: status },
        });
        this.notificationEvents
            .onDoctorVerificationStatusChanged(doctor.userId, doctor.name, status, reason)
            .catch((err) => this.logger.error('Failed to send doctor notification', err));
        if (status === client_1.VerificationStatus.VERIFIED) {
            const frontendUrl = this.configService.get('FRONTEND_URL');
            const revalidationSecret = this.configService.get('REVALIDATION_SECRET');
            if (frontendUrl && revalidationSecret) {
                fetch(`${frontendUrl}/api/revalidate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        secret: revalidationSecret,
                        path: `/doctors/${updatedDoctor.slug}`,
                    }),
                }).catch((err) => this.logger.error(`ISR revalidation failed for /doctors/${updatedDoctor.slug}`, err));
            }
        }
        await this.logService.logAction(adminId, status, client_1.TargetType.DOCTOR, doctorId, reason);
        return {
            success: true,
            message: `Doctor ${status.toLowerCase()} successfully`,
            doctor: updatedDoctor,
        };
    }
};
exports.DoctorModerationService = DoctorModerationService;
exports.DoctorModerationService = DoctorModerationService = DoctorModerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        moderation_log_service_1.ModerationLogService,
        config_1.ConfigService,
        notification_events_service_1.NotificationEventsService])
], DoctorModerationService);
//# sourceMappingURL=doctor-moderation.service.js.map