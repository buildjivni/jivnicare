// src/lib/infrastructure/idempotency.ts
import { redis } from '@/lib/db/redis';
import { logger } from '@/lib/infrastructure/logger';
import { NextResponse } from 'next/server';

/**
 * Ensures a specific API route operation is only executed once within the TTL.
 * Caches successful NextResponse JSON payloads.
 */
export async function withIdempotency(
  idempotencyKey: string | null | undefined,
  ttlSeconds: number,
  operation: () => Promise<NextResponse>
): Promise<NextResponse> {
  if (!idempotencyKey) {
    return await operation();
  }

  const cacheKey = `idempotency:${idempotencyKey}`;

  try {
    const existing = await redis.get(cacheKey);
    if (existing) {
      logger.info({ category: 'SYSTEM', message: 'Idempotent request recovered', metadata: { idempotencyKey } });
      const parsed = typeof existing === 'string' ? JSON.parse(existing) : existing;
      
      const { incrementTelemetryCounter } = await import('@/lib/telemetry/redis');
      incrementTelemetryCounter('duplicateTokenAttempts').catch(() => {});
      incrementTelemetryCounter('queueRecoveryEvents').catch(() => {});
      
      return NextResponse.json(parsed);
    }
  } catch (err) {
    logger.error({ category: 'SYSTEM', message: 'Redis get failed during idempotency check', error: err });
  }

  const response = await operation();

  if (response.ok) {
    try {
      const clone = response.clone();
      const body = await clone.json();
      await redis.set(cacheKey, JSON.stringify(body), { ex: ttlSeconds });
    } catch (err) {
      logger.error({ category: 'SYSTEM', message: 'Redis cache failed during idempotency', error: err });
    }
  }

  return response;
}
