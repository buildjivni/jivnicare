import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { TrustService } from './trust.service';
import { ReportEntityDto } from './dto/report-entity.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('trust')
export class TrustController {
  constructor(private readonly trustService: TrustService) {}

  // ─── PUBLIC: Badge Endpoints ─────────────────────────────────────────────
  @Public()
  @Get('badge/doctor/:id')
  getDoctorBadge(@Param('id') id: string) {
    return this.trustService.getDoctorBadge(id);
  }

  @Public()
  @Get('badge/hospital/:id')
  getHospitalBadge(@Param('id') id: string) {
    return this.trustService.getHospitalBadge(id);
  }

  // ─── PUBLIC: Emergency Hospitals ────────────────────────────────────────
  @Public()
  @Get('emergency-hospitals')
  getEmergencyHospitals(@Query('district') district?: string) {
    return this.trustService.getEmergencyHospitals(district);
  }

  // ─── AUTHENTICATED: Report an Entity ────────────────────────────────────
  @Post('report')
  reportEntity(
    @CurrentUser('id') reporterId: string,
    @Body() dto: ReportEntityDto,
  ) {
    return this.trustService.reportEntity(
      reporterId,
      dto.targetType,
      dto.targetId,
      dto.reason,
    );
  }

  // ─── ADMIN ONLY: Audit Logs ──────────────────────────────────────────────
  @Roles(Role.ADMIN)
  @Get('audit-logs')
  getAuditLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number,
    @Query('action') action?: string,
  ) {
    return this.trustService.getAuditLogs(page, limit, action);
  }

  // ─── ADMIN ONLY: Reported Queue ──────────────────────────────────────────
  @Roles(Role.ADMIN)
  @Get('reports-queue')
  getReportedQueue(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.trustService.getReportedQueue(page, limit);
  }
}
