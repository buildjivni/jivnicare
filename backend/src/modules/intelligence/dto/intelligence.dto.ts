import { IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class SmartSearchDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  emergency?: boolean;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

export class SuggestionDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsString()
  district?: string;
}

export class RecommendationDto {
  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  limit?: number;
}
