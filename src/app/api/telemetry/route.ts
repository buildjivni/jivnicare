import { NextResponse } from 'next/server';
import { incrementTelemetryCounter, logOperationalError, OperationalMetricName } from '@/lib/telemetry/redis';

const ALLOWED_METRICS: Set<OperationalMetricName> = new Set([
  'bookingFailures',
  'bookingSuccess',
  'bookingAbandons',
  'otpFailures',
  'authFailures',
  'uploadFailures',
  'queueReconnects',
  'sseDisconnects',
  'frontendCrashes',
  'api500Errors',
  'emergencyQueueInsertions'
]);

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.metric || !ALLOWED_METRICS.has(data.metric as OperationalMetricName)) {
      return NextResponse.json({ error: 'Invalid metric' }, { status: 400 });
    }

    const metric = data.metric as OperationalMetricName;
    const incrementBy = typeof data.incrementBy === 'number' ? Math.min(data.incrementBy, 10) : 1; // Cap at 10 to prevent abuse
    
    // 1. Increment the counter
    await incrementTelemetryCounter(metric, incrementBy);

    // 2. If it's a critical error/crash, log the minimal metadata
    if (
      metric === 'frontendCrashes' || 
      metric === 'api500Errors' || 
      metric === 'bookingFailures' ||
      metric === 'uploadFailures'
    ) {
      const metadata = data.metadata || {};
      await logOperationalError({
        type: String(metadata.type || metric),
        route: String(metadata.route || 'unknown'),
        category: String(metadata.category || 'general'),
        timestamp: data.timestamp || new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Fail silently from the client's perspective
    console.error('Telemetry API Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
