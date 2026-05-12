import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorProfileService } from './services/doctor-profile.service';
import { DoctorAvailabilityService } from './services/doctor-availability.service';
import { DoctorDashboardService } from './services/doctor-dashboard.service';

@Module({
  controllers: [DoctorController],
  providers: [
    DoctorProfileService,
    DoctorAvailabilityService,
    DoctorDashboardService,
  ],
  exports: [
    DoctorProfileService,
    DoctorAvailabilityService,
    DoctorDashboardService,
  ],
})
export class DoctorModule {}
