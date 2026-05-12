"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchModule = void 0;
const common_1 = require("@nestjs/common");
const search_controller_1 = require("./search.controller");
const ranking_service_1 = require("./services/ranking.service");
const analytics_service_1 = require("./services/analytics.service");
const typo_handler_service_1 = require("./services/typo-handler.service");
const keyword_mapper_service_1 = require("./services/keyword-mapper.service");
const emergency_ranking_service_1 = require("./services/emergency-ranking.service");
let SearchModule = class SearchModule {
};
exports.SearchModule = SearchModule;
exports.SearchModule = SearchModule = __decorate([
    (0, common_1.Module)({
        controllers: [search_controller_1.SearchController],
        providers: [
            ranking_service_1.RankingService,
            analytics_service_1.AnalyticsService,
            typo_handler_service_1.TypoHandlerService,
            keyword_mapper_service_1.KeywordMapperService,
            emergency_ranking_service_1.EmergencyRankingService,
        ],
        exports: [
            ranking_service_1.RankingService,
            analytics_service_1.AnalyticsService,
            keyword_mapper_service_1.KeywordMapperService,
        ],
    })
], SearchModule);
//# sourceMappingURL=search.module.js.map