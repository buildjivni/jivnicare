// ============================================================================
// JivniCare Centralized Production Logger
// Provides structured JSON logging for Vercel consumption, improving
// observability for Auth, Booking, and API runtime exceptions.
// ============================================================================

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

interface LogPayload {
  category: 'AUTH' | 'BOOKING' | 'QUEUE' | 'OTP' | 'API_EXCEPTION' | 'SYSTEM';
  message: string;
  metadata?: Record<string, unknown>;
  error?: unknown;
}

const SENSITIVE_KEYS = /^(token|password|otp|firebaseidtoken|authorization|cookie|secret|privatekey|jwt)$/i;

function sanitizeMetadata(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.test(key)) {
      out[key] = "[redacted]";
    } else if (key === "phone" && typeof value === "string" && value.length >= 4) {
      out[key] = `***${value.slice(-4)}`;
    } else {
      out[key] = value;
    }
  }
  return out;
}

class AppLogger {
  private formatMessage(level: LogLevel, payload: LogPayload) {
    const timestamp = new Date().toISOString();
    const metadata = sanitizeMetadata(payload.metadata);

    const errorBlock = payload.error
      ? {
          error: {
            message:
              payload.error instanceof Error
                ? payload.error.message
                : String(payload.error),
            ...(process.env.NODE_ENV !== "production" &&
            payload.error instanceof Error
              ? { stack: payload.error.stack }
              : {}),
          },
        }
      : {};

    const logEntry = {
      timestamp,
      level,
      category: payload.category,
      message: payload.message,
      metadata,
      ...errorBlock,
    };

    if (process.env.NODE_ENV === 'production') {
      return JSON.stringify(logEntry);
    }
    
    const errStack =
      payload.error instanceof Error ? payload.error.stack : undefined;
    return `[${timestamp}] [${level}] [${payload.category}] ${payload.message} ${metadata ? JSON.stringify(metadata) : ""}${errStack ? "\n" + errStack : ""}`;
  }

  info(payload: LogPayload) {
    console.log(this.formatMessage('INFO', payload));
  }

  warn(payload: LogPayload) {
    console.warn(this.formatMessage('WARN', payload));
  }

  error(payload: LogPayload) {
    console.error(this.formatMessage('ERROR', payload));
  }

  critical(payload: LogPayload) {
    console.error(this.formatMessage('CRITICAL', payload));
    // Here you could also trigger an alert to Sentry/Slack in the future
  }
}

export const logger = new AppLogger();
