import { QueueStatus, TokenStatus } from '@prisma/client';
export declare class UpdateQueueStatusDto {
    status?: QueueStatus;
    maxCapacity?: number;
}
export declare class UpdateTokenStatusDto {
    status: TokenStatus;
}
