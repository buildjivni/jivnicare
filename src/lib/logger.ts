// ============================================================================
// JivniCare Centralized Production Logger
// Provides structured JSON logging for Vercel consumption, improving
// observability for Auth, Booking, and API runtime exceptions.
// ============================================================================

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

interface LogPayload {
  category: 'AUTH' | 'BOOKING' | 'QUEUE' | 'OTP' | 'API_EXCEPTION' | 'SYSTEM';
  message: string;
  metadata?: Record<string, any>;
  error?: any;
}

class AppLogger {
  private formatMessage(level: LogLevel, payload: LogPayload) {
    const timestamp = new Date().toISOString();
    
    // In production, we format as JSON so Vercel/Datadog can parse it easily
    const logEntry = {
      timestamp,
      level,
      category: payload.category,
      message: payload.message,
      metadata: payload.metadata,
      ...(payload.error && {
        error: {
          message: payload.error.message || String(payload.error),
          stack: payload.error.stack,
        }
      })
    };

    if (process.env.NODE_ENV === 'production') {
      return JSON.stringify(logEntry);
    }
    
    // Developer friendly formatting for local
    return `[${timestamp}] [${level}] [${payload.category}] ${payload.message} ${payload.metadata ? JSON.stringify(payload.metadata) : ''} ${payload.error ? '\n' + (payload.error.stack || payload.error) : ''}`;
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
