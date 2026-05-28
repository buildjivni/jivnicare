import { test, expect } from '@playwright/test';

test.describe('Navigation & Session Recovery', () => {

  test('Doctor Session Recovery and Refresh Survival', async ({ page, context }) => {
    // 1. Establish session via real login UI
    await page.goto('/partners/login');
    await page.fill('input[type="tel"]', '9999999991');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/doctor\/dashboard/);

    // 2. Access dashboard
    await page.goto('/doctor/dashboard');
    await expect(page.locator('text=Partner Portal')).toBeVisible();

    // 3. Refresh survival (stale-tab / reload)
    await page.reload();
    await expect(page.locator('text=Doctor Dashboard')).toBeVisible();

    // 4. Browser back simulation
    await page.goto('/doctor/profile');
    await expect(page.locator('text=Profile')).toBeVisible();
    await page.goBack();
    await expect(page.locator('text=Doctor Dashboard')).toBeVisible();

    // 5. Multi-tab recovery (open new tab)
    const newPage = await context.newPage();
    await newPage.goto('/doctor/dashboard');
    await expect(newPage.locator('text=Doctor Dashboard')).toBeVisible();
    
    // 6. Session Expiry Recovery
    // Simulate token expiry by removing cookie
    await context.clearCookies();
    await newPage.reload();
    // Should be deterministically redirected to login (prevent auth loops)
    await expect(newPage).toHaveURL(/\/login|\/$/);
  });

  test('Patient Booking Refresh & Back Recovery', async ({ page }) => {
    // 1. Start booking flow
    await page.goto('/doctors/dr-sanctuary'); // assuming a deterministic seeded doctor slug
    
    // 2. Open booking modal/page
    await page.click('button:has-text("Book Appointment")');
    await page.waitForURL(/\/login/); // Auth barrier
    
    // 3. Refresh during booking auth flow
    await page.reload();
    // State should not enter weird auth loops, should still prompt for booking or be cleanly back
    await expect(page.locator('button:has-text("Send Secure OTP")')).toBeVisible();

    // 4. Back navigation recovery
    await page.goto('/districts/patna');
    await expect(page.locator('text=Doctors & Hospitals in Patna')).toBeVisible();
    await page.goBack();
    // Should survive browser back without duplicate submission states
    await expect(page.locator('button:has-text("Send Secure OTP")')).toBeVisible();
  });

});
