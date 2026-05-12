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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const notification_service_1 = require("./services/notification.service");
const engagement_service_1 = require("./services/engagement.service");
const trust_service_1 = require("./services/trust.service");
const notifications_dto_1 = require("./dto/notifications.dto");
let NotificationsController = class NotificationsController {
    notificationService;
    engagementService;
    trustService;
    constructor(notificationService, engagementService, trustService) {
        this.notificationService = notificationService;
        this.engagementService = engagementService;
        this.trustService = trustService;
    }
    async getNotifications(userId, unreadOnly, page, limit) {
        return this.notificationService.getForUser(userId, {
            unreadOnly: unreadOnly === 'true',
            page,
            limit,
        });
    }
    async getUnreadCount(userId) {
        const count = await this.notificationService.getUnreadCount(userId);
        return { unreadCount: count };
    }
    async markRead(userId, dto) {
        return this.notificationService.markRead(userId, dto.ids);
    }
    async getPreferences(userId) {
        return this.notificationService.getPreferences(userId);
    }
    async updatePreferences(userId, dto) {
        return this.notificationService.updatePreferences(userId, dto);
    }
    async saveDoctor(userId, doctorId) {
        return this.engagementService.saveDoctor(userId, doctorId);
    }
    async unsaveDoctor(userId, doctorId) {
        return this.engagementService.unsaveDoctor(userId, doctorId);
    }
    async getSavedDoctors(userId, page, limit) {
        return this.engagementService.getSavedDoctors(userId, page, limit);
    }
    async isSaved(userId, doctorId) {
        const saved = await this.engagementService.isSaved(userId, doctorId);
        return { isSaved: saved };
    }
    async getDoctorTrustProfile(doctorId) {
        return this.trustService.getDoctorTrustProfile(doctorId);
    }
    async getHospitalTrustProfile(hospitalId) {
        return this.trustService.getHospitalTrustProfile(hospitalId);
    }
    async getPlatformTrustSummary() {
        return this.trustService.getPlatformTrustSummary();
    }
    async getActivityFeed(adminId, limit) {
        return this.engagementService.getActivityFeed(adminId, limit);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)('notifications'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('unreadOnly')),
    __param(2, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('notifications/unread-count'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)('notifications/mark-read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, notifications_dto_1.MarkReadDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markRead", null);
__decorate([
    (0, common_1.Get)('notifications/preferences'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getPreferences", null);
__decorate([
    (0, common_1.Patch)('notifications/preferences'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, notifications_dto_1.UpdatePreferencesDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updatePreferences", null);
__decorate([
    (0, common_1.Post)('engagement/save-doctor/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "saveDoctor", null);
__decorate([
    (0, common_1.Delete)('engagement/save-doctor/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "unsaveDoctor", null);
__decorate([
    (0, common_1.Get)('engagement/saved-doctors'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getSavedDoctors", null);
__decorate([
    (0, common_1.Get)('engagement/saved-doctors/:id/is-saved'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "isSaved", null);
__decorate([
    (0, common_1.Get)('trust/doctor/:id/profile'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getDoctorTrustProfile", null);
__decorate([
    (0, common_1.Get)('trust/hospital/:id/profile'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getHospitalTrustProfile", null);
__decorate([
    (0, common_1.Get)('trust/platform-summary'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getPlatformTrustSummary", null);
__decorate([
    (0, common_1.Get)('engagement/activity-feed'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getActivityFeed", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [notification_service_1.NotificationService,
        engagement_service_1.EngagementService,
        trust_service_1.TrustService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map