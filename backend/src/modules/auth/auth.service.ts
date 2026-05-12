import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { SendOtpDto, VerifyOtpDto } from './dto/auth.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // MAX OTP attempts before locking out or requiring resend
  private readonly MAX_ATTEMPTS = 3;
  // OTP expiry in milliseconds (5 minutes)
  private readonly OTP_EXPIRY_MS = 5 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async sendOtp(dto: SendOtpDto) {
    const { phone } = dto;

    // Check rate limits/cooldown: prevent spamming OTPs within 60 seconds
    const existingOtp = await this.prisma.otpToken.findUnique({
      where: { phone },
    });

    if (existingOtp && existingOtp.createdAt.getTime() > Date.now() - 60000) {
      throw new BadRequestException('Please wait 60 seconds before requesting another OTP');
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MS);

    // Hash the OTP before storing it
    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp, saltRounds);

    // Upsert the OTP token in the DB
    await this.prisma.otpToken.upsert({
      where: { phone },
      update: {
        hashedOtp,
        expiresAt,
        attempts: 0,
        createdAt: new Date(),
      },
      create: {
        phone,
        hashedOtp,
        expiresAt,
        attempts: 0,
      },
    });

    // Simulate sending OTP (SMS integration goes here)
    this.logger.log(`[MOCK SMS] Sending OTP ${otp} to phone ${phone}`);

    return {
      message: 'OTP sent successfully',
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const { phone, otp } = dto;

    const storedData = await this.prisma.otpToken.findUnique({
      where: { phone },
    });

    if (!storedData) {
      throw new BadRequestException('OTP not requested or expired');
    }

    if (new Date() > storedData.expiresAt) {
      await this.prisma.otpToken.delete({ where: { phone } });
      throw new BadRequestException('OTP has expired');
    }

    if (storedData.attempts >= this.MAX_ATTEMPTS) {
      await this.prisma.otpToken.delete({ where: { phone } });
      throw new BadRequestException('Too many failed attempts. Please request a new OTP.');
    }

    const isMatch = await bcrypt.compare(otp, storedData.hashedOtp);

    if (!isMatch) {
      await this.prisma.otpToken.update({
        where: { phone },
        data: { attempts: storedData.attempts + 1 },
      });
      throw new BadRequestException('Invalid OTP');
    }

    // OTP is valid. Remove it from store to prevent reuse.
    await this.prisma.otpToken.delete({ where: { phone } });

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          isVerified: true,
          role: Role.USER, // Default role
        },
      });
      this.logger.log(`Created new user with phone ${phone}`);
    } else if (!user.isVerified) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    // Generate JWT
    const payload = { sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      message: 'OTP verified successfully',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    };
  }
}
