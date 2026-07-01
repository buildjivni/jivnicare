const { chromium, devices } = require("@playwright/test");
const path = require("path");

const baseUrl = "http://localhost:3000";
const outputDir = "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5";

async function capture(page, name, url, scrollBottom = false) {
  console.log(`📸 Navigating to ${url}...`);
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1000); // Allow hydration and dynamic rendering

    if (scrollBottom) {
      console.log("   Scrolling to bottom...");
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
    }

    const screenshotPath = path.join(outputDir, name);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`   Captured: ${name}`);
  } catch (err) {
    console.error(`🚨 Failed to capture ${name}: ${err.message}`);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const desktopPage = await context.newPage();
  await desktopPage.setViewportSize({ width: 1440, height: 900 });

  console.log("\n🖥️  CAPTURING DESKTOP SCREENSHOTS...");
  // 1. Header
  await capture(desktopPage, "desktop_header.png", baseUrl);
  // 2. Footer
  await capture(desktopPage, "desktop_footer.png", baseUrl, true);
  // 3. Loading Page
  await capture(desktopPage, "desktop_loading.png", `${baseUrl}/loading-preview`);

  console.log("\n📐 CAPTURING TABLET SCREENSHOTS...");
  const tabletPage = await browser.newPage({
    ...devices["iPad Pro 11"],
    deviceScaleFactor: 2
  });
  // 1. Header
  await capture(tabletPage, "tablet_header.png", baseUrl);
  // 2. Footer
  await capture(tabletPage, "tablet_footer.png", baseUrl, true);

  console.log("\n📱 CAPTURING MOBILE SCREENSHOTS...");
  const mobilePage = await browser.newPage({
    ...devices["iPhone 14"],
    deviceScaleFactor: 2
  });
  // 1. Header
  await capture(mobilePage, "mobile_header.png", baseUrl);
  // 2. Footer
  await capture(mobilePage, "mobile_footer.png", baseUrl, true);

  await browser.close();
  console.log("\n🎉 Verification screenshots captured successfully!");
}

main().catch(console.error);
