import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { VerificationStatus } from '@prisma/client';

export type TrustBadge =
  | 'VERIFIED'
  | 'EMERGENCY_AVAILABLE'
  | 'TOP_SEARCHED'
  | 'TRUSTED_HOSPITAL'
  | 'HIGHLY_RATED'
  | 'EXPERIENCED';

export interface DoctorTrustProfile {
  badges: TrustBadge[];
  trustScore: number; // 0–100
  isVerified: boolean;
  verificationStatus: VerificationStatus;
}

export interface HospitalTrustProfile {
  badges: TrustBadge[];
  trustScore: number;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  hasEmergency: boolean;
}

@Injectable()
export class TrustService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Doctor Trust Profile ──────────────────────────────────────
  async getDoctorTrustProfile(doctorId: string): Promise<DoctorTrustProfile> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { specialties: true },
    });

    if (!doctor) {
      return { badges: [], trustScore: 0, isVerified: false, verificationStatus: 'PENDING' };
    }

    const badges: TrustBadge[] = [];
    let score = 0;

    if (doctor.verificationStatus === VerificationStatus.VERIFIED) {
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

    // Top searched: check analytics
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
      isVerified: doctor.verificationStatus === VerificationStatus.VERIFIED,
      verificationStatus: doctor.verificationStatus,
    };
  }

  // ── Hospital Trust Profile ────────────────────────────────────
  async getHospitalTrustProfile(hospitalId: string): Promise<HospitalTrustProfile> {
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

    const badges: TrustBadge[] = [];
    let score = 0;

    if (hospital.verificationStatus === VerificationStatus.VERIFIED) {
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
      isVerified: hospital.verificationStatus === VerificationStatus.VERIFIED,
      verificationStatus: hospital.verificationStatus,
      hasEmergency: hospital.emergencyAvailable,
    };
  }

  // ── Platform-level trust summary ─────────────────────────────
  async getPlatformTrustSummary() {
    const [verifiedDoctors, verifiedHospitals, totalDoctors, totalHospitals] =
      await Promise.all([
        this.prisma.doctor.count({ where: { verificationStatus: VerificationStatus.VERIFIED } }),
        this.prisma.hospital.count({ where: { verificationStatus: VerificationStatus.VERIFIED } }),
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
}
