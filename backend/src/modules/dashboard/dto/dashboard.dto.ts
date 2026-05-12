import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
} from 'class-validator';

export class UpdateUserProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class UpdateDoctorProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  experience?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  fee?: number;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  hospitalName?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialties?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];
}

export class UpdateDoctorSettingsDto {
  @IsBoolean()
  @IsOptional()
  emergencyAvailable?: boolean;
}
