import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const dbUrl = process.env.DATABASE_URL ?? '';

    if (dbUrl.startsWith('prisma+postgres://')) {
      // Prisma Postgres / Accelerate URL — uses Prisma's own protocol
      super({
        log: ['error', 'warn'],
        accelerateUrl: dbUrl,
      });
    } else {
      // Standard postgres:// (Railway, Supabase, local Postgres) — use pg adapter
      const pool = new Pool({ connectionString: dbUrl });
      const adapter = new PrismaPg(pool);
      super({ adapter, log: ['error', 'warn'] });
    }
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Successfully connected to the database');
    } catch (error) {
      this.logger.error('❌ Failed to connect to the database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from the database');
  }
}
