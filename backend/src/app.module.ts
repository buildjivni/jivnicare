import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { HospitalsModule } from './modules/hospitals/hospitals.module';
import { SearchModule } from './modules/search/search.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SeoModule } from './modules/seo/seo.module';
import { TrustModule } from './modules/trust/trust.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { IntelligenceModule } from './modules/intelligence/intelligence.module';
import { AdminModule } from './modules/admin/admin.module';
import { DoctorModule } from './modules/doctor/doctor.module';
import { QueueModule } from './modules/queue/queue.module';
import { validate } from './config/env.validation';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      cache: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // Global rate limit: 100 requests per minute
    }]),
    DatabaseModule,
    HealthModule,
    AuthModule,
    DoctorsModule,
    HospitalsModule,
    SearchModule,
    UploadsModule,
    DashboardModule,
    ModerationModule,
    AnalyticsModule,
    SeoModule,
    TrustModule,
    NotificationsModule,
    IntelligenceModule,
    AdminModule,
    DoctorModule,
    QueueModule,
    ReportsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
