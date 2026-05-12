"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmergencyRankingService = void 0;
const common_1 = require("@nestjs/common");
let EmergencyRankingService = class EmergencyRankingService {
    EMERGENCY_KEYWORDS = [
        'emergency', 'emergancy', 'emergncy',
        'urgent', 'accident', 'heart attack',
        'stroke', 'ambulance', 'severe', 'critical'
    ];
    isEmergencyQuery(query) {
        const q = query.toLowerCase();
        return this.EMERGENCY_KEYWORDS.some(keyword => q.includes(keyword));
    }
    calculateEmergencyBoost(isEmergencyQuery, entityEmergencyAvailable) {
        if (isEmergencyQuery && entityEmergencyAvailable) {
            return 100;
        }
        if (entityEmergencyAvailable) {
            return 10;
        }
        return 0;
    }
};
exports.EmergencyRankingService = EmergencyRankingService;
exports.EmergencyRankingService = EmergencyRankingService = __decorate([
    (0, common_1.Injectable)()
], EmergencyRankingService);
//# sourceMappingURL=emergency-ranking.service.js.map