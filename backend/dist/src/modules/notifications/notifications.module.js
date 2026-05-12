"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../database/database.module");
const notifications_controller_1 = require("./notifications.controller");
const notification_service_1 = require("./services/notification.service");
const engagement_service_1 = require("./services/engagement.service");
const trust_service_1 = require("./services/trust.service");
const notification_events_service_1 = require("./notification-events.service");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule],
        controllers: [notifications_controller_1.NotificationsController],
        providers: [
            notification_service_1.NotificationService,
            engagement_service_1.EngagementService,
            trust_service_1.TrustService,
            notification_events_service_1.NotificationEventsService,
        ],
        exports: [notification_service_1.NotificationService, notification_events_service_1.NotificationEventsService, trust_service_1.TrustService],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map