import { redis } from '@/lib/db/redis';

const TELEMETRY_KEY = 'jivnicare:operational_metrics';

export type OperationalMetricName = 
  | 'bookingFailures'
  | 'bookingSuccess'
  | 'bookingAbandons'
  | 'otpFailures'
  | 'authFailures'
  | 'uploadFailures'
  | 'queueReconnects'
  | 'sseDisconnects'
  | 'frontendCrashes'
  | 'api500Errors'
  | 'emergencyQueueInsertions'
  | 'emergencyQueueConflicts'
  | 'duplicateTokenAttempts'
  | 'queueConflicts'
  | 'walkInFailures'
  | 'queueRecoveryEvents';

/**
 * Atomically increments a lightweight operational counter.
 */
export async function incrementTelemetryCounter(metric: OperationalMetricName, incrementBy: number = 1): Promise<void> {
  try {
    if (!redis) {
      console.warn('Telemetry: Redis not configured');
      return;
    }
    await redis.hincrby(TELEMETRY_KEY, metric, incrementBy);
  } catch (error) {
    // Fail silently so telemetry never breaks the app
    console.error(`Telemetry failed to increment ${metric}:`, error);
  }
}

/**
 * Retrieves all operational metrics.
 */
export async function getOperationalMetrics(): Promise<Record<string, number>> {
  try {
    if (!redis) return {};
    const data = await redis.hgetall(TELEMETRY_KEY);
    return (data || {}) as Record<string, number>;
  } catch (error) {
    console.error('Telemetry failed to fetch metrics:', error);
    return {};
  }
}

/**
 * Logs sanitized operational errors to a rolling list.
 * STRICT POLICY: No PHI, no PII, no JWTs, no OTPs, no stack dumps.
 */
export async function logOperationalError(errorMetadata: {
  type: string;
  route: string;
  category: string;
  timestamp: string;
}): Promise<void> {
  try {
    if (!redis) return;
    
    // Store as JSON string in a capped list
    const logEntry = JSON.stringify({
      ...errorMetadata,
      // Strip anything outside the allowed keys just in case
      type: String(errorMetadata.type).slice(0, 100),
      route: String(errorMetadata.route).slice(0, 100),
      category: String(errorMetadata.category).slice(0, 50),
      timestamp: errorMetadata.timestamp,
    });
    
    // Push to list and trim to last 100 items to prevent bloat
    const ERROR_LIST_KEY = 'jivnicare:operational_errors';
    const pipeline = redis.pipeline();
    pipeline.lpush(ERROR_LIST_KEY, logEntry);
    pipeline.ltrim(ERROR_LIST_KEY, 0, 99);
    await pipeline.exec();
    
  } catch (e) {
    console.error('Telemetry failed to log error:', e);
  }
}
