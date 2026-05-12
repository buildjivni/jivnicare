import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateBookingSettingsDto {
  @IsOptional()
  @IsBoolean()
  isAcceptingAppointments?: boolean;

  @IsOptional()
  @IsBoolean()
  emergencyAvailable?: boolean;
}
