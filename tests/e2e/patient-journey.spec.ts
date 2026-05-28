import { test, expect } from '@playwright/test';

test('Patient journey: booking flow with session continuity', async ({ page }) => {
  // 1. Landing page
  await page.goto('/');
  await expect(page).toHaveTitle(/JivniCare/);

  // 2. Search for doctor
  await page.fill('input[placeholder="Search doctors, symptoms..."]', 'Dr. Sanctuary');
  await page.keyboard.press('Enter');
  await page.waitForSelector('text=Dr. Sanctuary');

  // 3. Go to doctor profile
  await page.click('button:has-text("Book Clinic Visit")');
  await page.waitForURL(/\/doctors\/.+/);

  // 4. Initiate OTP login (patient not logged in)
  await page.click('button:has-text("Book Appointment")');
  await page.waitForURL(/\/login/);

  // 4. Submit real test OTP directly
  await page.fill('input[type="tel"]', '9999999999');
  await page.click('button:has-text("Send Secure OTP")');
  await page.waitForSelector('text=Verify OTP');
  await page.fill('input[type="text"]', '123456'); // The OTP input is usually text or number
  await page.click('button:has-text("Verify & Log In")');
  
  // Wait for either Checkout or Complete Profile
  const result = await Promise.race([
    page.waitForURL(/\/checkout/).then(() => 'checkout'),
    page.waitForSelector('text=Complete Your Profile').then(() => 'profile')
  ]);

  if (result === 'profile') {
    await page.fill('input[placeholder="Your Name"]', 'John Doe');
    await page.fill('input[placeholder="e.g. Patna or Your Village"]', 'Patna Central');
    await page.click('button:has-text("Continue")');
    await page.waitForURL(/\/checkout/);
  }

  // 5. Booking form
  await page.fill('input[placeholder="Patient\'s full name"]', 'John Doe');
  await page.fill('input[type="tel"]', '9999999999');
  await page.fill('input[placeholder="e.g. Patna, Kankarbagh, or your Village name"]', 'Patna Central');
  await page.click('button:has-text("Confirm & Join Queue")');
  await expect(page).toHaveURL(/\/confirmation/);

  // 6. Queue tracking page
  await page.waitForSelector('text=Your position in queue');
  const position = (await page.textContent('.queue-position')) || '';
  expect(parseInt(position || '0')).toBeGreaterThan(0);

  // 7. Refresh and ensure state persists
  await page.reload();
  await expect(page).toHaveURL(/\/confirmation/);
  await expect(page.locator('.queue-position')).toHaveText(position);

  // 8. Cancel booking and verify cleanup
  await page.click('text=Cancel Booking');
  await expect(page).toHaveURL('/');
  // Verify counter increment on failure path (optional)
});
