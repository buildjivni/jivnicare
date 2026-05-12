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
exports.PlatformAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
let PlatformAnalyticsService = class PlatformAnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOverview() {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const [totalSearches, searchesToday, totalViews, viewsToday, failedSearchesToday,] = await Promise.all([
            this.prisma.searchAnalytics.count(),
            this.prisma.searchAnalytics.count({
                where: { createdAt: { gte: yesterday } },
            }),
            this.prisma.profileAnalytics.count(),
            this.prisma.profileAnalytics.count({
                where: { createdAt: { gte: yesterday } },
            }),
            this.prisma.searchAnalytics.count({
                where: { resultsCount: 0, createdAt: { gte: yesterday } },
            }),
        ]);
        return {
            searches: { total: totalSearches, today: searchesToday },
            profileViews: { total: totalViews, today: viewsToday },
            failedSearches: { today: failedSearchesToday },
        };
    }
};
exports.PlatformAnalyticsService = PlatformAnalyticsService;
exports.PlatformAnalyticsService = PlatformAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlatformAnalyticsService);
//# sourceMappingURL=platform-analytics.service.js.map