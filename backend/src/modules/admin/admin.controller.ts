import { Controller, Get, Patch, Param, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { VerificationService } from './services/verification.service';
import { GovernanceService } from './services/governance.service';
import { AnalyticsService } from './services/analytics.service';
import { ModerateEntityDto, ModerationAction } from './dto/moderate-entity.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN') // Secure all routes in this controller
export class AdminController {
  constructor(
    private readonly verificationService: VerificationService,
    private readonly governanceService: GovernanceService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get('overview')
  async getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('pending-doctors')
  async getPendingDoctors() {
    return this.verificationService.getPendingDoctors();
  }

  @Get('pending-hospitals')
  async getPendingHospitals() {
    return this.verificationService.getPendingHospitals();
  }

  @Patch('doctors/:id/moderate')
  async moderateDoctor(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ModerateEntityDto,
  ) {
    if (dto.action === ModerationAction.SUSPEND) {
      return this.governanceService.suspendDoctor(req.user.id, id, dto.reason);
    } else {
      return this.verificationService.moderateDoctor(req.user.id, id, dto.action as 'APPROVE' | 'REJECT', dto.reason);
    }
  }

  @Patch('hospitals/:id/moderate')
  async moderateHospital(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ModerateEntityDto,
  ) {
    if (dto.action === ModerationAction.SUSPEND) {
      return this.governanceService.suspendHospital(req.user.id, id, dto.reason);
    } else {
      return this.verificationService.moderateHospital(req.user.id, id, dto.action as 'APPROVE' | 'REJECT', dto.reason);
    }
  }
}
