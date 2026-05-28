export type TelemetryEventName = 
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
  | 'emergencyQueueInsertions';

export interface TelemetryEvent {
  metric: TelemetryEventName;
  incrementBy?: number;
  metadata?: {
    type?: string;
    route?: string;
    category?: string;
  };
}

/**
 * Sends a lightweight operational telemetry event to the backend.
 * Uses navigator.sendBeacon if available for async, non-blocking delivery,
 * falling back to fetch with keepalive.
 */
export function trackOperationalEvent(event: TelemetryEvent) {
  try {
    if (typeof window === 'undefined') return;

    const payload = JSON.stringify({
      metric: event.metric,
      incrementBy: event.incrementBy || 1,
      metadata: event.metadata,
      timestamp: new Date().toISOString()
    });

    // Prefer sendBeacon for page unloads (Booking Abandons)
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      // We don't await sendBeacon
      navigator.sendBeacon('/api/telemetry', blob);
    } else {
      // Fallback for older browsers
      fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true, // Ensures request completes even if page unloads
      }).catch(() => {
        // Silent catch to prevent console noise
      });
    }
  } catch (e) {
    // Fail silently - telemetry must never break the app
  }
}
