import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { NotificationType, VerificationStatus } from '@prisma/client';

/**
 * NotificationEventsService
 * ─────────────────────────
 * Single point of truth for all notification-triggering business events.
 * Called by Moderation, Dashboard, and other services to emit notifications.
 * Designed for future compatibility with a queue (BullMQ) or Redis pub/sub.
 */
@Injectable()
export class NotificationEventsService {
  private readonly logger = new Logger(NotificationEventsService.name);

  constructor(private readonly notifications: NotificationService) {}

  // ── Doctor Verification Events ────────────────────────────────

  async onDoctorVerificationStatusChanged(
    doctorUserId: string,
    doctorName: string,
    status: VerificationStatus,
    reason?: string,
  ) {
    const templates: Record<VerificationStatus, { type: NotificationType; title: string; message: string }> = {
      VERIFIED: {
        type: NotificationType.VERIFICATION_APPROVED,
        title: '🎉 Profile Verified!',
        message: `Congratulations ${doctorName}! Your JivniCare profile has been verified. Patients can now find and book you.`,
      },
      REJECTED: {
        type: NotificationType.VERIFICATION_REJECTED,
        title: '⚠️ Verification Not Approved',
        message: `Your profile verification was not approved. Reason: ${reason ?? 'Please review your documents and resubmit.'}`,
      },
      SUSPENDED: {
        type: NotificationType.VERIFICATION_SUSPENDED,
        title: '🚫 Profile Suspended',
        message: `Your JivniCare profile has been temporarily suspended. Reason: ${reason ?? 'Contact support for details.'}`,
      },
      PENDING: {
        type: NotificationType.PLATFORM_ALERT,
        title: 'Profile Under Review',
        message: 'Your profile is under review. You will be notified once verified.',
      },
    };

    const template = templates[status];
    try {
      await this.notifications.create({
        userId: doctorUserId,
        type: template.type,
        title: template.title,
        message: template.message,
        metadata: { status, reason },
      });
    } catch (err) {
      this.logger.error(`Failed to notify doctor ${doctorUserId}`, err);
    }
  }

  // ── Admin Moderation Alerts ───────────────────────────────────

  async onNewDoctorPendingVerification(
    adminUserIds: string[],
    doctorName: string,
    district: string,
  ) {
    const dtos = adminUserIds.map((adminId) => ({
      userId: adminId,
      type: NotificationType.MODERATION_PENDING,
      title: '🔔 New Verification Request',
      message: `Dr. ${doctorName} from ${district} has submitted a profile for verification.`,
      metadata: { doctorName, district },
    }));

    await this.notifications.createMany(dtos);
  }

  async onHospitalPendingVerification(
    adminUserIds: string[],
    hospitalName: string,
    district: string,
  ) {
    const dtos = adminUserIds.map((adminId) => ({
      userId: adminId,
      type: NotificationType.MODERATION_PENDING,
      title: '🏥 Hospital Verification Request',
      message: `${hospitalName} in ${district} has submitted for verification.`,
      metadata: { hospitalName, district },
    }));

    await this.notifications.createMany(dtos);
  }

  // ── Profile Updated ───────────────────────────────────────────

  async onProfileUpdated(userId: string, entityName: string, role: 'doctor' | 'user') {
    await this.notifications.create({
      userId,
      type: NotificationType.PROFILE_UPDATED,
      title: '✅ Profile Updated',
      message: `Your ${role} profile has been successfully updated.`,
      metadata: { entityName },
    });
  }

  // ── Platform Alert (broadcast) ────────────────────────────────

  async sendPlatformAlert(userIds: string[], title: string, message: string) {
    const dtos = userIds.map((userId) => ({
      userId,
      type: NotificationType.PLATFORM_ALERT,
      title,
      message,
    }));
    await this.notifications.createMany(dtos);
  }
}
