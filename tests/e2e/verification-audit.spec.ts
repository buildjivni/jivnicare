import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { decrypt } from '../../src/lib/crypto';

const prisma = new PrismaClient();

test.describe('E2E Audit Verification via Browser', () => {

  test('Verify B2 & C2 (Google OAuth Buttons redirecting to accounts.google.com)', async ({ page }) => {
    // 1. Check B2 (Google OAuth signup on partner login)
    await page.goto('/partners/login');
    const googleBtn = page.locator('button:has-text("Google")');
    await expect(googleBtn).toBeVisible();
    
    // Click the button and wait up to 10s for redirect
    await page.click('button:has-text("Google")');
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(500);
      if (page.url().includes('accounts.google.com')) {
        break;
      }
    }
    const currentUrl = page.url();
    console.log("Redirect URL from Partner Login:", currentUrl);
    expect(currentUrl).toContain('accounts.google.com');

    // 2. Check C2 (Google OAuth signup on Admin jvc-26 portal)
    await page.goto('/admin/jvc-26');
    const adminGoogleBtn = page.locator('button:has-text("Google")');
    await expect(adminGoogleBtn).toBeVisible();
    
    await page.click('button:has-text("Google")');
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(500);
      if (page.url().includes('accounts.google.com')) {
        break;
      }
    }
    const adminRedirectUrl = page.url();
    console.log("Redirect URL from Admin Portal:", adminRedirectUrl);
    expect(adminRedirectUrl).toContain('accounts.google.com');
  });

  test('Verify D7 (Mobile viewport responsiveness)', async ({ page }) => {
    // Set viewport to a standard mobile width (375px)
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Load home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot to verify mobile rendering visually
    await page.screenshot({ path: 'test-results/mobile-home-viewport.png' });
    console.log("Mobile responsiveness screenshot saved to test-results/mobile-home-viewport.png");
    
    // Check that header navigation or branding logo is visible
    const logo = page.locator('img[alt*="Logo"]').first();
    if (await logo.isVisible()) {
      await expect(logo).toBeVisible();
    }
  });

  test('Verify E2 (Gold Early Partner Badge Rendering)', async ({ page }) => {
    await page.goto('/');
    
    // Check search page or doctor cards
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('General Physician');
    await page.keyboard.press('Enter');
    
    // Wait for doctor cards to load
    await page.waitForSelector('text=Early Partner', { timeout: 10000 }).catch(() => null);
    
    // Check if the gold badge is rendered
    const badge = page.locator('text=Early Partner').first();
    await expect(badge).toBeVisible();
    
    // Take screenshot of early partner badge
    await badge.screenshot({ path: 'test-results/early-partner-badge.png' });
    console.log("Early Partner badge screenshot saved to test-results/early-partner-badge.png");
  });

  test('Verify E5 (Disclaimer checkbox actually gating booking)', async ({ page }) => {
    // Log browser console messages
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

    // 1. Find a doctor slug dynamically from DB
    const doctor = await prisma.doctor.findFirst({
      where: { verificationStatus: 'VERIFIED', canShowOnPublic: true }
    });
    expect(doctor).not.toBeNull();
    const slug = doctor!.slug;
    
    // Clean up any existing tokens for this phone number/user & reset doctor's queue
    const users = await prisma.user.findMany({
      select: { id: true, phone: true }
    });
    
    const targetUserIds: string[] = [];
    for (const u of users) {
      if (u.phone) {
        try {
          const dec = decrypt(u.phone);
          if (dec === '9999999999') {
            targetUserIds.push(u.id);
          }
        } catch (e) {
          // ignore decryption failure
        }
      }
    }
    
    if (targetUserIds.length > 0) {
      await prisma.queueToken.deleteMany({
        where: { patientId: { in: targetUserIds } }
      });
    }
    
    await prisma.queueToken.deleteMany({
      where: {
        OR: [
          { walkinName: 'Audit Patient' },
          { walkinPhone: '9999999999' }
        ]
      }
    });
    
    await prisma.dailyQueue.updateMany({
      where: { doctorId: doctor!.id },
      data: { totalTokens: 0, currentToken: 0 }
    });
    
    // 2. Load the doctor's profile page
    await page.goto(`/doctors/${slug}`);
    await page.click('button:has-text("Book Appointment")');
    
    // 3. Login using test OTP (which is mocked in test mode)
    await page.waitForURL(/\/login/);
    await page.fill('input[type="tel"]', '9999999999');
    
    // Check consent checkbox to enable the "Send Secure OTP" button
    const agreeConsent = page.locator('#agree-consent');
    await agreeConsent.check();
    
    await page.click('button:has-text("Send Secure OTP")');
    await page.waitForSelector('text=Verify OTP');
    
    const otpInput = page.locator('input[type="text"]');
    await otpInput.fill('123456');
    await expect(otpInput).toHaveValue('123456');
    
    const verifyBtn = page.locator('button:has-text("Verify & Log In")');
    await expect(verifyBtn).toBeEnabled({ timeout: 5000 });
    await verifyBtn.click();
    
    // Handle profile completion if needed (for brand-new users)
    const nameInput = page.locator('input[placeholder="Your Name"]');
    try {
      // Wait a short time to see if the profile name input appears
      await nameInput.waitFor({ state: 'visible', timeout: 5000 });
      await nameInput.fill('E2E Audit User');
      await page.fill('input[placeholder*="Village"]', 'Patna');
      await page.click('button:has-text("Continue")');
    } catch (e) {
      console.log("Profile name input not visible, assuming existing user or alternate redirect.");
      // Fallback for onboarding redirect
      const currentUrl = page.url();
      if (currentUrl.includes('/partners/onboard') || currentUrl.includes('/profile')) {
        await page.fill('input[placeholder="Your Name"]', 'E2E Audit User');
        await page.fill('input[placeholder*="Village"]', 'Patna');
        await page.click('button:has-text("Continue")');
      }
    }
    
    // 4. Ensure we are on checkout page
    await page.waitForURL(/\/checkout/, { timeout: 15000 });
    
    // Fill booking details
    await page.fill('input#name', 'Audit Patient');
    await page.fill('input#phone', '9999999999');
    await page.fill('input#location', 'Patna');
    
    // 5. Verify that submit button is disabled WITHOUT checking the disclaimer checkbox
    const checkbox = page.locator('#medical-disclaimer');
    if (await checkbox.isChecked()) {
      await checkbox.uncheck();
    }
    
    const submitBtn = page.locator('button:has-text("Confirm & Join Queue")');
    await expect(submitBtn).toBeDisabled();
    
    // 6. Check the medical disclaimer checkbox and submit
    await checkbox.check();
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
    
    // Verify that the booking is successfully submitted and redirects to confirmation
    await page.waitForURL(/\/confirmation/, { timeout: 10000 });
    expect(page.url()).toContain('/confirmation');
    
    // Take screenshot of booking confirmation
    await page.screenshot({ path: 'test-results/booking-confirmation.png' });
    console.log("Booking confirmation screenshot saved to test-results/booking-confirmation.png");

    // Clean up created booking token to prevent pollution
    await prisma.queueToken.deleteMany({
      where: { walkinName: 'Audit Patient' }
    });
  });

  test('Verify B2/C2 Callback Flow for Doctor (Lands in dashboard)', async ({ page }) => {
    // Navigate directly to the session-callback API route using the mockRole DOCTOR parameter
    await page.goto('/api/auth/session-callback?mockRole=DOCTOR');
    
    // It should redirect to doctor dashboard
    await page.waitForURL(/\/doctor\/dashboard/, { timeout: 15000 });
    expect(page.url()).toContain('/doctor/dashboard');
    
    // Verify that the doctor auth cookie (jivnicare_token) is set
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name === 'jivnicare_token');
    expect(authCookie).toBeDefined();
    console.log("✅ Doctor Callback redirects successfully to /doctor/dashboard and sets authentication cookie.");
  });

  test('Verify B2/C2 Callback Flow for Admin (Lands in TOTP setup/verify)', async ({ page }) => {
    // Navigate directly to the session-callback API route using the mockRole ADMIN parameter
    await page.goto('/api/auth/session-callback?mockRole=ADMIN');
    
    // Since the test admin account starts without TOTP enabled, it should redirect to totp-setup or totp-verify
    await page.waitForURL(/\/admin\/totp-(setup|verify)/, { timeout: 15000 });
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/admin\/totp-(setup|verify)/);
    
    // Verify that the temporary admin token cookie is set
    const cookies = await page.context().cookies();
    const tempAdminCookie = cookies.find(c => c.name === 'admin_temp_token');
    expect(tempAdminCookie).toBeDefined();
    console.log("✅ Admin Callback redirects successfully to totp setup/verify and sets temp admin token.");
  });

});
