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
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const ranking_service_1 = require("./services/ranking.service");
const analytics_service_1 = require("./services/analytics.service");
const search_dto_1 = require("./dto/search.dto");
let SearchController = class SearchController {
    rankingService;
    analyticsService;
    constructor(rankingService, analyticsService) {
        this.rankingService = rankingService;
        this.analyticsService = analyticsService;
    }
    async search(query) {
        const result = await this.rankingService.searchAndRank(query);
        const totalResults = result.doctors.length + result.hospitals.length;
        this.analyticsService.trackSearch(query.q || '', result.normalizedQuery, query.district, totalResults);
        return result;
    }
    async getTrending() {
        return this.analyticsService.getTrendingSearches();
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_dto_1.SearchQueryDto]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('trending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "getTrending", null);
exports.SearchController = SearchController = __decorate([
    (0, common_1.Controller)('search'),
    __metadata("design:paramtypes", [ranking_service_1.RankingService,
        analytics_service_1.AnalyticsService])
], SearchController);
//# sourceMappingURL=search.controller.js.map