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
var SearchAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
let SearchAnalyticsService = SearchAnalyticsService_1 = class SearchAnalyticsService {
    prisma;
    logger = new common_1.Logger(SearchAnalyticsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async logSearch(query, normalizedQuery, resultsCount, district) {
        if (!query)
            return;
        try {
            await this.prisma.searchAnalytics.create({
                data: {
                    query,
                    normalizedQuery,
                    district: district?.toLowerCase(),
                    resultsCount,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to log search: ${error.message}`);
        }
    }
    async getTopSearches(limit = 10, district) {
        const where = {};
        if (district)
            where.district = district.toLowerCase();
        const result = await this.prisma.searchAnalytics.groupBy({
            by: ['normalizedQuery'],
            where,
            _count: { normalizedQuery: true },
            orderBy: { _count: { normalizedQuery: 'desc' } },
            take: limit,
        });
        return result.map((r) => ({
            query: r.normalizedQuery,
            count: r._count.normalizedQuery,
        }));
    }
    async getFailedSearches(limit = 10, district) {
        const where = { resultsCount: 0 };
        if (district)
            where.district = district.toLowerCase();
        const result = await this.prisma.searchAnalytics.groupBy({
            by: ['normalizedQuery'],
            where,
            _count: { normalizedQuery: true },
            orderBy: { _count: { normalizedQuery: 'desc' } },
            take: limit,
        });
        return result.map((r) => ({
            query: r.normalizedQuery,
            failures: r._count.normalizedQuery,
        }));
    }
};
exports.SearchAnalyticsService = SearchAnalyticsService;
exports.SearchAnalyticsService = SearchAnalyticsService = SearchAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SearchAnalyticsService);
//# sourceMappingURL=search-analytics.service.js.map