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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const verification_service_1 = require("./services/verification.service");
const governance_service_1 = require("./services/governance.service");
const analytics_service_1 = require("./services/analytics.service");
const moderate_entity_dto_1 = require("./dto/moderate-entity.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let AdminController = class AdminController {
    verificationService;
    governanceService;
    analyticsService;
    constructor(verificationService, governanceService, analyticsService) {
        this.verificationService = verificationService;
        this.governanceService = governanceService;
        this.analyticsService = analyticsService;
    }
    async getOverview() {
        return this.analyticsService.getOverview();
    }
    async getPendingDoctors() {
        return this.verificationService.getPendingDoctors();
    }
    async getPendingHospitals() {
        return this.verificationService.getPendingHospitals();
    }
    async moderateDoctor(req, id, dto) {
        if (dto.action === moderate_entity_dto_1.ModerationAction.SUSPEND) {
            return this.governanceService.suspendDoctor(req.user.id, id, dto.reason);
        }
        else {
            return this.verificationService.moderateDoctor(req.user.id, id, dto.action, dto.reason);
        }
    }
    async moderateHospital(req, id, dto) {
        if (dto.action === moderate_entity_dto_1.ModerationAction.SUSPEND) {
            return this.governanceService.suspendHospital(req.user.id, id, dto.reason);
        }
        else {
            return this.verificationService.moderateHospital(req.user.id, id, dto.action, dto.reason);
        }
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('pending-doctors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingDoctors", null);
__decorate([
    (0, common_1.Get)('pending-hospitals'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingHospitals", null);
__decorate([
    (0, common_1.Patch)('doctors/:id/moderate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, moderate_entity_dto_1.ModerateEntityDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "moderateDoctor", null);
__decorate([
    (0, common_1.Patch)('hospitals/:id/moderate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, moderate_entity_dto_1.ModerateEntityDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "moderateHospital", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [verification_service_1.VerificationService,
        governance_service_1.GovernanceService,
        analytics_service_1.AnalyticsService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map