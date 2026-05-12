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
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    prisma;
    logger = new common_1.Logger(AnalyticsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async trackSearch(query, normalizedQuery, district, resultsCount) {
        if (!query)
            return;
        try {
            setTimeout(async () => {
                try {
                    await this.prisma.searchAnalytics.create({
                        data: {
                            query,
                            normalizedQuery,
                            district,
                            resultsCount,
                        },
                    });
                }
                catch (e) {
                    this.logger.error(`Failed to track search query asynchronously: ${e.message}`);
                }
            }, 0);
        }
        catch (e) {
            this.logger.error(`Failed to dispatch search tracking: ${e.message}`);
        }
    }
    async getTrendingSearches(limit = 5) {
        const results = await this.prisma.searchAnalytics.groupBy({
            by: ['normalizedQuery'],
            _count: { normalizedQuery: true },
            orderBy: { _count: { normalizedQuery: 'desc' } },
            take: limit,
        });
        return results.map((r) => ({
            query: r.normalizedQuery,
            count: r._count.normalizedQuery,
        }));
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map