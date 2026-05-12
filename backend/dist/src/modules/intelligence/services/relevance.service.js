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
exports.RelevanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
const BIHAR_DISTRICTS = [
    'Patna', 'Gaya', 'Muzaffarpur', 'Darbhanga', 'Bhagalpur',
    'Begusarai', 'Munger', 'Samastipur', 'Nalanda', 'Sitamarhi',
];
let RelevanceService = class RelevanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTrendingSearches(district, limit = 10) {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const where = { createdAt: { gte: since } };
        if (district)
            where.district = district;
        const raw = await this.prisma.searchAnalytics.groupBy({
            by: ['normalizedQuery'],
            where,
            _count: { normalizedQuery: true },
            orderBy: { _count: { normalizedQuery: 'desc' } },
            take: limit,
        });
        return raw.map(r => ({
            query: r.normalizedQuery,
            count: r._count.normalizedQuery,
        }));
    }
    async getDistrictTrending(limit = 5) {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const result = {};
        for (const district of BIHAR_DISTRICTS) {
            const raw = await this.prisma.searchAnalytics.groupBy({
                by: ['normalizedQuery'],
                where: { district, createdAt: { gte: since } },
                _count: { normalizedQuery: true },
                orderBy: { _count: { normalizedQuery: 'desc' } },
                take: limit,
            });
            if (raw.length > 0) {
                result[district] = raw.map(r => ({
                    query: r.normalizedQuery,
                    count: r._count.normalizedQuery,
                }));
            }
        }
        return result;
    }
    async getTrendingSpecialties(limit = 8) {
        const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const topViewed = await this.prisma.profileAnalytics.groupBy({
            by: ['targetId'],
            where: { targetType: 'DOCTOR', createdAt: { gte: since } },
            _count: { targetId: true },
            orderBy: { _count: { targetId: 'desc' } },
            take: 20,
        });
        if (topViewed.length === 0) {
            return [
                { name: 'Cardiologist', slug: 'cardiologist', viewCount: 0 },
                { name: 'General Physician', slug: 'general-physician', viewCount: 0 },
                { name: 'Pediatrician', slug: 'pediatrician', viewCount: 0 },
                { name: 'Dermatologist', slug: 'dermatologist', viewCount: 0 },
                { name: 'Orthopedist', slug: 'orthopedist', viewCount: 0 },
            ];
        }
        const doctorIds = topViewed.map(d => d.targetId);
        const doctors = await this.prisma.doctor.findMany({
            where: { id: { in: doctorIds } },
            include: { specialties: { select: { name: true, slug: true } } },
        });
        const specCount = {};
        topViewed.forEach(view => {
            const doc = doctors.find(d => d.id === view.targetId);
            doc?.specialties.forEach(s => {
                if (!specCount[s.slug]) {
                    specCount[s.slug] = { name: s.name, slug: s.slug, viewCount: 0 };
                }
                specCount[s.slug].viewCount += view._count.targetId;
            });
        });
        return Object.values(specCount)
            .sort((a, b) => b.viewCount - a.viewCount)
            .slice(0, limit);
    }
    didYouMean(correctedQuery, originalQuery) {
        if (correctedQuery.toLowerCase() !== originalQuery.toLowerCase()) {
            return correctedQuery;
        }
        return undefined;
    }
    async getZeroResultHelp(query) {
        const specialties = await this.prisma.specialty.findMany({
            take: 6,
            select: { name: true, slug: true },
        });
        return {
            message: `No results found for "${query}". Try one of these:`,
            suggestions: specialties.map(s => s.name),
            emergencyNote: 'For medical emergencies, search "emergency" to find 24x7 hospitals.',
        };
    }
};
exports.RelevanceService = RelevanceService;
exports.RelevanceService = RelevanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RelevanceService);
//# sourceMappingURL=relevance.service.js.map