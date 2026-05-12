import { QueueService } from './queue.service';
import { GenerateOnlineTokenDto, GenerateWalkInTokenDto } from './dto/generate-token.dto';
import { UpdateQueueStatusDto, UpdateTokenStatusDto } from './dto/update-queue.dto';
export declare class QueueController {
    private readonly queueService;
    constructor(queueService: QueueService);
    generateOnlineToken(req: any, dto: GenerateOnlineTokenDto): Promise<{
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
    getDoctorLiveQueue(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.QueueStatus;
        doctorId: string;
        date: Date;
        maxCapacity: number;
        currentActiveToken: number;
    }>;
    updateQueueStatus(req: any, queueId: string, dto: UpdateQueueStatusDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.QueueStatus;
        doctorId: string;
        date: Date;
        maxCapacity: number;
        currentActiveToken: number;
    }>;
    updateTokenStatus(req: any, tokenId: string, dto: UpdateTokenStatusDto): Promise<{
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
