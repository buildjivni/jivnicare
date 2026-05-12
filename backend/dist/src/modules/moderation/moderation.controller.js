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
exports.ModerationController = void 0;
const common_1 = require("@nestjs/common");
const doctor_moderation_service_1 = require("./services/doctor-moderation.service");
const hospital_moderation_service_1 = require("./services/hospital-moderation.service");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const moderation_action_dto_1 = require("./dto/moderation-action.dto");
let ModerationController = class ModerationController {
    doctorModerationService;
    hospitalModerationService;
    constructor(doctorModerationService, hospitalModerationService) {
        this.doctorModerationService = doctorModerationService;
        this.hospitalModerationService = hospitalModerationService;
    }
    async getPendingDoctors(page, limit) {
        return this.doctorModerationService.getPendingDoctors(page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
    }
    async approveDoctor(adminId, doctorId) {
        return this.doctorModerationService.setStatus(adminId, doctorId, client_1.VerificationStatus.VERIFIED);
    }
    async rejectDoctor(adminId, doctorId, dto) {
        return this.doctorModerationService.setStatus(adminId, doctorId, client_1.VerificationStatus.REJECTED, dto.reason);
    }
    async suspendDoctor(adminId, doctorId, dto) {
        return this.doctorModerationService.setStatus(adminId, doctorId, client_1.VerificationStatus.SUSPENDED, dto.reason);
    }
    async getPendingHospitals(page, limit) {
        return this.hospitalModerationService.getPendingHospitals(page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
    }
    async approveHospital(adminId, hospitalId) {
        return this.hospitalModerationService.setStatus(adminId, hospitalId, client_1.VerificationStatus.VERIFIED);
    }
    async rejectHospital(adminId, hospitalId, dto) {
        return this.hospitalModerationService.setStatus(adminId, hospitalId, client_1.VerificationStatus.REJECTED, dto.reason);
    }
    async suspendHospital(adminId, hospitalId, dto) {
        return this.hospitalModerationService.setStatus(adminId, hospitalId, client_1.VerificationStatus.SUSPENDED, dto.reason);
    }
};
exports.ModerationController = ModerationController;
__decorate([
    (0, common_1.Get)('doctors/pending'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "getPendingDoctors", null);
__decorate([
    (0, common_1.Patch)('doctors/:id/approve'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "approveDoctor", null);
__decorate([
    (0, common_1.Patch)('doctors/:id/reject'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, moderation_action_dto_1.ModerationActionDto]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "rejectDoctor", null);
__decorate([
    (0, common_1.Patch)('doctors/:id/suspend'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, moderation_action_dto_1.ModerationActionDto]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "suspendDoctor", null);
__decorate([
    (0, common_1.Get)('hospitals/pending'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "getPendingHospitals", null);
__decorate([
    (0, common_1.Patch)('hospitals/:id/approve'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "approveHospital", null);
__decorate([
    (0, common_1.Patch)('hospitals/:id/reject'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, moderation_action_dto_1.ModerationActionDto]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "rejectHospital", null);
__decorate([
    (0, common_1.Patch)('hospitals/:id/suspend'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, moderation_action_dto_1.ModerationActionDto]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "suspendHospital", null);
exports.ModerationController = ModerationController = __decorate([
    (0, common_1.Controller)('moderation'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:paramtypes", [doctor_moderation_service_1.DoctorModerationService,
        hospital_moderation_service_1.HospitalModerationService])
], ModerationController);
//# sourceMappingURL=moderation.controller.js.map