import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logger } from "@/lib/infrastructure/logger";

// Helper to check if Redis environment variables are available
const isRedisConfigured = () => {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
};

// Initialize Redis client from environment variables
const redisClient = isRedisConfigured() 
  ? Redis.fromEnv() 
  : null;

/**
 * OTP Rate Limiter: 5 requests per minute
 * Applied to send-otp and verify-otp
 */
export const otpRatelimit = redisClient 
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: false,
      prefix: "@jivni/ratelimit/otp",
    })
  : null;

/**
 * Booking Rate Limiter: 10 requests per minute
 * Applied to booking endpoint
 */
export const bookingRatelimit = redisClient
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: false,
      prefix: "@jivni/ratelimit/booking",
    })
  : null;

/**
 * Executes a rate limit check with graceful fallback if Redis is missing.
 * @returns true if allowed, false if limited
 */
export async function checkUpstashRateLimit(
  limiter: Ratelimit | null, 
  identifier: string
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  if (!limiter) {
    // If Redis is not configured, we "fail open" to ensure the app remains functional.
    // In production, Redis MUST be configured.
    if (process.env.NODE_ENV === "production") {
      logger.error({ 
        category: "SYSTEM", 
        message: "Upstash Redis missing in production. Rate limiting bypassed!" 
      });
    }
    return { success: true };
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset
    };
  } catch (error) {
    // Graceful fallback for Redis connection issues
    logger.error({ 
      category: "SYSTEM", 
      message: "Rate limit check failed (Redis error), failing open.", 
      error 
    });
    return { success: true };
  }
}
