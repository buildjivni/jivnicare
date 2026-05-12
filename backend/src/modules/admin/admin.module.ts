import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { VerificationService } from './services/verification.service';
import { GovernanceService } from './services/governance.service';
import { AnalyticsService } from './services/analytics.service';
import { AdminAuditService } from './services/admin-audit.service';

@Module({
  controllers: [AdminController],
  providers: [
    VerificationService,
    GovernanceService,
    AnalyticsService,
    AdminAuditService,
  ],
  exports: [
    VerificationService,
    GovernanceService,
    AnalyticsService,
  ],
})
export class AdminModule {}
