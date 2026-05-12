import { Module, Global } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { SearchAnalyticsService } from './services/search-analytics.service';
import { DoctorAnalyticsService } from './services/doctor-analytics.service';
import { HospitalAnalyticsService } from './services/hospital-analytics.service';
import { PlatformAnalyticsService } from './services/platform-analytics.service';

@Global() // Make it global so SearchService can easily inject it
@Module({
  controllers: [AnalyticsController],
  providers: [
    SearchAnalyticsService,
    DoctorAnalyticsService,
    HospitalAnalyticsService,
    PlatformAnalyticsService,
  ],
  exports: [
    SearchAnalyticsService,
    DoctorAnalyticsService,
    HospitalAnalyticsService,
  ],
})
export class AnalyticsModule {}
