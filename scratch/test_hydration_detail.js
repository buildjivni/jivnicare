const { chromium } = require("@playwright/test");

async function run() {
  console.log("🧪 Running native hydration test...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", (msg) => {
    console.log(`[CONSOLE] [${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  await page.goto("http://localhost:3000");
  await page.waitForSelector("input", { timeout: 10000 });
  await page.waitForTimeout(1000);

  // Set location to Deoghar via native Playwright typing
  console.log("👉 Typing Deoghar in the Location Selector...");
  const input = page.locator('input[placeholder*="district"]').first();
  await input.click();
  await input.fill("Deoghar");
  await input.press("Enter");
  await page.waitForTimeout(2000);

  console.log("🔄 Reloading page...");
  await page.reload();

  // Read immediately
  const values = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll("input"));
    return inputs.map(i => ({
      placeholder: i.placeholder,
      value: i.value
    }));
  });
  console.log("Immediate input values after reload:", JSON.stringify(values, null, 2));

  await page.waitForTimeout(3000);

  const stabilizedValues = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll("input"));
    return inputs.map(i => ({
      placeholder: i.placeholder,
      value: i.value
    }));
  });
  console.log("Stabilized input values after hydration:", JSON.stringify(stabilizedValues, null, 2));

  await browser.close();
}

run().catch(console.error);
