import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    sendOtp(sendOtpDto: SendOtpDto): Promise<{
        message: string;
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        message: string;
        token: string;
        user: {
            id: string;
            phone: string;
            name: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    getProfile(user: any): {
        message: string;
        user: any;
    };
}
