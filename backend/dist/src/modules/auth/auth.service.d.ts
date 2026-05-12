import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { SendOtpDto, VerifyOtpDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly logger;
    private readonly MAX_ATTEMPTS;
    private readonly OTP_EXPIRY_MS;
    constructor(prisma: PrismaService, jwtService: JwtService);
    sendOtp(dto: SendOtpDto): Promise<{
        message: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        message: string;
        token: string;
        user: {
            id: string;
            phone: string;
            name: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
}
