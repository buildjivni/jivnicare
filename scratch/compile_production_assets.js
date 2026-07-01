const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const srcBaseDir = 'c:/Users/dharm/Downloads/antigravity/docs/brand';
const destBaseDir = 'c:/Users/dharm/Downloads/antigravity/public/brand';

const svgFilesToCopy = [
  { src: 'primary-logo/primary logo.svg', dest: 'primary-logo.svg' },
  { src: 'primary-logo/primary logo white.svg', dest: 'primary-logo-white.svg' },
  { src: 'primary-logo/primary logo black.svg', dest: 'primary-logo-black.svg' },
  { src: 'primary-logo/primary-logo -vertical.svg', dest: 'primary-logo-vertical.svg' },
  { src: 'brand-icon/brand-icon.svg', dest: 'brand-icon.svg' },
  { src: 'monochrome/brand-icon-white.svg', dest: 'brand-icon-white.svg' },
  { src: 'monochrome/brand-icon-black.svg', dest: 'brand-icon-black.svg' },
  { src: 'wordmark/JivniCare wordmark.svg', dest: 'wordmark.svg' },
  { src: 'favicon/favicon.svg', dest: 'favicon.svg' },
  { src: 'app-icon/app-icon-master.svg', dest: 'app-icon-master.svg' }
];

const appIconSizes = [1024, 512, 256, 192, 180];
const faviconSizes = [32, 16];

async function main() {
  console.log('📁 Creating public/brand directory...');
  if (!fs.existsSync(destBaseDir)) {
    fs.mkdirSync(destBaseDir, { recursive: true });
  }

  console.log('🚀 Copying SVG assets...');
  for (const item of svgFilesToCopy) {
    const srcPath = path.join(srcBaseDir, item.src);
    const destPath = path.join(destBaseDir, item.dest);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`   - Copied: ${item.src} -> public/brand/${item.dest}`);
    } else {
      console.error(`❌ Error: Source file not found at ${srcPath}`);
    }
  }

  console.log('🎨 Launching browser to compile PNG assets...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Generate App Icon PNGs from public/brand/app-icon-master.svg
  const appIconSvgPath = path.join(destBaseDir, 'app-icon-master.svg');
  const appIconFileUrl = `file:///${appIconSvgPath}`;
  console.log(`\n📦 Generating App Icon PNGs from: ${appIconSvgPath}...`);
  for (const size of appIconSizes) {
    await page.setViewportSize({ width: size, height: size });
    await page.goto(appIconFileUrl);
    await page.waitForTimeout(200);

    const outPngPath = path.join(destBaseDir, `app-icon-${size}.png`);
    await page.screenshot({ path: outPngPath, omitBackground: true });
    console.log(`   - Rendered: app-icon-${size}.png`);
  }

  // Generate Favicon PNGs from public/brand/favicon.svg
  const faviconSvgPath = path.join(destBaseDir, 'favicon.svg');
  const faviconFileUrl = `file:///${faviconSvgPath}`;
  console.log(`\n📦 Generating Favicon PNGs from: ${faviconSvgPath}...`);
  for (const size of faviconSizes) {
    await page.setViewportSize({ width: size, height: size });
    await page.goto(faviconFileUrl);
    await page.waitForTimeout(200);

    const outPngPath = path.join(destBaseDir, `favicon-${size}.png`);
    await page.screenshot({ path: path.join(destBaseDir, `favicon-${size}.png`), omitBackground: true });
    console.log(`   - Rendered: favicon-${size}.png`);
  }

  // Also copy main favicon.ico or favicon files to root if needed?
  // Let's create favicon-32.png as favicon.png and copy it to root or public/
  // The Next.js metadata will map specifically.
  
  await browser.close();
  console.log('\n🎉 Production brand assets compiled and organized inside public/brand/!');
}

main().catch(console.error);
