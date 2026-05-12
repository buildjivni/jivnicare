import { IsString, IsEnum, MinLength } from 'class-validator';
import { TargetType } from '@prisma/client';

export class ReportEntityDto {
  @IsEnum(TargetType)
  targetType: TargetType;

  @IsString()
  targetId: string;

  @IsString()
  @MinLength(10, { message: 'Reason must be at least 10 characters.' })
  reason: string;
}
