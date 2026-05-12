import { IsEnum, IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export class MarkReadDto {
  @IsOptional()
  @IsUUID('4', { each: true })
  ids?: string[]; // if empty, mark ALL as read
}

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  whatsappEnabled?: boolean;
}

export class NotificationQueryDto {
  @IsOptional()
  @IsString()
  type?: NotificationType;

  @IsOptional()
  unreadOnly?: boolean;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
