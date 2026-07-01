const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const svgPath = "c:/Users/dharm/Downloads/antigravity/docs/brand/app-icon/app-icon-master.svg";
const outputPath = "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5/app-icon-master-preview.png";

async function main() {
  console.log("Rendering app-icon-master.svg at 1024x1024...");
  
  if (!fs.existsSync(svgPath)) {
    throw new Error(`SVG file not found at ${svgPath}`);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1024, height: 1024 });
  const fileUrl = `file:///${svgPath}`;
  await page.goto(fileUrl);
  await page.waitForTimeout(500); // Allow browser rendering to complete

  await page.screenshot({ path: outputPath, omitBackground: false });
  console.log(`Successfully rendered 1024x1024 PNG to: ${outputPath}`);

  await browser.close();
}

main().catch(console.error);
