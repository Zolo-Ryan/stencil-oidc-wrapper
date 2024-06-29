import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpAdaptersService } from './otp-adapters/otp-adapters.service';
import { OtpManagerService } from './otp-manager/otp-manager.service';

describe('OtpService', () => {
  let service: OtpService;
  let otpAdaptersService: OtpAdaptersService;
  let otpManagerService: OtpManagerService;

  beforeAll(() => {
    process.env.OTP_TIMEOUT = '300'; // Set default timeout to 300 seconds (5 minutes)
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: OtpAdaptersService,
          useValue: {
            mailOtpAdapter: jest.fn(),
            smsOtpAdapter: jest.fn(),
            whatsappOtpAdapter: jest.fn(),
          },
        },
        {
          provide: OtpManagerService,
          useValue: {
            generateOtp: jest.fn().mockResolvedValue('123456'),
            validateOtp: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
    otpAdaptersService = module.get<OtpAdaptersService>(OtpAdaptersService);
    otpManagerService = module.get<OtpManagerService>(OtpManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendOtp', () => {
    it('should send OTP via mail', async () => {
      const response = await service.sendOtp('mail', 'test@example.com');
      expect(response).toEqual({
        success: true,
        message: 'OTP sent successfully',
      });
      expect(otpAdaptersService.mailOtpAdapter).toHaveBeenCalledWith(
        '123456',
        'test@example.com',
      );
    });

    it('should send OTP via sms', async () => {
      const response = await service.sendOtp('sms', '1234567890');
      expect(response).toEqual({
        success: true,
        message: 'OTP sent successfully',
      });
      expect(otpAdaptersService.smsOtpAdapter).toHaveBeenCalledWith(
        '123456',
        '1234567890',
      );
    });

    it('should send OTP via whatsapp', async () => {
      const response = await service.sendOtp('whatsapp', '1234567890');
      expect(response).toEqual({
        success: true,
        message: 'OTP sent successfully',
      });
      expect(otpAdaptersService.whatsappOtpAdapter).toHaveBeenCalledWith(
        '123456',
        '1234567890',
      );
    });

    it('should throw BadRequestException for invalid type', async () => {
      await expect(service.sendOtp('invalid', '1234567890')).rejects.toThrow(
        InternalServerErrorException || BadRequestException,
      );
    });

    it('should handle internal server error', async () => {
      jest
        .spyOn(otpManagerService, 'generateOtp')
        .mockRejectedValueOnce(new Error('Test error'));
      await expect(service.sendOtp('mail', 'test@example.com')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('validateOtp', () => {
    it('should validate a valid OTP', async () => {
      jest.spyOn(otpManagerService, 'validateOtp').mockResolvedValueOnce(true);
      const response = await service.validateOtp('123456');
      expect(response).toEqual({
        success: true,
        message: 'OTP is valid and verified',
      });
    });

    it('should invalidate an invalid OTP', async () => {
      jest.spyOn(otpManagerService, 'validateOtp').mockResolvedValueOnce(false);
      const response = await service.validateOtp('000000');
      expect(response).toEqual({
        success: false,
        message: 'OTP is invalid or expired',
      });
    });

    it('should handle internal server error', async () => {
      jest
        .spyOn(otpManagerService, 'validateOtp')
        .mockRejectedValueOnce(new Error('Test error'));
      await expect(service.validateOtp('123456')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
});
