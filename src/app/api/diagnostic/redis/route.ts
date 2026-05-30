import { NextResponse } from 'next/server';
import { redis } from '@/lib/db/redis';
import { incrementTelemetryCounter, getOperationalMetrics } from '@/lib/telemetry/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    isMock: !('incr' in redis),
    tests: {}
  };

  if (diagnostics.isMock) {
    diagnostics.status = 'Memory Fallback Mock Active';
    return NextResponse.json(diagnostics);
  }

  // 1. incr test
  try {
    const seq = await redis.incr('diagnostic:incr_test');
    diagnostics.tests.incr = seq > 0 ? 'SUCCESS' : 'FAIL';
  } catch(e: any) {
    diagnostics.tests.incr = `ERROR: ${e.message}`;
  }

  // 2. hincrby test
  try {
    await incrementTelemetryCounter('api500Errors');
    const metrics = await getOperationalMetrics();
    diagnostics.tests.hincrby = metrics['api500Errors'] ? 'SUCCESS' : 'FAIL';
  } catch(e: any) {
    diagnostics.tests.hincrby = `ERROR: ${e.message}`;
  }

  // 3. setex (JWT / Idempotency)
  try {
    await redis.setex('diagnostic:setex_test', 60, '1');
    const val = await redis.get('diagnostic:setex_test');
    diagnostics.tests.setex = val === '1' ? 'SUCCESS' : 'FAIL';
  } catch (e: any) {
    diagnostics.tests.setex = `ERROR: ${e.message}`;
  }

  // 4. idempotency native (set nx)
  try {
    const isNew = await redis.set('diagnostic:idempotency_test', '1', { nx: true, ex: 10 });
    diagnostics.tests.nx = isNew ? 'SUCCESS' : 'FAIL';
  } catch(e: any) {
    diagnostics.tests.nx = `ERROR: ${e.message}`;
  }

  diagnostics.status = 'Real Redis Active';
  return NextResponse.json(diagnostics);
}
