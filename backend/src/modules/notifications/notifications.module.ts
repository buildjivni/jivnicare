import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { NotificationsController } from './notifications.controller';
import { NotificationService } from './services/notification.service';
import { EngagementService } from './services/engagement.service';
import { TrustService } from './services/trust.service';
import { NotificationEventsService } from './notification-events.service';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationsController],
  providers: [
    NotificationService,
    EngagementService,
    TrustService,
    NotificationEventsService,
  ],
  // Export so other modules (moderation, dashboard) can inject NotificationEventsService
  exports: [NotificationService, NotificationEventsService, TrustService],
})
export class NotificationsModule {}
