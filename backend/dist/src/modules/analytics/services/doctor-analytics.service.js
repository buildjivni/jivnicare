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
var DoctorAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
const client_1 = require("@prisma/client");
let DoctorAnalyticsService = DoctorAnalyticsService_1 = class DoctorAnalyticsService {
    prisma;
    logger = new common_1.Logger(DoctorAnalyticsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async logView(doctorId) {
        try {
            await this.prisma.profileAnalytics.create({
                data: {
                    targetType: client_1.TargetType.DOCTOR,
                    targetId: doctorId,
                    action: 'VIEW',
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to log doctor view: ${error.message}`);
        }
    }
    async getPopularDoctors(limit = 10) {
        const result = await this.prisma.profileAnalytics.groupBy({
            by: ['targetId'],
            where: { targetType: client_1.TargetType.DOCTOR, action: 'VIEW' },
            _count: { targetId: true },
            orderBy: { _count: { targetId: 'desc' } },
            take: limit,
        });
        const doctorIds = result.map((r) => r.targetId);
        const doctors = await this.prisma.doctor.findMany({
            where: { id: { in: doctorIds } },
            select: {
                id: true,
                name: true,
                district: true,
                specialties: { select: { name: true } },
            },
        });
        return result
            .map((r) => {
            const doc = doctors.find((d) => d.id === r.targetId);
            return {
                doctor: doc,
                views: r._count.targetId,
            };
        })
            .filter((r) => r.doctor);
    }
};
exports.DoctorAnalyticsService = DoctorAnalyticsService;
exports.DoctorAnalyticsService = DoctorAnalyticsService = DoctorAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DoctorAnalyticsService);
//# sourceMappingURL=doctor-analytics.service.js.map