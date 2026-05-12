import { IsString, IsOptional, IsEnum, IsInt } from 'class-validator';

export class GenerateOnlineTokenDto {
  @IsString()
  doctorId: string;
}

export class GenerateWalkInTokenDto {
  @IsString()
  doctorId: string;
  
  @IsString()
  patientName: string;
  
  @IsOptional()
  @IsString()
  phoneNumber?: string;
  
  @IsOptional()
  @IsString()
  symptoms?: string;
}
