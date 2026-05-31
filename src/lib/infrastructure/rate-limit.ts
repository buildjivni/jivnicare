// src/lib/infrastructure/rate-limit.ts
import { logger } from '@/lib/infrastructure/logger';
import { redis } from '@/lib/db/redis';

export interface RateLimitConfig {
  identifier: string; // e.g., IP or phone+route
  limit: number;
  windowMs: number;
}

export async function checkRateLimit({ identifier, limit, windowMs }: RateLimitConfig): Promise<{ success: boolean; remaining: number; resetTime: Date }> {
  try {
    const key = `rate_limit:${identifier}`;
    
    // Attempt to increment the count
    const current = await redis.incr(key);
    
    if (current === 1) {
      // First request in the window, set expiry
      await redis.pexpire(key, windowMs);
    }
    
    // Get time to live for reset calculation
    let ttl = await redis.pttl(key);
    if (ttl < 0) ttl = windowMs; // Fallback
    
    const resetTime = new Date(Date.now() + ttl);
    const remaining = Math.max(0, limit - current);

    if (current > limit) {
      logger.warn({
        category: 'SYSTEM',
        message: 'Rate limit exceeded',
        metadata: { identifier, limit, resetTime }
      });
      return { success: false, remaining: 0, resetTime };
    }

    return { success: true, remaining, resetTime };
  } catch (error) {
    // If Redis fails, log error but allow request (fail open to prevent total outage)
    logger.error({ category: 'SYSTEM', message: 'Redis rate limit failure, failing open', error });
    return { success: true, remaining: 1, resetTime: new Date(Date.now() + windowMs) };
  }
}
