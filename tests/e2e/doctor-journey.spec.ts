import { test, expect } from '@playwright/test';
import { getAuthToken } from '../utils/auth';

test('Doctor journey: full dashboard and queue lifecycle', async ({ page }) => {
  // 1. Obtain a doctor JWT via test helper (no real login UI)
  const doctorToken = await getAuthToken('doctor');
  // Set auth cookie (assuming JWT in `auth-token` cookie)
  await page.context().addCookies([
    { name: 'auth-token', value: doctorToken, domain: 'localhost', path: '/' }
  ]);

  // 2. Go to doctor dashboard
  await page.goto('/doctor/dashboard');
  await expect(page.locator('text=Doctor Dashboard')).toBeVisible();

  // 3. Profile update (e.g., name change)
  await page.fill('input[name="displayName"]', 'Dr. Test');
  await page.click('text=Save Profile');
  await expect(page.locator('text=Profile updated')).toBeVisible();

  // 4. Clinic image upload (mock file)
  const filePath = 'tests/e2e/fixtures/clinic.png';
  await page.setInputFiles('input[type="file"][name="clinicImage"]', filePath);
  await page.click('text=Upload Image');
  await expect(page.locator('text=Image uploaded')).toBeVisible();

  // 5. Schedule update
  await page.click('text=Edit Schedule');
  await page.fill('input[name="availableFrom"]', '09:00');
  await page.fill('input[name="availableTo"]', '17:00');
  await page.click('text=Save Schedule');
  await expect(page.locator('text=Schedule saved')).toBeVisible();

  // 6. Activate queue (simulate readiness)
  await page.click('text=Activate Queue');
  await expect(page.locator('text=Queue is now active')).toBeVisible();

  // 7. Token calling – simulate serving next patient
  await page.click('text=Call Next Token');
  const tokenText = await page.textContent('.current-token');
  expect(tokenText).toMatch(/\d+/); // token should be numeric

  // 8. Emergency token insertion
  await page.click('text=Insert Emergency Token');
  await expect(page.locator('.emergency-token')).toBeVisible();

  // 9. Refresh and ensure queue state persists
  await page.reload();
  await expect(page.locator('text=Queue is now active')).toBeVisible();
  await expect(page.locator('.current-token')).toHaveText(tokenText);

  // 10. Simulate reconnect (close and reopen context)
  const context = await page.context().close();
  const newContext = await page.browser().newContext();
  const newPage = await newContext.newPage();
  await newPage.context().addCookies([
    { name: 'auth-token', value: doctorToken, domain: 'localhost', path: '/' }
  ]);
  await newPage.goto('/doctor/dashboard');
  await expect(newPage.locator('text=Queue is now active')).toBeVisible();
  // Ensure no duplicate token issue after reconnect
  await newPage.click('text=Call Next Token');
  const newToken = await newPage.textContent('.current-token');
  expect(newToken).not.toBe(tokenText);

  // 11. Logout and login again
  await newPage.click('text=Logout');
  await expect(newPage).toHaveURL('/');
  // Re-login using helper again
  const newDoctorToken = await getAuthToken('doctor');
  await newPage.context().addCookies([
    { name: 'auth-token', value: newDoctorToken, domain: 'localhost', path: '/' }
  ]);
  await newPage.goto('/doctor/dashboard');
  await expect(newPage.locator('text=Doctor Dashboard')).toBeVisible();
});
