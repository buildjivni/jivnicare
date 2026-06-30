const { chromium } = require("@playwright/test");

async function run() {
  console.log("🐞 Starting Browser Debug Flow...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", (msg) => {
    console.log(`[BROWSER CONSOLE ${msg.type().toUpperCase()}]:`, msg.text());
  });

  page.on("pageerror", (err) => {
    console.error("[BROWSER PAGE ERROR]:", err.message);
  });

  page.on("request", (req) => {
    console.log(`[REQUEST]: ${req.method()} ${req.url()}`);
  });

  page.on("response", (res) => {
    console.log(`[RESPONSE]: ${res.status()} ${res.url()}`);
  });

  console.log("🔗 Navigating to JivniCare landing page...");
  await page.goto("http://localhost:3000");
  await page.waitForTimeout(2000);

  console.log("👉 Clicking specialty chip: 'General Physician'...");
  await page.locator('button:has-text("General Physician")').first().click();
  
  console.log("⌛ Waiting 8 seconds for requests and rendering...");
  await page.waitForTimeout(8000);

  await browser.close();
  console.log("🐞 Debug Flow finished.");
}

run().catch(console.error);
