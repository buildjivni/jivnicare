import { PrismaService } from '../../../database/prisma.service';
import { UpdateUserProfileDto } from '../dto/dashboard.dto';
export declare class UserDashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        profile: {
            phone: string;
            id: string;
            createdAt: Date;
            name: string | null;
            role: import("@prisma/client").$Enums.Role;
            isVerified: boolean;
        };
        recentSearches: never[];
        savedDoctors: never[];
    }>;
    updateProfile(userId: string, updateDto: UpdateUserProfileDto): Promise<{
        message: string;
        user: {
            phone: string;
            id: string;
            name: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
}
