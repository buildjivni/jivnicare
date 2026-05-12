import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
  IsArray,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { $Enums } from '@prisma/client';

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  userId: string; // The ID of the authenticated user to link

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  experience: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  fee: number;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  hospitalName: string;

  @IsBoolean()
  @IsOptional()
  emergencyAvailable?: boolean;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  // Arrays of slugs or terms to link
  @IsArray()
  @IsString({ each: true })
  specialties: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];
}

export class UpdateDoctorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  experience?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  fee?: number;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  hospitalName?: string;

  @IsEnum($Enums.VerificationStatus)
  @IsOptional()
  verificationStatus?: $Enums.VerificationStatus; // Can be updated by Admin

  @IsBoolean()
  @IsOptional()
  emergencyAvailable?: boolean;

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

export class FilterDoctorDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  specialty?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  emergencyAvailable?: boolean;

  @IsEnum($Enums.VerificationStatus)
  @IsOptional()
  verificationStatus?: $Enums.VerificationStatus;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
