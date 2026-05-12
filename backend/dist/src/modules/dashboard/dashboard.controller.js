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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const user_dashboard_service_1 = require("./services/user-dashboard.service");
const doctor_dashboard_service_1 = require("./services/doctor-dashboard.service");
const admin_dashboard_service_1 = require("./services/admin-dashboard.service");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const dashboard_dto_1 = require("./dto/dashboard.dto");
let DashboardController = class DashboardController {
    userDashboardService;
    doctorDashboardService;
    adminDashboardService;
    constructor(userDashboardService, doctorDashboardService, adminDashboardService) {
        this.userDashboardService = userDashboardService;
        this.doctorDashboardService = doctorDashboardService;
        this.adminDashboardService = adminDashboardService;
    }
    async getUserDashboard(userId) {
        return this.userDashboardService.getProfile(userId);
    }
    async updateUserProfile(userId, updateDto) {
        return this.userDashboardService.updateProfile(userId, updateDto);
    }
    async getDoctorDashboard(userId) {
        return this.doctorDashboardService.getProfile(userId);
    }
    async updateDoctorProfile(userId, updateDto) {
        return this.doctorDashboardService.updateProfile(userId, updateDto);
    }
    async updateDoctorSettings(userId, settingsDto) {
        return this.doctorDashboardService.updateSettings(userId, settingsDto);
    }
    async getAdminDashboard() {
        return this.adminDashboardService.getOverview();
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.USER, client_1.Role.DOCTOR, client_1.Role.ADMIN),
    (0, common_1.Get)('user'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getUserDashboard", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.USER, client_1.Role.DOCTOR, client_1.Role.ADMIN),
    (0, common_1.Patch)('user/profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dashboard_dto_1.UpdateUserProfileDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "updateUserProfile", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.DOCTOR),
    (0, common_1.Get)('doctor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDoctorDashboard", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.DOCTOR),
    (0, common_1.Patch)('doctor/profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dashboard_dto_1.UpdateDoctorProfileDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "updateDoctorProfile", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.DOCTOR),
    (0, common_1.Patch)('doctor/settings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dashboard_dto_1.UpdateDoctorSettingsDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "updateDoctorSettings", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Get)('admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getAdminDashboard", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [user_dashboard_service_1.UserDashboardService,
        doctor_dashboard_service_1.DoctorDashboardService,
        admin_dashboard_service_1.AdminDashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map