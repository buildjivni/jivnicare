import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { TargetType } from '@prisma/client';

@Injectable()
export class AdminAuditService {
  private readonly logger = new Logger(AdminAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Logs an operational moderation action performed by an admin.
   */
  async logAction(
    adminId: string,
    action: string,
    targetType: TargetType,
    targetId: string,
    reason?: string,
  ) {
    try {
      await this.prisma.moderationLog.create({
        data: {
          adminId,
          action,
          targetType,
          targetId,
          reason,
        },
      });
      
      this.logger.log(`Admin [${adminId}] performed ${action} on ${targetType} [${targetId}]`);
    } catch (error) {
      this.logger.error(`Failed to log audit action: ${error.message}`, error.stack);
      // We don't throw here to prevent blocking the actual moderation action if logging fails
    }
  }
}
