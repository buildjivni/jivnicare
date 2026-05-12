import { Module } from '@nestjs/common';
import { ModerationController } from './moderation.controller';
import { DoctorModerationService } from './services/doctor-moderation.service';
import { HospitalModerationService } from './services/hospital-moderation.service';
import { ModerationLogService } from './services/moderation-log.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [ModerationController],
  providers: [
    DoctorModerationService,
    HospitalModerationService,
    ModerationLogService,
  ],
})
export class ModerationModule {}
