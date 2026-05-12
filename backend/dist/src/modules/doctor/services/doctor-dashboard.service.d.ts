import { PrismaService } from '../../../database/prisma.service';
export declare class DoctorDashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(userId: string): Promise<{
        profileCompletionPercentage: number;
        verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
        isAcceptingAppointments: boolean;
        emergencyAvailable: boolean;
        stats: {
            todayAppointments: number;
            pendingBookings: number;
            completedAppointments: number;
            maxAppointmentsPerDay: number;
        };
    }>;
}
