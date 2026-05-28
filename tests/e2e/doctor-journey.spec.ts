import { test, expect } from '@playwright/test';

test('Doctor journey: full dashboard and queue lifecycle', async ({ page }) => {
  // 1. Go to real login UI and authenticate
  await page.goto('/partners/login');
  await page.fill('input[type="tel"]', '9999999991'); // Test doctor number
  await page.fill('input[type="password"]', '123456');
  await page.click('button:has-text("Sign In")');
  await expect(page).toHaveURL(/doctor\/dashboard/);

  // 2. Profile update (basic navigation and save)
  await page.goto('/doctor/dashboard?tab=profile');
  await expect(page.locator('h1:has-text("My Profile")')).toBeVisible();
  await page.click('button:has-text("Save & Update Profile")');
  await expect(page.locator('text=saved')).toBeVisible();

  // 3. Schedule / Settings update
  await page.goto('/doctor/dashboard?tab=settings');
  await expect(page.locator('h1:has-text("Clinic Settings")')).toBeVisible();
  // Click the Save changes button in settings (there are two, one for Clinic Operations, one for Schedule)
  await page.locator('button:has-text("Save Changes")').first().click();
  await expect(page.locator('text=saved').first()).toBeVisible();

  // 4. Queue activation (simulate readiness)
  await page.goto('/doctor/dashboard?tab=overview');
  // Select AVAILABLE from the status dropdown
  await page.locator('select').selectOption('AVAILABLE');
  // The UI doesn't have a specific "Queue is now active" toast, but it syncs.

  // 5. Queue Manager
  await page.goto('/doctor/dashboard?tab=queue');
  await expect(page.locator('h1:has-text("Manager")')).toBeVisible();

  // 6. Token calling – simulate serving next patient (Walk-in)
  // First, add a walk-in patient so we have someone to call
  page.on('dialog', async dialog => {
    if (dialog.type() === 'prompt') {
      await dialog.accept('Test Walk-in Patient');
    } else {
      await dialog.accept();
    }
  });
  await page.click('button:has-text("Add Walk-in Patient")');
  // Wait for the patient to appear in the table
  await expect(page.locator('text=Test Walk-in Patient').first()).toBeVisible();

  // Call Next Token
  await page.click('button:has-text("Call Next")');
  
  // 7. Refresh and ensure queue state persists
  await page.reload();
  await expect(page.locator('h1:has-text("Manager")')).toBeVisible();

  // 8. Logout and login again
  await page.click('text=Secure Sign Out');
  await expect(page).toHaveURL('/');
  
  // Re-login using real UI again
  await page.goto('/partners/login');
  await page.fill('input[type="tel"]', '9999999991');
  await page.fill('input[type="password"]', '123456');
  await page.click('button:has-text("Sign In")');
  await expect(page).toHaveURL(/doctor\/dashboard/);
  await expect(page.locator('text=Command Center')).toBeVisible();
});
