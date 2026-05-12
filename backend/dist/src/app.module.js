"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const database_module_1 = require("./database/database.module");
const health_module_1 = require("./modules/health/health.module");
const auth_module_1 = require("./modules/auth/auth.module");
const doctors_module_1 = require("./modules/doctors/doctors.module");
const hospitals_module_1 = require("./modules/hospitals/hospitals.module");
const search_module_1 = require("./modules/search/search.module");
const uploads_module_1 = require("./modules/uploads/uploads.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const moderation_module_1 = require("./modules/moderation/moderation.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const seo_module_1 = require("./modules/seo/seo.module");
const trust_module_1 = require("./modules/trust/trust.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const intelligence_module_1 = require("./modules/intelligence/intelligence.module");
const admin_module_1 = require("./modules/admin/admin.module");
const doctor_module_1 = require("./modules/doctor/doctor.module");
const queue_module_1 = require("./modules/queue/queue.module");
const env_validation_1 = require("./config/env.validation");
const jwt_auth_guard_1 = require("./modules/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("./modules/auth/guards/roles.guard");
const reports_module_1 = require("./modules/reports/reports.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                validate: env_validation_1.validate,
                isGlobal: true,
                cache: true,
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
            database_module_1.DatabaseModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            doctors_module_1.DoctorsModule,
            hospitals_module_1.HospitalsModule,
            search_module_1.SearchModule,
            uploads_module_1.UploadsModule,
            dashboard_module_1.DashboardModule,
            moderation_module_1.ModerationModule,
            analytics_module_1.AnalyticsModule,
            seo_module_1.SeoModule,
            trust_module_1.TrustModule,
            notifications_module_1.NotificationsModule,
            intelligence_module_1.IntelligenceModule,
            admin_module_1.AdminModule,
            doctor_module_1.DoctorModule,
            queue_module_1.QueueModule,
            reports_module_1.ReportsModule,
        ],
        providers: [
            {
                provide: core_1.APP_FILTER,
                useClass: global_exception_filter_1.GlobalExceptionFilter,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map