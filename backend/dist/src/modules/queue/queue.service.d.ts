import { PrismaService } from '../../database/prisma.service';
import { GenerateOnlineTokenDto, GenerateWalkInTokenDto } from './dto/generate-token.dto';
import { UpdateQueueStatusDto, UpdateTokenStatusDto } from './dto/update-queue.dto';
import { DailyQueue } from '@prisma/client';
export declare class QueueService {
    private prisma;
    constructor(prisma: PrismaService);
    getOrCreateDailyQueue(doctorId: string, date: Date): Promise<DailyQueue>;
    generateOnlineToken(userId: string, dto: GenerateOnlineTokenDto): Promise<{
        user: {
            phone: string;
            id: string;
            name: string | null;
        } | null;
    } & {
        id: string;
        userId: string | null;
        status: import("@prisma/client").$Enums.TokenStatus;
        tokenIssuedAt: Date;
        queueId: string;
        tokenNumber: number;
        source: import("@prisma/client").$Enums.TokenSource;
        walkInEntryId: string | null;
        estimatedTime: Date | null;
    }>;
    generateWalkInToken(dto: GenerateWalkInTokenDto): Promise<{
        walkInEntry: {
            id: string;
            createdAt: Date;
            patientName: string;
            phoneNumber: string | null;
            symptoms: string | null;
        } | null;
    } & {
        id: string;
        userId: string | null;
        status: import("@prisma/client").$Enums.TokenStatus;
        tokenIssuedAt: Date;
        queueId: string;
        tokenNumber: number;
        source: import("@prisma/client").$Enums.TokenSource;
        walkInEntryId: string | null;
        estimatedTime: Date | null;
    }>;
    getDoctorLiveQueue(doctorUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.QueueStatus;
        doctorId: string;
        date: Date;
        maxCapacity: number;
        currentActiveToken: number;
    }>;
    updateQueueStatus(queueId: string, doctorUserId: string, dto: UpdateQueueStatusDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.QueueStatus;
        doctorId: string;
        date: Date;
        maxCapacity: number;
        currentActiveToken: number;
    }>;
    updateTokenStatus(tokenId: string, doctorUserId: string, dto: UpdateTokenStatusDto): Promise<{
        user: {
            phone: string;
            id: string;
            name: string | null;
        } | null;
        walkInEntry: {
            id: string;
            createdAt: Date;
            patientName: string;
            phoneNumber: string | null;
            symptoms: string | null;
        } | null;
    } & {
        id: string;
        userId: string | null;
        status: import("@prisma/client").$Enums.TokenStatus;
        tokenIssuedAt: Date;
        queueId: string;
        tokenNumber: number;
        source: import("@prisma/client").$Enums.TokenSource;
        walkInEntryId: string | null;
        estimatedTime: Date | null;
    }>;
}
