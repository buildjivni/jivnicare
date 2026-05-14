import { HealthCheckService, PrismaHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../../database/prisma.service';
export declare class HealthController {
    private health;
    private db;
    private prisma;
    private memory;
    constructor(health: HealthCheckService, db: PrismaHealthIndicator, prisma: PrismaService, memory: MemoryHealthIndicator);
    check(): {
        status: string;
        message: string;
        timestamp: string;
    };
}
