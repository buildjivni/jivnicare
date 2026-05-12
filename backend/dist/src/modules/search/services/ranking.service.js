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
exports.RankingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
const typo_handler_service_1 = require("./typo-handler.service");
const keyword_mapper_service_1 = require("./keyword-mapper.service");
const emergency_ranking_service_1 = require("./emergency-ranking.service");
let RankingService = class RankingService {
    prisma;
    typoHandler;
    keywordMapper;
    emergencyRanking;
    constructor(prisma, typoHandler, keywordMapper, emergencyRanking) {
        this.prisma = prisma;
        this.typoHandler = typoHandler;
        this.keywordMapper = keywordMapper;
        this.emergencyRanking = emergencyRanking;
    }
    async searchAndRank(dto) {
        const { q = '', district, specialty, emergency, page = 1, limit = 20 } = dto;
        const skip = (page - 1) * limit;
        const correctedQuery = this.typoHandler.correctQuery(q);
        const expandedTerms = this.keywordMapper.expandQuery(correctedQuery);
        const mappedSpecialties = this.keywordMapper.extractSpecialties(correctedQuery);
        const isEmergency = emergency || this.emergencyRanking.isEmergencyQuery(correctedQuery);
        const [doctors, hospitals] = await Promise.all([
            this.fetchDoctors(expandedTerms, mappedSpecialties, district, specialty, isEmergency, skip, limit),
            this.fetchHospitals(expandedTerms, district, specialty, isEmergency, skip, limit)
        ]);
        const rankedDoctors = doctors.map((doc) => ({
            ...doc,
            score: this.calculateDoctorScore(doc, isEmergency, district)
        })).sort((a, b) => b.score - a.score);
        const rankedHospitals = hospitals.map((hosp) => ({
            ...hosp,
            score: this.calculateHospitalScore(hosp, isEmergency, district)
        })).sort((a, b) => b.score - a.score);
        return {
            normalizedQuery: correctedQuery,
            doctors: rankedDoctors,
            hospitals: rankedHospitals,
        };
    }
    async fetchDoctors(terms, mappedSpecialties, district, specialty, emergency, skip = 0, limit = 20) {
        const where = {};
        if (district)
            where.district = { equals: district, mode: 'insensitive' };
        if (emergency)
            where.emergencyAvailable = true;
        const specFilters = [];
        if (specialty)
            specFilters.push({ slug: specialty.toLowerCase() });
        mappedSpecialties.forEach(s => specFilters.push({ slug: s.toLowerCase() }));
        if (specFilters.length > 0) {
            where.specialties = { some: { OR: specFilters } };
        }
        if (terms.length > 0 && terms[0] !== '') {
            where.OR = terms.flatMap(term => [
                { name: { contains: term, mode: 'insensitive' } },
                { user: { name: { contains: term, mode: 'insensitive' } } },
                { specialties: { some: { name: { contains: term, mode: 'insensitive' } } } }
            ]);
        }
        return this.prisma.doctor.findMany({
            where,
            include: {
                user: { select: { name: true } },
                specialties: { select: { name: true, slug: true } }
            },
            skip,
            take: limit * 2,
        });
    }
    async fetchHospitals(terms, district, specialty, emergency, skip = 0, limit = 20) {
        const where = {};
        if (district)
            where.district = { equals: district, mode: 'insensitive' };
        if (emergency)
            where.emergencyAvailable = true;
        if (terms.length > 0 && terms[0] !== '') {
            where.OR = terms.flatMap(term => [
                { name: { contains: term, mode: 'insensitive' } },
                { description: { contains: term, mode: 'insensitive' } }
            ]);
        }
        return this.prisma.hospital.findMany({
            where,
            skip,
            take: limit * 2,
        });
    }
    calculateDoctorScore(doc, isEmergencyQuery, requestedDistrict) {
        let score = 0;
        if (doc.verificationStatus === 'VERIFIED')
            score += 50;
        if (doc.verificationStatus === 'SUSPENDED')
            score -= 100;
        if (!doc.isAcceptingAppointments)
            score -= 100;
        score += (doc.rating || 0) * 2;
        score += (doc.profileCompletionPercentage || 0) * 0.2;
        if (requestedDistrict && doc.district?.toLowerCase() === requestedDistrict.toLowerCase()) {
            score += 30;
        }
        score += this.emergencyRanking.calculateEmergencyBoost(isEmergencyQuery, doc.emergencyAvailable);
        return score;
    }
    calculateHospitalScore(hosp, isEmergencyQuery, requestedDistrict) {
        let score = 0;
        if (hosp.verificationStatus === 'VERIFIED')
            score += 50;
        if (hosp.verificationStatus === 'SUSPENDED')
            score -= 100;
        score += (hosp.rating || 0) * 2;
        if (requestedDistrict && hosp.district?.toLowerCase() === requestedDistrict.toLowerCase()) {
            score += 30;
        }
        score += this.emergencyRanking.calculateEmergencyBoost(isEmergencyQuery, hosp.emergencyAvailable);
        return score;
    }
};
exports.RankingService = RankingService;
exports.RankingService = RankingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        typo_handler_service_1.TypoHandlerService,
        keyword_mapper_service_1.KeywordMapperService,
        emergency_ranking_service_1.EmergencyRankingService])
], RankingService);
//# sourceMappingURL=ranking.service.js.map