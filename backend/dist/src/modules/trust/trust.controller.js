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
exports.TrustController = void 0;
const common_1 = require("@nestjs/common");
const trust_service_1 = require("./trust.service");
const report_entity_dto_1 = require("./dto/report-entity.dto");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let TrustController = class TrustController {
    trustService;
    constructor(trustService) {
        this.trustService = trustService;
    }
    getDoctorBadge(id) {
        return this.trustService.getDoctorBadge(id);
    }
    getHospitalBadge(id) {
        return this.trustService.getHospitalBadge(id);
    }
    getEmergencyHospitals(district) {
        return this.trustService.getEmergencyHospitals(district);
    }
    reportEntity(reporterId, dto) {
        return this.trustService.reportEntity(reporterId, dto.targetType, dto.targetId, dto.reason);
    }
    getAuditLogs(page, limit, action) {
        return this.trustService.getAuditLogs(page, limit, action);
    }
    getReportedQueue(page, limit) {
        return this.trustService.getReportedQueue(page, limit);
    }
};
exports.TrustController = TrustController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('badge/doctor/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrustController.prototype, "getDoctorBadge", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('badge/hospital/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrustController.prototype, "getHospitalBadge", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('emergency-hospitals'),
    __param(0, (0, common_1.Query)('district')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrustController.prototype, "getEmergencyHospitals", null);
__decorate([
    (0, common_1.Post)('report'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, report_entity_dto_1.ReportEntityDto]),
    __metadata("design:returntype", void 0)
], TrustController.prototype, "reportEntity", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Get)('audit-logs'),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(30), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], TrustController.prototype, "getAuditLogs", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Get)('reports-queue'),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], TrustController.prototype, "getReportedQueue", null);
exports.TrustController = TrustController = __decorate([
    (0, common_1.Controller)('trust'),
    __metadata("design:paramtypes", [trust_service_1.TrustService])
], TrustController);
//# sourceMappingURL=trust.controller.js.map