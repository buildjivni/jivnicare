import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { UserDashboardService } from './services/user-dashboard.service';
import { DoctorDashboardService } from './services/doctor-dashboard.service';
import { AdminDashboardService } from './services/admin-dashboard.service';

@Module({
  controllers: [DashboardController],
  providers: [
    UserDashboardService,
    DoctorDashboardService,
    AdminDashboardService,
  ],
})
export class DashboardModule {}
