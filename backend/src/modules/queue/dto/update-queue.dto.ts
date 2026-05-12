import { IsEnum, IsOptional, IsInt } from 'class-validator';
import { QueueStatus, TokenStatus } from '@prisma/client';

export class UpdateQueueStatusDto {
  @IsOptional()
  @IsEnum(QueueStatus)
  status?: QueueStatus;

  @IsOptional()
  @IsInt()
  maxCapacity?: number;
}

export class UpdateTokenStatusDto {
  @IsEnum(TokenStatus)
  status: TokenStatus;
}
