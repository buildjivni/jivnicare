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
    return this.health.check([
      () => this.db.pingCheck('database', this.prisma),
      // Ensure the process has not exceeded 300MB of heap allocation
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      // Ensure the process has not exceeded 300MB of resident set size
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ]);
  }
}
