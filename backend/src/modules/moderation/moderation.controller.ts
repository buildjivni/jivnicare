import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { DoctorModerationService } from './services/doctor-moderation.service';
import { HospitalModerationService } from './services/hospital-moderation.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, VerificationStatus } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ModerationActionDto } from './dto/moderation-action.dto';

@Controller('moderation')
@Roles(Role.ADMIN) // Protect all routes
export class ModerationController {
  constructor(
    private readonly doctorModerationService: DoctorModerationService,
    private readonly hospitalModerationService: HospitalModerationService,
  ) {}

  // ==========================
  // DOCTOR MODERATION
  // ==========================
  @Get('doctors/pending')
  async getPendingDoctors(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.doctorModerationService.getPendingDoctors(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Patch('doctors/:id/approve')
  async approveDoctor(
    @CurrentUser('id') adminId: string,
    @Param('id') doctorId: string,
  ) {
    return this.doctorModerationService.setStatus(
      adminId,
      doctorId,
      VerificationStatus.VERIFIED,
    );
  }

  @Patch('doctors/:id/reject')
  async rejectDoctor(
    @CurrentUser('id') adminId: string,
    @Param('id') doctorId: string,
    @Body() dto: ModerationActionDto,
  ) {
    return this.doctorModerationService.setStatus(
      adminId,
      doctorId,
      VerificationStatus.REJECTED,
      dto.reason,
    );
  }

  @Patch('doctors/:id/suspend')
  async suspendDoctor(
    @CurrentUser('id') adminId: string,
    @Param('id') doctorId: string,
    @Body() dto: ModerationActionDto,
  ) {
    return this.doctorModerationService.setStatus(
      adminId,
      doctorId,
      VerificationStatus.SUSPENDED,
      dto.reason,
    );
  }

  // ==========================
  // HOSPITAL MODERATION
  // ==========================
  @Get('hospitals/pending')
  async getPendingHospitals(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.hospitalModerationService.getPendingHospitals(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Patch('hospitals/:id/approve')
  async approveHospital(
    @CurrentUser('id') adminId: string,
    @Param('id') hospitalId: string,
  ) {
    return this.hospitalModerationService.setStatus(
      adminId,
      hospitalId,
      VerificationStatus.VERIFIED,
    );
  }

  @Patch('hospitals/:id/reject')
  async rejectHospital(
    @CurrentUser('id') adminId: string,
    @Param('id') hospitalId: string,
    @Body() dto: ModerationActionDto,
  ) {
    return this.hospitalModerationService.setStatus(
      adminId,
      hospitalId,
      VerificationStatus.REJECTED,
      dto.reason,
    );
  }

  @Patch('hospitals/:id/suspend')
  async suspendHospital(
    @CurrentUser('id') adminId: string,
    @Param('id') hospitalId: string,
    @Body() dto: ModerationActionDto,
  ) {
    return this.hospitalModerationService.setStatus(
      adminId,
      hospitalId,
      VerificationStatus.SUSPENDED,
      dto.reason,
    );
  }
}
