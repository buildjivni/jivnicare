// src/lib/infrastructure/rate-limit.ts
import { logger } from '@/lib/infrastructure/logger';

export interface RateLimitConfig {
  identifier: string; // e.g., IP or phone+route
  limit: number;
  windowMs: number;
}

// In‑memory cache with simple LRU eviction based on reset time.
type CacheEntry = { count: number; resetAt: number };
const cache = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 5000; // safeguard memory usage

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now > entry.resetAt) {
      cache.delete(key);
    }
  }
}

export async function checkRateLimit({ identifier, limit, windowMs }: RateLimitConfig): Promise<{ success: boolean; remaining: number; resetTime: Date }> {
  cleanup();
  const now = Date.now();
  let entry = cache.get(identifier);

  if (!entry) {
    entry = { count: 1, resetAt: now + windowMs };
    cache.set(identifier, entry);
    // Enforce max size
    if (cache.size > MAX_CACHE_SIZE) {
      // Remove the oldest entry (Map preserves insertion order)
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    return { success: true, remaining: limit - 1, resetTime: new Date(entry.resetAt) };
  }

  // If window elapsed, reset counter
  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + windowMs;
    cache.set(identifier, entry);
    return { success: true, remaining: limit - 1, resetTime: new Date(entry.resetAt) };
  }

  // Within window, enforce limit
  if (entry.count >= limit) {
    logger.warn({
      category: 'SYSTEM',
      message: 'Rate limit exceeded',
      metadata: { identifier, limit, resetTime: new Date(entry.resetAt) }
    });
    return { success: false, remaining: 0, resetTime: new Date(entry.resetAt) };
  }

  entry.count += 1;
  cache.set(identifier, entry);
  return { success: true, remaining: Math.max(0, limit - entry.count), resetTime: new Date(entry.resetAt) };
}
