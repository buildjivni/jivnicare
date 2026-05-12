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
exports.DoctorController = void 0;
const common_1 = require("@nestjs/common");
const doctor_profile_service_1 = require("./services/doctor-profile.service");
const doctor_availability_service_1 = require("./services/doctor-availability.service");
const doctor_dashboard_service_1 = require("./services/doctor-dashboard.service");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const update_availability_dto_1 = require("./dto/update-availability.dto");
const update_booking_settings_dto_1 = require("./dto/update-booking-settings.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let DoctorController = class DoctorController {
    profileService;
    availabilityService;
    dashboardService;
    constructor(profileService, availabilityService, dashboardService) {
        this.profileService = profileService;
        this.availabilityService = availabilityService;
        this.dashboardService = dashboardService;
    }
    async getProfile(req) {
        return this.profileService.getProfileByUserId(req.user.id);
    }
    async updateProfile(req, dto) {
        return this.profileService.updateProfile(req.user.id, dto);
    }
    async updateAvailability(req, dto) {
        return this.availabilityService.updateAvailability(req.user.id, dto);
    }
    async updateBookingSettings(req, dto) {
        return this.availabilityService.updateBookingSettings(req.user.id, dto);
    }
    async getDashboard(req) {
        return this.dashboardService.getDashboardStats(req.user.id);
    }
    async getAppointments(req) {
        return [];
    }
};
exports.DoctorController = DoctorController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DoctorController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateDoctorProfileDto]),
    __metadata("design:returntype", Promise)
], DoctorController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)('availability'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_availability_dto_1.UpdateAvailabilityDto]),
    __metadata("design:returntype", Promise)
], DoctorController.prototype, "updateAvailability", null);
__decorate([
    (0, common_1.Patch)('booking-settings'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_booking_settings_dto_1.UpdateBookingSettingsDto]),
    __metadata("design:returntype", Promise)
], DoctorController.prototype, "updateBookingSettings", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DoctorController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('appointments'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DoctorController.prototype, "getAppointments", null);
exports.DoctorController = DoctorController = __decorate([
    (0, common_1.Controller)('doctor'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('DOCTOR', 'ADMIN'),
    __metadata("design:paramtypes", [doctor_profile_service_1.DoctorProfileService,
        doctor_availability_service_1.DoctorAvailabilityService,
        doctor_dashboard_service_1.DoctorDashboardService])
], DoctorController);
//# sourceMappingURL=doctor.controller.js.map