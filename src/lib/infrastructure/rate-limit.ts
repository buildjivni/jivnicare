import prisma from '@/lib/db/prisma';
import { logger } from '@/lib/infrastructure/logger';

export interface RateLimitConfig {
  identifier: string; // usually IP address or phone number + route name
  limit: number;
  windowMs: number;
}

/**
 * Lightweight DB-backed rate limiter.
 * Ideal for MVP and Serverless where memory limits don't persist across instances.
 * Not recommended for high-DDoS protection (use Upstash Redis for that), 
 * but excellent for basic business logic throttling (e.g. OTP spam).
 */
export async function checkRateLimit({ identifier, limit, windowMs }: RateLimitConfig): Promise<{ success: boolean; remaining: number; resetTime: Date }> {
  try {
    const now = new Date();

    // Find existing rate limit record
    let record = await prisma.rateLimit.findUnique({
      where: { ip: identifier }
    });

    if (!record) {
      // Create new record
      record = await prisma.rateLimit.create({
        data: {
          ip: identifier,
          count: 1,
          resetTime: new Date(now.getTime() + windowMs)
        }
      });
      return { success: true, remaining: Math.max(0, limit - 1), resetTime: record.resetTime };
    }

    // If the reset time has passed, reset the count
    if (now > record.resetTime) {
      record = await prisma.rateLimit.update({
        where: { ip: identifier },
        data: {
          count: 1,
          resetTime: new Date(now.getTime() + windowMs)
        }
      });
      return { success: true, remaining: Math.max(0, limit - 1), resetTime: record.resetTime };
    }

    // If we're within the window, check the count
    if (record.count >= limit) {
      logger.warn({
        category: 'SYSTEM',
        message: 'Rate limit exceeded',
        metadata: { identifier, limit, resetTime: record.resetTime }
      });
      return { success: false, remaining: 0, resetTime: record.resetTime };
    }

    // Otherwise, increment the count
    record = await prisma.rateLimit.update({
      where: { ip: identifier },
      data: {
        count: { increment: 1 }
      }
    });

    return { success: true, remaining: Math.max(0, limit - record.count), resetTime: record.resetTime };

  } catch (error) {
    logger.error({
      category: 'SYSTEM',
      message: 'Rate limit check failed (failing open for resilience)',
      error
    });
    // Fail open if the database call fails, to prevent blocking legitimate traffic due to DB strain
    return { success: true, remaining: 1, resetTime: new Date(Date.now() + windowMs) };
  }
}
