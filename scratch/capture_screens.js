const { chromium } = require("@playwright/test");

async function run() {
  console.log("📸 Starting Hero Section Screenshot Capture Flow...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Desktop Viewport
  await page.setViewportSize({ width: 1280, height: 950 });

  console.log("🔗 Navigating to JivniCare landing page...");
  await page.goto("http://localhost:3000");
  
  // Wait for the location selector or specialty selector label to Hydrate
  await page.waitForSelector("text=Select Specialty", { timeout: 10000 });

  // Screenshot A: Default Hero State (showing Search, Location, Specialties)
  console.log("📸 Capturing: hero_default.png...");
  await page.screenshot({ 
    path: "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5/hero_default.png",
    fullPage: false
  });

  // Screenshot B: Specialty Selected (carousel populated with real General Physician cards)
  console.log("👉 Clicking specialty chip: 'General Physician'...");
  await page.locator('button:has-text("General Physician")').first().click();
  
  console.log("⌛ Waiting for doctor cards to load in hero results...");
  await page.waitForSelector("text=Explore All General Physicians in", { timeout: 15000 });

  console.log("📸 Capturing: hero_carousel.png...");
  await page.screenshot({
    path: "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5/hero_carousel.png"
  });

  // Screenshot C: Empty State (selecting Dentist - no Dentist in Jamui)
  console.log("👉 Clicking specialty chip: 'Dentist'...");
  await page.locator('button:has-text("Dentist")').first().click();
  
  console.log("⌛ Waiting for empty state message to appear...");
  await page.waitForSelector("text=No Doctors Found", { timeout: 15000 });

  console.log("📸 Capturing: hero_empty.png...");
  await page.screenshot({
    path: "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5/hero_empty.png"
  });

  // Screenshot D: Mobile Viewport
  console.log("📱 Setting mobile viewport (375x812)...");
  await page.setViewportSize({ width: 375, height: 812 });
  
  // Reselect General Physician
  console.log("👉 Clicking specialty chip on mobile: 'General Physician'...");
  await page.locator('button:has-text("General Physician")').first().click();
  
  console.log("⌛ Waiting for doctor cards to render in mobile view...");
  await page.waitForSelector("text=Explore All General Physicians in", { timeout: 15000 });

  console.log("📸 Capturing: hero_mobile.png...");
  await page.screenshot({
    path: "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5/hero_mobile.png"
  });

  await browser.close();
  console.log("🎉 All screenshots captured successfully!");
}

run().catch(console.error);
