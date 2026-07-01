const { chromium, devices } = require("@playwright/test");
const path = require("path");

const baseUrl = "http://localhost:3000";
const outputDir = "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5";

async function capture(page, name, url, scrollBottom = false) {
  console.log(`📸 Navigating to ${url}...`);
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000); // Allow hydration and dynamic rendering

  if (scrollBottom) {
    console.log("   Scrolling to bottom...");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
  }

  const screenshotPath = path.join(outputDir, name);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`   Captured: ${name}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // Listen to browser console and page errors
  context.on("page", page => {
    page.on("console", msg => {
      if (msg.type() === "error") {
        console.log(`🚨 BROWSER_CONSOLE_ERROR: ${msg.text()}`);
      }
    });
    page.on("pageerror", err => {
      console.log(`🚨 BROWSER_PAGE_ERROR: ${err.message}`);
    });
  });

  const desktopPage = await context.newPage();
  await desktopPage.setViewportSize({ width: 1440, height: 900 });

  console.log("\n🖥️  CAPTURING DESKTOP SCREENSHOTS...");
  // 1. Landing Page (Full View at top)
  await capture(desktopPage, "desktop_landing.png", baseUrl);
  // 2. Header
  await capture(desktopPage, "desktop_header.png", baseUrl);
  // 3. Footer
  await capture(desktopPage, "desktop_footer.png", baseUrl, true);
  // 4. Login Page
  await capture(desktopPage, "desktop_login.png", `${baseUrl}/login`);

  console.log("\n📱 CAPTURING MOBILE SCREENSHOTS...");
  const mobilePage = await browser.newPage({
    ...devices["iPhone 14"],
    deviceScaleFactor: 2
  });

  // 1. Landing Page
  await capture(mobilePage, "mobile_landing.png", baseUrl);
  // 2. Header
  await capture(mobilePage, "mobile_header.png", baseUrl);
  // 3. Footer
  await capture(mobilePage, "mobile_footer.png", baseUrl, true);
  // 4. Login Page
  await capture(mobilePage, "mobile_login.png", `${baseUrl}/login`);

  await browser.close();
  console.log("\n🎉 Verification screenshots captured successfully!");
}

main().catch(console.error);
