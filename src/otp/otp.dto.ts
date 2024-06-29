import { IsBoolean, IsEnum, IsString, Length } from 'class-validator';

export class OtpDto {
  @IsString()
  @IsEnum(['mail', 'sms', 'whatsapp'])
  type: string;
  @IsString()
  to: string;
}

export class VerifyOtpDto {
  @IsString()
  @Length(6, 6)
  otp: string;
}

export class OtpResponseDto {
  @IsBoolean()
  success: boolean;
  message: string;
}
