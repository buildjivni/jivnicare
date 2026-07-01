const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const appIconDir = "c:\\Users\\dharm\\Downloads\\antigravity\\docs\\brand\\app-icon";
const faviconDir = "c:\\Users\\dharm\\Downloads\\antigravity\\docs\\brand\\favicon";
const scratchDir = "C:\\Users\\dharm\\.gemini\\antigravity\\brain\\f38e1754-fed2-42be-9702-0592d34035a5\\scratch";

async function main() {
  console.log("🚀 Launching Chromium to render SVG previews...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Inspect and render each SVG in app-icon
  const appFiles = fs.readdirSync(appIconDir).filter(f => f.endsWith(".svg"));
  for (const file of appFiles) {
    const filePath = path.join(appIconDir, file);
    const fileUrl = `file:///${filePath.replace(/\\/g, "/")}`;
    console.log(`🌐 Opening SVG: ${file}`);
    
    await page.setViewportSize({ width: 1024, height: 1024 });
    await page.goto(fileUrl);
    await page.waitForTimeout(500); // Let it render
    
    const outPath = path.join(scratchDir, `preview-${path.basename(file, ".svg")}.png`);
    await page.screenshot({ path: outPath, omitBackground: true });
    console.log(`📸 Rendered: preview-${path.basename(file, ".svg")}.png`);
  }

  // Inspect and render favicon SVG
  const faviconFiles = fs.readdirSync(faviconDir).filter(f => f.endsWith(".svg"));
  for (const file of faviconFiles) {
    const filePath = path.join(faviconDir, file);
    const fileUrl = `file:///${filePath.replace(/\\/g, "/")}`;
    console.log(`🌐 Opening SVG: ${file}`);
    
    await page.setViewportSize({ width: 1024, height: 1024 });
    await page.goto(fileUrl);
    await page.waitForTimeout(500); // Let it render
    
    const outPath = path.join(scratchDir, `preview-favicon-${path.basename(file, ".svg")}.png`);
    await page.screenshot({ path: outPath, omitBackground: true });
    console.log(`📸 Rendered: preview-favicon-${path.basename(file, ".svg")}.png`);
  }

  await browser.close();
  console.log("🎉 SVG rendering completed!");
}

main().catch(console.error);
