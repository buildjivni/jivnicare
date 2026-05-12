import { Controller, Get, Patch, Body } from '@nestjs/common';
import { UserDashboardService } from './services/user-dashboard.service';
import { DoctorDashboardService } from './services/doctor-dashboard.service';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  UpdateUserProfileDto,
  UpdateDoctorProfileDto,
  UpdateDoctorSettingsDto,
} from './dto/dashboard.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly userDashboardService: UserDashboardService,
    private readonly doctorDashboardService: DoctorDashboardService,
    private readonly adminDashboardService: AdminDashboardService,
  ) {}

  // ==========================
  // USER DASHBOARD (Accessible by all roles)
  // ==========================
  @Roles(Role.USER, Role.DOCTOR, Role.ADMIN)
  @Get('user')
  async getUserDashboard(@CurrentUser('id') userId: string) {
    return this.userDashboardService.getProfile(userId);
  }

  @Roles(Role.USER, Role.DOCTOR, Role.ADMIN)
  @Patch('user/profile')
  async updateUserProfile(
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateUserProfileDto,
  ) {
    return this.userDashboardService.updateProfile(userId, updateDto);
  }

  // ==========================
  // DOCTOR DASHBOARD
  // ==========================
  @Roles(Role.DOCTOR)
  @Get('doctor')
  async getDoctorDashboard(@CurrentUser('id') userId: string) {
    return this.doctorDashboardService.getProfile(userId);
  }

  @Roles(Role.DOCTOR)
  @Patch('doctor/profile')
  async updateDoctorProfile(
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateDoctorProfileDto,
  ) {
    return this.doctorDashboardService.updateProfile(userId, updateDto);
  }

  @Roles(Role.DOCTOR)
  @Patch('doctor/settings')
  async updateDoctorSettings(
    @CurrentUser('id') userId: string,
    @Body() settingsDto: UpdateDoctorSettingsDto,
  ) {
    return this.doctorDashboardService.updateSettings(userId, settingsDto);
  }

  // ==========================
  // ADMIN DASHBOARD
  // ==========================
  @Roles(Role.ADMIN)
  @Get('admin')
  async getAdminDashboard() {
    return this.adminDashboardService.getOverview();
  }
}
