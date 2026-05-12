import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 10, { message: 'Phone number must be exactly 10 digits' })
  @Matches(/^[6-9]\d{9}$/, { message: 'Invalid Indian phone number' })
  phone: string;
}

export class VerifyOtpDto extends SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;
}
