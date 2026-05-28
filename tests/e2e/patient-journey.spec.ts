import { test, expect } from '@playwright/test';
import { getAuthToken } from './utils/auth';

test('Patient journey: booking flow with session continuity', async ({ page }) => {
  // 1. Landing page
  await page.goto('/');
  await expect(page).toHaveTitle(/JivniCare/);

  // 2. Search for doctor
  await page.fill('input[placeholder="Search doctors"]', 'Dr. Smith');
  await page.keyboard.press('Enter');
  await page.waitForSelector('text=Dr. Smith');

  // 3. Initiate OTP login (patient not logged in)
  await page.click('text=Book Appointment');
  await page.waitForSelector('text=Enter OTP');

  // 4. Simulate OTP retrieval (mocked via API)
  const otp = await page.evaluate(async () => {
    const res = await fetch('/api/auth/mock-otp?phone=+1234567890');
    const data = await res.json();
    return data.otp;
  });
  await page.fill('input[name="otp"]', otp);
  await page.click('text=Verify');

  // 5. Booking form
  await page.selectOption('select[name="date"]', '2024-01-01');
  await page.selectOption('select[name="time"]', '10:00');
  await page.click('text=Confirm Booking');
  await expect(page).toHaveURL(/booking\/confirmation/);

  // 6. Queue tracking page
  await page.waitForSelector('text=Your position in queue');
  const position = await page.textContent('.queue-position');
  expect(parseInt(position || '0')).toBeGreaterThan(0);

  // 7. Refresh and ensure state persists
  await page.reload();
  await expect(page).toHaveURL(/booking\/confirmation/);
  await expect(page.locator('.queue-position')).toHaveText(position);

  // 8. Cancel booking and verify cleanup
  await page.click('text=Cancel Booking');
  await expect(page).toHaveURL('/');
  // Verify counter increment on failure path (optional)
});
