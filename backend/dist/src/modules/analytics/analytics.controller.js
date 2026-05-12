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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const search_analytics_service_1 = require("./services/search-analytics.service");
const doctor_analytics_service_1 = require("./services/doctor-analytics.service");
const hospital_analytics_service_1 = require("./services/hospital-analytics.service");
const platform_analytics_service_1 = require("./services/platform-analytics.service");
const analytics_filter_dto_1 = require("./dto/analytics-filter.dto");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let AnalyticsController = class AnalyticsController {
    searchAnalyticsService;
    doctorAnalyticsService;
    hospitalAnalyticsService;
    platformAnalyticsService;
    constructor(searchAnalyticsService, doctorAnalyticsService, hospitalAnalyticsService, platformAnalyticsService) {
        this.searchAnalyticsService = searchAnalyticsService;
        this.doctorAnalyticsService = doctorAnalyticsService;
        this.hospitalAnalyticsService = hospitalAnalyticsService;
        this.platformAnalyticsService = platformAnalyticsService;
    }
    async getTopSearches(filter) {
        return this.searchAnalyticsService.getTopSearches(filter.limit, filter.district);
    }
    async getFailedSearches(filter) {
        return this.searchAnalyticsService.getFailedSearches(filter.limit, filter.district);
    }
    async getPopularDoctors(filter) {
        return this.doctorAnalyticsService.getPopularDoctors(filter.limit);
    }
    async getPopularHospitals(filter) {
        return this.hospitalAnalyticsService.getPopularHospitals(filter.limit);
    }
    async getPlatformOverview() {
        return this.platformAnalyticsService.getOverview();
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('searches/top'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_filter_dto_1.AnalyticsFilterDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTopSearches", null);
__decorate([
    (0, common_1.Get)('searches/failed'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_filter_dto_1.AnalyticsFilterDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getFailedSearches", null);
__decorate([
    (0, common_1.Get)('doctors/popular'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_filter_dto_1.AnalyticsFilterDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getPopularDoctors", null);
__decorate([
    (0, common_1.Get)('hospitals/popular'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_filter_dto_1.AnalyticsFilterDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getPopularHospitals", null);
__decorate([
    (0, common_1.Get)('platform/overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getPlatformOverview", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:paramtypes", [search_analytics_service_1.SearchAnalyticsService,
        doctor_analytics_service_1.DoctorAnalyticsService,
        hospital_analytics_service_1.HospitalAnalyticsService,
        platform_analytics_service_1.PlatformAnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map