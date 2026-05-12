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
var HospitalModerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HospitalModerationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
const moderation_log_service_1 = require("./moderation-log.service");
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
let HospitalModerationService = HospitalModerationService_1 = class HospitalModerationService {
    prisma;
    logService;
    configService;
    logger = new common_1.Logger(HospitalModerationService_1.name);
    constructor(prisma, logService, configService) {
        this.prisma = prisma;
        this.logService = logService;
        this.configService = configService;
    }
    async getPendingHospitals(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [hospitals, total] = await Promise.all([
            this.prisma.hospital.findMany({
                where: { verificationStatus: 'PENDING' },
                skip,
                take: limit,
                orderBy: { createdAt: 'asc' },
                include: {
                    specialties: true,
                },
            }),
            this.prisma.hospital.count({ where: { verificationStatus: 'PENDING' } }),
        ]);
        return {
            data: hospitals,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async setStatus(adminId, hospitalId, status, reason) {
        const hospital = await this.prisma.hospital.findUnique({
            where: { id: hospitalId },
        });
        if (!hospital)
            throw new common_1.NotFoundException('Hospital not found');
        if (hospital.verificationStatus === status) {
            throw new common_1.BadRequestException(`Hospital is already marked as ${status}`);
        }
        const updatedHospital = await this.prisma.hospital.update({
            where: { id: hospitalId },
            data: { verificationStatus: status },
        });
        if (status === client_1.VerificationStatus.VERIFIED) {
            const frontendUrl = this.configService.get('FRONTEND_URL');
            const revalidationSecret = this.configService.get('REVALIDATION_SECRET');
            if (frontendUrl && revalidationSecret) {
                fetch(`${frontendUrl}/api/revalidate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        secret: revalidationSecret,
                        path: `/hospitals/${updatedHospital.slug}`,
                    }),
                }).catch((err) => this.logger.error(`ISR revalidation failed for /hospitals/${updatedHospital.slug}`, err));
            }
        }
        await this.logService.logAction(adminId, status, client_1.TargetType.HOSPITAL, hospitalId, reason);
        return {
            success: true,
            message: `Hospital ${status.toLowerCase()} successfully`,
            hospital: updatedHospital,
        };
    }
};
exports.HospitalModerationService = HospitalModerationService;
exports.HospitalModerationService = HospitalModerationService = HospitalModerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        moderation_log_service_1.ModerationLogService,
        config_1.ConfigService])
], HospitalModerationService);
//# sourceMappingURL=hospital-moderation.service.js.map