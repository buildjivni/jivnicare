import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, PrismaHealthIndicator, MemoryHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { PrismaService } from '../../database/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: PrismaHealthIndicator,
    private prisma: PrismaService,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @Public() // Accessible to Load Balancers / Uptime checkers
  @HealthCheck()
  check() {
    return {
      status: 'ok',
      message: 'Healthcheck passed',
      timestamp: new Date().toISOString()
    };
  }
}
