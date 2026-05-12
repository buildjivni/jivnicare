"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingService = void 0;
const common_1 = require("@nestjs/common");
let RankingService = class RankingService {
    rankResults(results, queryTerms, districtFilter, specialtyFilter) {
        results.forEach((item) => {
            let score = 0;
            if (item.verificationStatus === 'VERIFIED')
                score += 3;
            if (item.emergencyAvailable)
                score += 5;
            if (item.rating)
                score += item.rating;
            if (districtFilter &&
                item.district?.toLowerCase() === districtFilter.toLowerCase()) {
                score += 5;
            }
            if (specialtyFilter) {
                const hasSpecialty = item.specialties?.some((s) => s.slug === specialtyFilter.toLowerCase() ||
                    s.name.toLowerCase() === specialtyFilter.toLowerCase());
                if (hasSpecialty)
                    score += 10;
            }
            if (queryTerms.length > 0) {
                queryTerms.forEach((term) => {
                    if (item.name?.toLowerCase().includes(term))
                        score += 8;
                    if (item.hospitalName?.toLowerCase().includes(term))
                        score += 5;
                    const hasKeyword = item.keywords?.some((k) => k.term.toLowerCase().includes(term));
                    if (hasKeyword)
                        score += 8;
                });
            }
            item._score = score;
        });
        results.sort((a, b) => b._score - a._score);
        return results;
    }
};
exports.RankingService = RankingService;
exports.RankingService = RankingService = __decorate([
    (0, common_1.Injectable)()
], RankingService);
//# sourceMappingURL=ranking.service.js.map