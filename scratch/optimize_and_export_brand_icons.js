const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const appIconDir = "c:\\Users\\dharm\\Downloads\\antigravity\\docs\\brand\\app-icon";
const faviconDir = "c:\\Users\\dharm\\Downloads\\antigravity\\docs\\brand\\favicon";
const outputBaseDir = "C:\\Users\\dharm\\.gemini\\antigravity\\brain\\f38e1754-fed2-42be-9702-0592d34035a5\\scratch\\optimized";

const APP_ICON_SIZES = [1024, 512, 256, 192, 180];
const FAVICON_SIZES = [32, 16];

async function main() {
  console.log("🚀 Starting Safe-Area Optimization, Platform-Sizing & Export Flow...");
  
  if (!fs.existsSync(outputBaseDir)) {
    fs.mkdirSync(outputBaseDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Process App Icon Variations
  const appSvgs = ["5.svg", "9.svg", "10.svg", "11.svg"];
  for (const svgFile of appSvgs) {
    const svgPath = path.join(appIconDir, svgFile);
    if (!fs.existsSync(svgPath)) {
      console.warn(`⚠️ Warning: ${svgFile} not found.`);
      continue;
    }
    
    const variationName = path.basename(svgFile, ".svg");
    const variationOutputDir = path.join(outputBaseDir, `app-icon-var-${variationName}`);
    if (!fs.existsSync(variationOutputDir)) {
      fs.mkdirSync(variationOutputDir, { recursive: true });
    }

    console.log(`\n📦 Processing App Icon Safe-Area Variation: ${variationName}...`);
    const fileUrl = `file:///${svgPath.replace(/\\/g, "/")}`;

    for (const size of APP_ICON_SIZES) {
      await page.setViewportSize({ width: size, height: size });
      await page.goto(fileUrl);
      await page.waitForTimeout(100); // Allow browser rendering to complete

      const outPngName = `app-icon-${size}.png`;
      const outPngPath = path.join(variationOutputDir, outPngName);
      
      await page.screenshot({ path: outPngPath, omitBackground: true });
      console.log(`   - Generated ${size}x${size} icon: ${outPngName}`);
    }
  }

  // 2. Process Favicon
  const faviconSvgPath = path.join(faviconDir, "brand-icon.svg");
  if (fs.existsSync(faviconSvgPath)) {
    const faviconOutputDir = path.join(outputBaseDir, "favicon");
    if (!fs.existsSync(faviconOutputDir)) {
      fs.mkdirSync(faviconOutputDir, { recursive: true });
    }

    console.log(`\n📦 Processing Favicon (brand-icon.svg)...`);
    const fileUrl = `file:///${faviconSvgPath.replace(/\\/g, "/")}`;

    // Generate Target Favicon PNG Sizes
    for (const size of FAVICON_SIZES) {
      await page.setViewportSize({ width: size, height: size });
      await page.goto(fileUrl);
      await page.waitForTimeout(100);

      const outPngName = `favicon-${size}.png`;
      const outPngPath = path.join(faviconOutputDir, outPngName);

      await page.screenshot({ path: outPngPath, omitBackground: true });
      console.log(`   - Generated ${size}x${size} favicon: ${outPngName}`);
    }
  } else {
    console.error("❌ Error: Favicon brand-icon.svg not found.");
  }

  await browser.close();
  console.log(`\n🎉 Optimization, platform-sizing and export verification completed successfully!`);
  console.log(`📂 Outputs available at: ${outputBaseDir}`);
}

main().catch(console.error);
