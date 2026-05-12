import { IsEnum, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export enum ModerationAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SUSPEND = 'SUSPEND',
}

export class ModerateEntityDto {
  @IsEnum(ModerationAction)
  @IsNotEmpty()
  action: ModerationAction;

  @IsString()
  @IsOptional()
  reason?: string;
}
