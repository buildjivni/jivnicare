import { IsArray, IsEnum, IsOptional, ValidateNested, IsString, Matches, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export class TimeSlotDto {
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'start must be in HH:mm format' })
  start: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'end must be in HH:mm format' })
  end: string;
}

export class UpdateAvailabilityDto {
  @IsOptional()
  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  availableDays?: DayOfWeek[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  availableTimeSlots?: TimeSlotDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  maxAppointmentsPerDay?: number;
}
