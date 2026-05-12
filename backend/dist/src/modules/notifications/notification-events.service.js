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
var NotificationEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationEventsService = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./services/notification.service");
const client_1 = require("@prisma/client");
let NotificationEventsService = NotificationEventsService_1 = class NotificationEventsService {
    notifications;
    logger = new common_1.Logger(NotificationEventsService_1.name);
    constructor(notifications) {
        this.notifications = notifications;
    }
    async onDoctorVerificationStatusChanged(doctorUserId, doctorName, status, reason) {
        const templates = {
            VERIFIED: {
                type: client_1.NotificationType.VERIFICATION_APPROVED,
                title: '🎉 Profile Verified!',
                message: `Congratulations ${doctorName}! Your JivniCare profile has been verified. Patients can now find and book you.`,
            },
            REJECTED: {
                type: client_1.NotificationType.VERIFICATION_REJECTED,
                title: '⚠️ Verification Not Approved',
                message: `Your profile verification was not approved. Reason: ${reason ?? 'Please review your documents and resubmit.'}`,
            },
            SUSPENDED: {
                type: client_1.NotificationType.VERIFICATION_SUSPENDED,
                title: '🚫 Profile Suspended',
                message: `Your JivniCare profile has been temporarily suspended. Reason: ${reason ?? 'Contact support for details.'}`,
            },
            PENDING: {
                type: client_1.NotificationType.PLATFORM_ALERT,
                title: 'Profile Under Review',
                message: 'Your profile is under review. You will be notified once verified.',
            },
        };
        const template = templates[status];
        try {
            await this.notifications.create({
                userId: doctorUserId,
                type: template.type,
                title: template.title,
                message: template.message,
                metadata: { status, reason },
            });
        }
        catch (err) {
            this.logger.error(`Failed to notify doctor ${doctorUserId}`, err);
        }
    }
    async onNewDoctorPendingVerification(adminUserIds, doctorName, district) {
        const dtos = adminUserIds.map((adminId) => ({
            userId: adminId,
            type: client_1.NotificationType.MODERATION_PENDING,
            title: '🔔 New Verification Request',
            message: `Dr. ${doctorName} from ${district} has submitted a profile for verification.`,
            metadata: { doctorName, district },
        }));
        await this.notifications.createMany(dtos);
    }
    async onHospitalPendingVerification(adminUserIds, hospitalName, district) {
        const dtos = adminUserIds.map((adminId) => ({
            userId: adminId,
            type: client_1.NotificationType.MODERATION_PENDING,
            title: '🏥 Hospital Verification Request',
            message: `${hospitalName} in ${district} has submitted for verification.`,
            metadata: { hospitalName, district },
        }));
        await this.notifications.createMany(dtos);
    }
    async onProfileUpdated(userId, entityName, role) {
        await this.notifications.create({
            userId,
            type: client_1.NotificationType.PROFILE_UPDATED,
            title: '✅ Profile Updated',
            message: `Your ${role} profile has been successfully updated.`,
            metadata: { entityName },
        });
    }
    async sendPlatformAlert(userIds, title, message) {
        const dtos = userIds.map((userId) => ({
            userId,
            type: client_1.NotificationType.PLATFORM_ALERT,
            title,
            message,
        }));
        await this.notifications.createMany(dtos);
    }
};
exports.NotificationEventsService = NotificationEventsService;
exports.NotificationEventsService = NotificationEventsService = NotificationEventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationEventsService);
//# sourceMappingURL=notification-events.service.js.map