import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { TargetType } from '@prisma/client';

@Injectable()
export class ModerationLogService {
  constructor(private prisma: PrismaService) {}

  async logAction(
    adminId: string,
    action: string,
    targetType: TargetType,
    targetId: string,
    reason?: string,
  ) {
    return this.prisma.moderationLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        reason,
      },
    });
  }
}
