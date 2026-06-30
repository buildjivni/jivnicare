const { chromium } = require("@playwright/test");

async function run() {
  console.log("🧪 Running Hydration Flicker and Console Warn Test...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  page.on("console", (msg) => {
    const text = msg.text();
    const type = msg.type();
    consoleLogs.push({ type, text });
    console.log(`[BROWSER CONSOLE ${type.toUpperCase()}] ${text}`);
  });

  // Navigate to landing page
  await page.goto("http://localhost:3000");
  await page.waitForSelector("text=Current Location", { timeout: 10000 });
  await page.waitForTimeout(2000);

  // Change location to Deoghar
  console.log("👉 Changing location input to 'Deoghar'...");
  const input = page.locator('input[placeholder*="Jamui"], input[value="Jamui"], input[value="Deoghar"]').first();
  await input.focus();
  await input.fill("Deoghar");
  await input.press("Enter");
  await page.waitForTimeout(2000); // Allow localStorage state to save

  // Reload the page and read the value immediately
  console.log("🔄 Reloading the page...");
  await page.reload();

  // Read value immediately on DOMContentLoaded
  const initialValue = await page.evaluate(() => {
    const el = document.querySelector('input[placeholder*="Jamui"]');
    return el ? el.value : null;
  });
  console.log(`⏱ Initial input value immediately after reload: "${initialValue}"`);

  // Wait for page to fully stabilize
  await page.waitForTimeout(3000);

  const stabilizedValue = await page.evaluate(() => {
    const el = document.querySelector('input[placeholder*="Jamui"]');
    return el ? el.value : null;
  });
  console.log(`✅ Stabilized input value after hydration: "${stabilizedValue}"`);

  // Print any warnings/mismatch alerts
  const warnings = consoleLogs.filter(log => log.type === "warning" || log.text.toLowerCase().includes("mismatch") || log.text.toLowerCase().includes("hydration"));
  console.log(`📝 Filtered Hydration warnings count: ${warnings.length}`);
  console.log(JSON.stringify(warnings, null, 2));

  await browser.close();
}

run().catch(console.error);
