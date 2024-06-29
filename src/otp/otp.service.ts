import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { OtpAdaptersService } from './otp-adapters/otp-adapters.service';
import { OtpManagerService } from './otp-manager/otp-manager.service';

@Injectable()
export class OtpService {
  private readonly logger: Logger;
  constructor(
    private otpAdaptersService: OtpAdaptersService,
    private otpManagerService: OtpManagerService,
  ) {
    this.logger = new Logger(OtpService.name)
  }

  time: number = parseInt(process.env.OTP_TIMEOUT);

  async sendOtp(type: string, to: string) {
    try {
      const otpGenerated = await this.otpManagerService.generateOtp();

      if (type === 'mail') {
        await this.otpAdaptersService.mailOtpAdapter(otpGenerated, to);
      } else if (type === 'sms') {
        await this.otpAdaptersService.smsOtpAdapter(otpGenerated, to);
      } else if (type === 'whatsapp') {
        await this.otpAdaptersService.whatsappOtpAdapter(otpGenerated, to);
      } else {
        throw new BadRequestException( {
          success: false,
          message: 'Invalid type',
        });
      }

      return {
        success: true,
        message: 'OTP sent successfully',
      };
    } catch (error) {
      this.logger.log(error);
      throw new InternalServerErrorException({
        success: false,
        message: 'error occured while sending otp',
      })
    }
  }

  async validateOtp(otp: string) {
    try {
      const res = await this.otpManagerService.validateOtp(otp);

      if (res) {
        return {
          success: true,
          message: 'OTP is valid and verified',
        };
      }
      return {
        success: false,
        message: 'OTP is invalid or expired',
      };
    } catch (error) {
      this.logger.log(error);
      throw new InternalServerErrorException({
        success: false,
        message: 'error occured while validating otp',
      });
    }
  }
}
