import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { NotificationService } from './services/notification.service';
import { EngagementService } from './services/engagement.service';
import { TrustService } from './services/trust.service';
import { MarkReadDto, UpdatePreferencesDto } from './dto/notifications.dto';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly engagementService: EngagementService,
    private readonly trustService: TrustService,
  ) {}

  // ────────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ────────────────────────────────────────────────────────────

  /** GET /notifications — Paginated notification list for current user */
  @Get('notifications')
  async getNotifications(
    @CurrentUser('id') userId: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.notificationService.getForUser(userId, {
      unreadOnly: unreadOnly === 'true',
      page,
      limit,
    });
  }

  /** GET /notifications/unread-count — Badge count for header */
  @Get('notifications/unread-count')
  async getUnreadCount(@CurrentUser('id') userId: string) {
    const count = await this.notificationService.getUnreadCount(userId);
    return { unreadCount: count };
  }

  /** PATCH /notifications/mark-read — Mark one / many / all as read */
  @Patch('notifications/mark-read')
  async markRead(@CurrentUser('id') userId: string, @Body() dto: MarkReadDto) {
    return this.notificationService.markRead(userId, dto.ids);
  }

  // ────────────────────────────────────────────────────────────
  // PREFERENCES
  // ────────────────────────────────────────────────────────────

  /** GET /notifications/preferences */
  @Get('notifications/preferences')
  async getPreferences(@CurrentUser('id') userId: string) {
    return this.notificationService.getPreferences(userId);
  }

  /** PATCH /notifications/preferences */
  @Patch('notifications/preferences')
  async updatePreferences(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.notificationService.updatePreferences(userId, dto);
  }

  // ────────────────────────────────────────────────────────────
  // ENGAGEMENT — SAVED DOCTORS
  // ────────────────────────────────────────────────────────────

  /** POST /engagement/save-doctor/:id */
  @Post('engagement/save-doctor/:id')
  async saveDoctor(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) doctorId: string,
  ) {
    return this.engagementService.saveDoctor(userId, doctorId);
  }

  /** DELETE /engagement/save-doctor/:id */
  @Delete('engagement/save-doctor/:id')
  async unsaveDoctor(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) doctorId: string,
  ) {
    return this.engagementService.unsaveDoctor(userId, doctorId);
  }

  /** GET /engagement/saved-doctors */
  @Get('engagement/saved-doctors')
  async getSavedDoctors(
    @CurrentUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.engagementService.getSavedDoctors(userId, page, limit);
  }

  /** GET /engagement/saved-doctors/:id/is-saved */
  @Get('engagement/saved-doctors/:id/is-saved')
  async isSaved(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) doctorId: string,
  ) {
    const saved = await this.engagementService.isSaved(userId, doctorId);
    return { isSaved: saved };
  }

  // ────────────────────────────────────────────────────────────
  // TRUST BADGES
  // ────────────────────────────────────────────────────────────

  /** GET /trust/doctor/:id/profile */
  @Get('trust/doctor/:id/profile')
  async getDoctorTrustProfile(@Param('id', ParseUUIDPipe) doctorId: string) {
    return this.trustService.getDoctorTrustProfile(doctorId);
  }

  /** GET /trust/hospital/:id/profile */
  @Get('trust/hospital/:id/profile')
  async getHospitalTrustProfile(@Param('id', ParseUUIDPipe) hospitalId: string) {
    return this.trustService.getHospitalTrustProfile(hospitalId);
  }

  /** GET /trust/platform-summary — Admin: platform trust overview */
  @Get('trust/platform-summary')
  @Roles(Role.ADMIN)
  async getPlatformTrustSummary() {
    return this.trustService.getPlatformTrustSummary();
  }

  // ────────────────────────────────────────────────────────────
  // ACTIVITY FEED (Admin only)
  // ────────────────────────────────────────────────────────────

  /** GET /engagement/activity-feed */
  @Get('engagement/activity-feed')
  @Roles(Role.ADMIN)
  async getActivityFeed(
    @CurrentUser('id') adminId: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.engagementService.getActivityFeed(adminId, limit);
  }
}
