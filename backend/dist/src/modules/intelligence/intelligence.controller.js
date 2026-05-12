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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligenceController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const recommendation_service_1 = require("./services/recommendation.service");
const suggestion_service_1 = require("./services/suggestion.service");
const relevance_service_1 = require("./services/relevance.service");
const intelligence_dto_1 = require("./dto/intelligence.dto");
let IntelligenceController = class IntelligenceController {
    recommendations;
    suggestions;
    relevance;
    constructor(recommendations, suggestions, relevance) {
        this.recommendations = recommendations;
        this.suggestions = suggestions;
        this.relevance = relevance;
    }
    async getSuggestions(dto) {
        return this.suggestions.getSuggestions(dto.q, dto.district);
    }
    async getRelated(q) {
        return {
            query: q,
            related: this.suggestions.getRelatedSearches(q ?? ''),
        };
    }
    async getTopDoctors(dto) {
        return this.recommendations.getTopDoctors({
            district: dto.district,
            specialty: dto.specialty,
            limit: dto.limit ? Number(dto.limit) : 6,
        });
    }
    async getEmergencyProviders(district, limit) {
        return this.recommendations.getEmergencyProviders(district, limit);
    }
    async getRelatedDoctors(doctorId, limit) {
        return this.recommendations.getRelatedDoctors(doctorId, limit);
    }
    async getDistrictOverview(district) {
        return this.recommendations.getDistrictHealthcareOverview(district);
    }
    async getTrending(district, limit) {
        const [searches, specialties] = await Promise.all([
            this.relevance.getTrendingSearches(district, limit),
            this.relevance.getTrendingSpecialties(8),
        ]);
        return { searches, specialties };
    }
    async getDistrictTrending() {
        return this.relevance.getDistrictTrending(5);
    }
    async getNoResultHelp(q) {
        return this.relevance.getZeroResultHelp(q ?? 'your search');
    }
};
exports.IntelligenceController = IntelligenceController;
__decorate([
    (0, common_1.Get)('suggestions'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [intelligence_dto_1.SuggestionDto]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getSuggestions", null);
__decorate([
    (0, common_1.Get)('related'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getRelated", null);
__decorate([
    (0, common_1.Get)('recommendations/top-doctors'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [intelligence_dto_1.RecommendationDto]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getTopDoctors", null);
__decorate([
    (0, common_1.Get)('recommendations/emergency'),
    __param(0, (0, common_1.Query)('district')),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getEmergencyProviders", null);
__decorate([
    (0, common_1.Get)('recommendations/related/:doctorId'),
    __param(0, (0, common_1.Param)('doctorId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(4), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getRelatedDoctors", null);
__decorate([
    (0, common_1.Get)('recommendations/district/:district'),
    __param(0, (0, common_1.Param)('district')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getDistrictOverview", null);
__decorate([
    (0, common_1.Get)('trending'),
    __param(0, (0, common_1.Query)('district')),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getTrending", null);
__decorate([
    (0, common_1.Get)('trending/district'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getDistrictTrending", null);
__decorate([
    (0, common_1.Get)('no-results'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getNoResultHelp", null);
exports.IntelligenceController = IntelligenceController = __decorate([
    (0, common_1.Controller)('intelligence'),
    (0, public_decorator_1.Public)(),
    __metadata("design:paramtypes", [recommendation_service_1.RecommendationService,
        suggestion_service_1.SuggestionService,
        relevance_service_1.RelevanceService])
], IntelligenceController);
//# sourceMappingURL=intelligence.controller.js.map