import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { DoctorProfileService } from './services/doctor-profile.service';
import { DoctorAvailabilityService } from './services/doctor-availability.service';
import { DoctorDashboardService } from './services/doctor-dashboard.service';
import { UpdateDoctorProfileDto } from './dto/update-profile.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { UpdateBookingSettingsDto } from './dto/update-booking-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('doctor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR', 'ADMIN') // Admin can access if needed, but normally DOCTOR
export class DoctorController {
  constructor(
    private readonly profileService: DoctorProfileService,
    private readonly availabilityService: DoctorAvailabilityService,
    private readonly dashboardService: DoctorDashboardService,
  ) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.profileService.getProfileByUserId(req.user.id);
  }

  @Patch('profile')
  async updateProfile(@Request() req: any, @Body() dto: UpdateDoctorProfileDto) {
    return this.profileService.updateProfile(req.user.id, dto);
  }

  @Patch('availability')
  async updateAvailability(@Request() req: any, @Body() dto: UpdateAvailabilityDto) {
    return this.availabilityService.updateAvailability(req.user.id, dto);
  }

  @Patch('booking-settings')
  async updateBookingSettings(@Request() req: any, @Body() dto: UpdateBookingSettingsDto) {
    return this.availabilityService.updateBookingSettings(req.user.id, dto);
  }

  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    return this.dashboardService.getDashboardStats(req.user.id);
  }

  @Get('appointments')
  async getAppointments(@Request() req: any) {
    // Basic mock implementation for now since Appointment list features are next phase
    return [];
  }
}
