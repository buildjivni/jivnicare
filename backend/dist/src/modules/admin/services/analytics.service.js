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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOverview() {
        const [totalDoctors, verifiedDoctors, pendingDoctors, totalHospitals, pendingHospitals, totalBookings, activeBookings,] = await Promise.all([
            this.prisma.doctor.count(),
            this.prisma.doctor.count({ where: { verificationStatus: 'VERIFIED' } }),
            this.prisma.doctor.count({ where: { verificationStatus: 'PENDING' } }),
            this.prisma.hospital.count(),
            this.prisma.hospital.count({ where: { verificationStatus: 'PENDING' } }),
            this.prisma.queueToken.count(),
            this.prisma.queueToken.count({ where: { status: { in: ['WAITING', 'IN_CONSULTATION'] } } }),
        ]);
        return {
            doctors: {
                total: totalDoctors,
                verified: verifiedDoctors,
                pending: pendingDoctors,
            },
            hospitals: {
                total: totalHospitals,
                pending: pendingHospitals,
            },
            bookings: {
                total: totalBookings,
                active: activeBookings,
            },
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map