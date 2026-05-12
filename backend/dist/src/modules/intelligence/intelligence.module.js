"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligenceModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const search_module_1 = require("../search/search.module");
const intelligence_controller_1 = require("./intelligence.controller");
const recommendation_service_1 = require("./services/recommendation.service");
const suggestion_service_1 = require("./services/suggestion.service");
const relevance_service_1 = require("./services/relevance.service");
let IntelligenceModule = class IntelligenceModule {
};
exports.IntelligenceModule = IntelligenceModule;
exports.IntelligenceModule = IntelligenceModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, search_module_1.SearchModule],
        controllers: [intelligence_controller_1.IntelligenceController],
        providers: [
            recommendation_service_1.RecommendationService,
            suggestion_service_1.SuggestionService,
            relevance_service_1.RelevanceService,
        ],
        exports: [
            recommendation_service_1.RecommendationService,
            relevance_service_1.RelevanceService,
        ],
    })
], IntelligenceModule);
//# sourceMappingURL=intelligence.module.js.map