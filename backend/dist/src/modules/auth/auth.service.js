"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    logger = new common_1.Logger(AuthService_1.name);
    MAX_ATTEMPTS = 3;
    OTP_EXPIRY_MS = 5 * 60 * 1000;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async sendOtp(dto) {
        const { phone } = dto;
        const existingOtp = await this.prisma.otpToken.findUnique({
            where: { phone },
        });
        if (existingOtp && existingOtp.createdAt.getTime() > Date.now() - 60000) {
            throw new common_1.BadRequestException('Please wait 60 seconds before requesting another OTP');
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MS);
        const saltRounds = 10;
        const hashedOtp = await bcrypt.hash(otp, saltRounds);
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
        this.logger.log(`[MOCK SMS] Sending OTP ${otp} to phone ${phone}`);
        return {
            message: 'OTP sent successfully',
        };
    }
    async verifyOtp(dto) {
        const { phone, otp } = dto;
        const storedData = await this.prisma.otpToken.findUnique({
            where: { phone },
        });
        if (!storedData) {
            throw new common_1.BadRequestException('OTP not requested or expired');
        }
        if (new Date() > storedData.expiresAt) {
            await this.prisma.otpToken.delete({ where: { phone } });
            throw new common_1.BadRequestException('OTP has expired');
        }
        if (storedData.attempts >= this.MAX_ATTEMPTS) {
            await this.prisma.otpToken.delete({ where: { phone } });
            throw new common_1.BadRequestException('Too many failed attempts. Please request a new OTP.');
        }
        const isMatch = await bcrypt.compare(otp, storedData.hashedOtp);
        if (!isMatch) {
            await this.prisma.otpToken.update({
                where: { phone },
                data: { attempts: storedData.attempts + 1 },
            });
            throw new common_1.BadRequestException('Invalid OTP');
        }
        await this.prisma.otpToken.delete({ where: { phone } });
        let user = await this.prisma.user.findUnique({
            where: { phone },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    phone,
                    isVerified: true,
                    role: client_1.Role.USER,
                },
            });
            this.logger.log(`Created new user with phone ${phone}`);
        }
        else if (!user.isVerified) {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: { isVerified: true },
            });
        }
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map