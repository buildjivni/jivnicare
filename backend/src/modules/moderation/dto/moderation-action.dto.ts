import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ModerationActionDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
