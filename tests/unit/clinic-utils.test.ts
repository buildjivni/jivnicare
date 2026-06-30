import { describe, it } from 'node:test';
import assert from 'node:assert';
import { resolveClinicLogicalDay } from '../../src/lib/utils/clinic-utils';

describe('resolveClinicLogicalDay Timezone Rollover Boundaries', () => {
  it('Should return same calendar date when time is after 04:00 AM IST', () => {
    // 10:30 AM IST on June 26, 2026 -> 05:00 AM UTC
    const dateAfterRollover = new Date(Date.UTC(2026, 5, 26, 5, 0, 0));
    const result = resolveClinicLogicalDay(dateAfterRollover);
    
    assert.strictEqual(result.getUTCFullYear(), 2026);
    assert.strictEqual(result.getUTCMonth(), 5);
    assert.strictEqual(result.getUTCDate(), 26);
    assert.strictEqual(result.toISOString(), '2026-06-26T00:00:00.000Z');
  });

  it('Should return previous calendar date when time is before 04:00 AM IST', () => {
    // 02:30 AM IST on June 26, 2026 -> 09:00 PM UTC on June 25
    const dateBeforeRollover = new Date(Date.UTC(2026, 5, 25, 21, 0, 0));
    const result = resolveClinicLogicalDay(dateBeforeRollover);
    
    assert.strictEqual(result.getUTCFullYear(), 2026);
    assert.strictEqual(result.getUTCMonth(), 5);
    assert.strictEqual(result.getUTCDate(), 25);
    assert.strictEqual(result.toISOString(), '2026-06-25T00:00:00.000Z');
  });

  it('Should handle exact 04:00 AM IST boundary (Rolled over to current day)', () => {
    // 04:00 AM IST on June 26, 2026 -> 10:30 PM UTC on June 25
    const exactRolloverTime = new Date(Date.UTC(2026, 5, 25, 22, 30, 0));
    const result = resolveClinicLogicalDay(exactRolloverTime);
    
    assert.strictEqual(result.toISOString(), '2026-06-26T00:00:00.000Z');
  });

  it('Should handle exact 03:59:59 AM IST boundary (Previous day)', () => {
    // 03:59:59 AM IST on June 26, 2026 -> 10:29:59 PM UTC on June 25
    const justBeforeRollover = new Date(Date.UTC(2026, 5, 25, 22, 29, 59));
    const result = resolveClinicLogicalDay(justBeforeRollover);
    
    assert.strictEqual(result.toISOString(), '2026-06-25T00:00:00.000Z');
  });
});
