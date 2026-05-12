import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { $Enums } from '@prisma/client';

export class CreateHospitalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  hospitalType?: string;

  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @IsBoolean()
  @IsOptional()
  emergencyAvailable?: boolean;

  @IsBoolean()
  @IsOptional()
  ambulanceAvailable?: boolean;

  @IsString()
  @IsOptional()
  website?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  // Arrays of slugs or terms to link
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialties?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];
}

export class UpdateHospitalDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  hospitalType?: string;

  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @IsBoolean()
  @IsOptional()
  emergencyAvailable?: boolean;

  @IsBoolean()
  @IsOptional()
  ambulanceAvailable?: boolean;

  @IsString()
  @IsOptional()
  website?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  rating?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialties?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];
}

export class FilterHospitalDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  hospitalType?: string;

  @IsString()
  @IsOptional()
  specialty?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  emergencyAvailable?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  ambulanceAvailable?: boolean;

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
