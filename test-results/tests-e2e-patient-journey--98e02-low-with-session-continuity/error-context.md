# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\patient-journey.spec.ts >> Patient journey: booking flow with session continuity
- Location: tests\e2e\patient-journey.spec.ts:4:5

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { getAuthToken } from './utils/auth';
  3  | 
  4  | test('Patient journey: booking flow with session continuity', async ({ page }) => {
  5  |   // 1. Landing page
> 6  |   await page.goto('/');
     |              ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  7  |   await expect(page).toHaveTitle(/JivniCare/);
  8  | 
  9  |   // 2. Search for doctor
  10 |   await page.fill('input[placeholder="Search doctors"]', 'Dr. Smith');
  11 |   await page.keyboard.press('Enter');
  12 |   await page.waitForSelector('text=Dr. Smith');
  13 | 
  14 |   // 3. Initiate OTP login (patient not logged in)
  15 |   await page.click('text=Book Appointment');
  16 |   await page.waitForSelector('text=Enter OTP');
  17 | 
  18 |   // 4. Simulate OTP retrieval (mocked via API)
  19 |   const otp = await page.evaluate(async () => {
  20 |     const res = await fetch('/api/auth/mock-otp?phone=+1234567890');
  21 |     const data = await res.json();
  22 |     return data.otp;
  23 |   });
  24 |   await page.fill('input[name="otp"]', otp);
  25 |   await page.click('text=Verify');
  26 | 
  27 |   // 5. Booking form
  28 |   await page.selectOption('select[name="date"]', '2024-01-01');
  29 |   await page.selectOption('select[name="time"]', '10:00');
  30 |   await page.click('text=Confirm Booking');
  31 |   await expect(page).toHaveURL(/booking\/confirmation/);
  32 | 
  33 |   // 6. Queue tracking page
  34 |   await page.waitForSelector('text=Your position in queue');
  35 |   const position = await page.textContent('.queue-position');
  36 |   expect(parseInt(position || '0')).toBeGreaterThan(0);
  37 | 
  38 |   // 7. Refresh and ensure state persists
  39 |   await page.reload();
  40 |   await expect(page).toHaveURL(/booking\/confirmation/);
  41 |   await expect(page.locator('.queue-position')).toHaveText(position);
  42 | 
  43 |   // 8. Cancel booking and verify cleanup
  44 |   await page.click('text=Cancel Booking');
  45 |   await expect(page).toHaveURL('/');
  46 |   // Verify counter increment on failure path (optional)
  47 | });
  48 | 
```