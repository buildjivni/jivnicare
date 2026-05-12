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
exports.SuggestionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
const keyword_mapper_service_1 = require("../../search/services/keyword-mapper.service");
const POPULAR_SUGGESTIONS = [
    { type: 'trending', text: 'Cardiologist in Patna', icon: '❤️' },
    { type: 'trending', text: 'Child Specialist', icon: '👶' },
    { type: 'trending', text: 'Fever Doctor', icon: '🌡️' },
    { type: 'trending', text: 'Skin Doctor', icon: '🩺' },
    { type: 'trending', text: 'Orthopedist', icon: '🦴' },
    { type: 'trending', text: 'Eye Specialist', icon: '👁️' },
];
const EMERGENCY_SUGGESTION = {
    type: 'emergency',
    text: '🚨 Emergency — Find nearest hospital',
    hint: '24x7 emergency care',
};
let SuggestionService = class SuggestionService {
    prisma;
    keywordMapper;
    constructor(prisma, keywordMapper) {
        this.prisma = prisma;
        this.keywordMapper = keywordMapper;
    }
    async getSuggestions(q, district) {
        if (!q || q.trim().length < 2) {
            return POPULAR_SUGGESTIONS;
        }
        const lower = q.toLowerCase().trim();
        const suggestions = [];
        const EMERGENCY_TRIGGERS = ['emerg', 'accid', 'icu', 'ambulan', 'urgent'];
        if (EMERGENCY_TRIGGERS.some(t => lower.startsWith(t))) {
            suggestions.push(EMERGENCY_SUGGESTION);
        }
        const symptomMap = this.keywordMapper.SYMPTOM_MAP;
        const symptomMatches = Object.keys(symptomMap)
            .filter(sym => sym.includes(lower) || lower.includes(sym.substring(0, 4)))
            .slice(0, 3)
            .map(sym => ({
            type: 'symptom',
            text: sym.charAt(0).toUpperCase() + sym.slice(1),
            hint: symptomMap[sym]?.[0],
        }));
        suggestions.push(...symptomMatches);
        const specialties = await this.prisma.specialty.findMany({
            where: { name: { contains: lower, mode: 'insensitive' } },
            take: 4,
            select: { name: true, slug: true },
        });
        specialties.forEach(s => suggestions.push({ type: 'specialty', text: s.name, slug: s.slug }));
        const keywords = await this.prisma.keyword.findMany({
            where: { term: { contains: lower, mode: 'insensitive' } },
            take: 4,
            select: { term: true },
        });
        keywords.forEach(k => suggestions.push({ type: 'keyword', text: k.term }));
        if (district && suggestions.length > 0) {
            const topSpec = specialties[0];
            if (topSpec) {
                const count = await this.prisma.doctor.count({
                    where: {
                        verificationStatus: 'VERIFIED',
                        district: { equals: district, mode: 'insensitive' },
                        specialties: { some: { slug: topSpec.slug } },
                    },
                });
                if (count > 0) {
                    suggestions[0] = {
                        ...suggestions[0],
                        hint: `${count} doctor${count > 1 ? 's' : ''} in ${district}`,
                    };
                }
            }
        }
        const seen = new Set();
        return suggestions.filter(s => {
            if (seen.has(s.text.toLowerCase()))
                return false;
            seen.add(s.text.toLowerCase());
            return true;
        }).slice(0, 8);
    }
    getRelatedSearches(query) {
        const lower = query.toLowerCase();
        const related = [];
        const symptomMap = this.keywordMapper.SYMPTOM_MAP;
        for (const [symptom, specialties] of Object.entries(symptomMap)) {
            if (lower.includes(symptom) || symptom.includes(lower.substring(0, 5))) {
                related.push(...specialties.slice(0, 2).map((s) => s.charAt(0).toUpperCase() + s.slice(1)));
                if (related.length >= 5)
                    break;
            }
        }
        if (related.length === 0) {
            return ['Cardiologist', 'General Physician', 'Pediatrician', 'Orthopedist', 'Dermatologist'];
        }
        return [...new Set(related)].slice(0, 5);
    }
};
exports.SuggestionService = SuggestionService;
exports.SuggestionService = SuggestionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        keyword_mapper_service_1.KeywordMapperService])
], SuggestionService);
//# sourceMappingURL=suggestion.service.js.map