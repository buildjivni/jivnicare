"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
const client_1 = require("@prisma/client");
let TrustService = class TrustService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDoctorTrustProfile(doctorId) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { id: doctorId },
            include: { specialties: true },
        });
        if (!doctor) {
            return { badges: [], trustScore: 0, isVerified: false, verificationStatus: 'PENDING' };
        }
        const badges = [];
        let score = 0;
        if (doctor.verificationStatus === client_1.VerificationStatus.VERIFIED) {
            badges.push('VERIFIED');
            score += 40;
        }
        if (doctor.emergencyAvailable) {
            badges.push('EMERGENCY_AVAILABLE');
            score += 15;
        }
        if (doctor.rating >= 4.5) {
            badges.push('HIGHLY_RATED');
            score += 20;
        }
        if (doctor.experience >= 10) {
            badges.push('EXPERIENCED');
            score += 15;
        }
        const searchHits = await this.prisma.profileAnalytics.count({
            where: { targetType: 'DOCTOR', targetId: doctorId, action: 'VIEW' },
        });
        if (searchHits >= 50) {
            badges.push('TOP_SEARCHED');
            score += 10;
        }
        return {
            badges,
            trustScore: Math.min(score, 100),
            isVerified: doctor.verificationStatus === client_1.VerificationStatus.VERIFIED,
            verificationStatus: doctor.verificationStatus,
        };
    }
    async getHospitalTrustProfile(hospitalId) {
        const hospital = await this.prisma.hospital.findUnique({ where: { id: hospitalId } });
        if (!hospital) {
            return {
                badges: [],
                trustScore: 0,
                isVerified: false,
                verificationStatus: 'PENDING',
                hasEmergency: false,
            };
        }
        const badges = [];
        let score = 0;
        if (hospital.verificationStatus === client_1.VerificationStatus.VERIFIED) {
            badges.push('VERIFIED');
            badges.push('TRUSTED_HOSPITAL');
            score += 50;
        }
        if (hospital.emergencyAvailable) {
            badges.push('EMERGENCY_AVAILABLE');
            score += 25;
        }
        if (hospital.rating >= 4.5) {
            badges.push('HIGHLY_RATED');
            score += 25;
        }
        return {
            badges,
            trustScore: Math.min(score, 100),
            isVerified: hospital.verificationStatus === client_1.VerificationStatus.VERIFIED,
            verificationStatus: hospital.verificationStatus,
            hasEmergency: hospital.emergencyAvailable,
        };
    }
    async getPlatformTrustSummary() {
        const [verifiedDoctors, verifiedHospitals, totalDoctors, totalHospitals] = await Promise.all([
            this.prisma.doctor.count({ where: { verificationStatus: client_1.VerificationStatus.VERIFIED } }),
            this.prisma.hospital.count({ where: { verificationStatus: client_1.VerificationStatus.VERIFIED } }),
            this.prisma.doctor.count(),
            this.prisma.hospital.count(),
        ]);
        return {
            verifiedDoctors,
            verifiedHospitals,
            totalDoctors,
            totalHospitals,
            verificationRate: {
                doctors: totalDoctors ? Math.round((verifiedDoctors / totalDoctors) * 100) : 0,
                hospitals: totalHospitals
                    ? Math.round((verifiedHospitals / totalHospitals) * 100)
                    : 0,
            },
        };
    }
};
exports.TrustService = TrustService;
exports.TrustService = TrustService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrustService);
//# sourceMappingURL=trust.service.js.map