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
var HospitalAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HospitalAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
const client_1 = require("@prisma/client");
let HospitalAnalyticsService = HospitalAnalyticsService_1 = class HospitalAnalyticsService {
    prisma;
    logger = new common_1.Logger(HospitalAnalyticsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async logView(hospitalId) {
        try {
            await this.prisma.profileAnalytics.create({
                data: {
                    targetType: client_1.TargetType.HOSPITAL,
                    targetId: hospitalId,
                    action: 'VIEW',
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to log hospital view: ${error.message}`);
        }
    }
    async getPopularHospitals(limit = 10) {
        const result = await this.prisma.profileAnalytics.groupBy({
            by: ['targetId'],
            where: { targetType: client_1.TargetType.HOSPITAL, action: 'VIEW' },
            _count: { targetId: true },
            orderBy: { _count: { targetId: 'desc' } },
            take: limit,
        });
        const hospitalIds = result.map((r) => r.targetId);
        const hospitals = await this.prisma.hospital.findMany({
            where: { id: { in: hospitalIds } },
            select: {
                id: true,
                name: true,
                district: true,
                emergencyAvailable: true,
            },
        });
        return result
            .map((r) => {
            const hosp = hospitals.find((h) => h.id === r.targetId);
            return {
                hospital: hosp,
                views: r._count.targetId,
            };
        })
            .filter((r) => r.hospital);
    }
};
exports.HospitalAnalyticsService = HospitalAnalyticsService;
exports.HospitalAnalyticsService = HospitalAnalyticsService = HospitalAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HospitalAnalyticsService);
//# sourceMappingURL=hospital-analytics.service.js.map