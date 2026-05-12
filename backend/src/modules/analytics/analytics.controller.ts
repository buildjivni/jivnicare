import { Controller, Get, Query } from '@nestjs/common';
import { SearchAnalyticsService } from './services/search-analytics.service';
import { DoctorAnalyticsService } from './services/doctor-analytics.service';
import { HospitalAnalyticsService } from './services/hospital-analytics.service';
import { PlatformAnalyticsService } from './services/platform-analytics.service';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('analytics')
@Roles(Role.ADMIN) // Protect all analytics APIs
export class AnalyticsController {
  constructor(
    private readonly searchAnalyticsService: SearchAnalyticsService,
    private readonly doctorAnalyticsService: DoctorAnalyticsService,
    private readonly hospitalAnalyticsService: HospitalAnalyticsService,
    private readonly platformAnalyticsService: PlatformAnalyticsService,
  ) {}

  @Get('searches/top')
  async getTopSearches(@Query() filter: AnalyticsFilterDto) {
    return this.searchAnalyticsService.getTopSearches(
      filter.limit,
      filter.district,
    );
  }

  @Get('searches/failed')
  async getFailedSearches(@Query() filter: AnalyticsFilterDto) {
    return this.searchAnalyticsService.getFailedSearches(
      filter.limit,
      filter.district,
    );
  }

  @Get('doctors/popular')
  async getPopularDoctors(@Query() filter: AnalyticsFilterDto) {
    return this.doctorAnalyticsService.getPopularDoctors(filter.limit);
  }

  @Get('hospitals/popular')
  async getPopularHospitals(@Query() filter: AnalyticsFilterDto) {
    return this.hospitalAnalyticsService.getPopularHospitals(filter.limit);
  }

  @Get('platform/overview')
  async getPlatformOverview() {
    return this.platformAnalyticsService.getOverview();
  }
}
