const { chromium } = require("@playwright/test");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  console.log("📸 Starting Hero Section Screenshot Capture Flow (Rev 5 with inline DB state management)...");

  const targetDocId = "c26f2694-3875-4d15-afd2-def87e94e5e3"; // Dr. Test Concurrency

  // 1. Prepare DB for multi-card carousel (2 General Physicians in Jamui)
  console.log("DB: Setting Dr. Test Concurrency to General Physician, canShowOnPublic=true...");
  await prisma.doctor.update({
    where: { id: targetDocId },
    data: {
      speciality: "General Physician",
      canShowOnPublic: true
    }
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Desktop Viewport
  await page.setViewportSize({ width: 1280, height: 950 });

  console.log("🔗 Navigating to JivniCare landing page...");
  await page.goto("http://localhost:3000");
  
  // Wait for the location selector label "Current Location" to be visible
  await page.waitForSelector("text=Current Location", { timeout: 10000 });
  await page.waitForTimeout(2000); // Allow hydration to stabilize

  // Screenshot A: Default Hero State (showing Search, Location="Jamui", Specialties, and Element 4 initial placeholder)
  console.log("📸 Capturing: hero_default.png...");
  await page.screenshot({ 
    path: "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5/hero_default.png",
    fullPage: false
  });

  // Screenshot B: Specialty Selected (carousel populated with real General Physician cards - we now have 2!)
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

  // 2. Prepare DB for single centered card (1 Gastroenterologist in Jamui)
  console.log("DB: Setting Dr. Test Concurrency to Gastroenterologist, canShowOnPublic=true...");
  await prisma.doctor.update({
    where: { id: targetDocId },
    data: {
      speciality: "Gastroenterologist",
      canShowOnPublic: true
    }
  });

  // Trigger select by selecting "Gastroenterologist" from dropdown
  console.log("👉 Opening dropdown...");
  await page.locator('button:has-text("More...")').click();
  console.log("👉 Clicking dropdown option: 'Gastroenterologist'...");
  await page.locator('button:has-text("Gastroenterologist")').click();

  console.log("⌛ Waiting for single card to load...");
  await page.waitForSelector("text=Explore All Gastroenterologists in", { timeout: 15000 });

  console.log("📸 Capturing: hero_single.png...");
  await page.screenshot({
    path: "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5/hero_single.png"
  });

  // Screenshot E: Listing Page
  console.log("🔗 Navigating to /doctors page...");
  await page.goto("http://localhost:3000/doctors");
  await page.waitForSelector("text=Book Clinic Visit", { timeout: 15000 });

  console.log("📸 Capturing: doctors_listing.png...");
  await page.screenshot({
    path: "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5/doctors_listing.png"
  });

  // Screenshot F: Mobile Viewport on Home
  console.log("📱 Setting mobile viewport (375x812)...");
  await page.setViewportSize({ width: 375, height: 812 });
  
  // Set DB back to General Physician for mobile populated carousel screenshot
  console.log("DB: Setting Dr. Test Concurrency back to General Physician for mobile screenshot...");
  await prisma.doctor.update({
    where: { id: targetDocId },
    data: {
      speciality: "General Physician"
    }
  });

  console.log("🔗 Navigating back to landing page...");
  await page.goto("http://localhost:3000");
  await page.waitForSelector("text=Current Location", { timeout: 10000 });
  await page.waitForTimeout(2000);

  // Click General Physician on mobile
  console.log("👉 Clicking specialty chip on mobile: 'General Physician'...");
  await page.locator('button:has-text("General Physician")').first().click();
  
  console.log("⌛ Waiting for doctor cards to render in mobile view...");
  await page.waitForSelector("text=Explore All General Physicians in", { timeout: 15000 });

  console.log("📸 Capturing: hero_mobile.png...");
  await page.screenshot({
    path: "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5/hero_mobile.png"
  });

  // 3. Cleanup DB to restore original state
  console.log("DB: Restoring original database state for Dr. Test Concurrency...");
  await prisma.doctor.update({
    where: { id: targetDocId },
    data: {
      speciality: "Gastroenterologist",
      canShowOnPublic: false
    }
  });

  await browser.close();
  await prisma.$disconnect();
  console.log("🎉 All screenshots captured and DB restored successfully!");
}

run().catch(async (err) => {
  console.error("Error during execution:", err);
  // Restore DB state in case of failure
  try {
    await prisma.doctor.update({
      where: { id: "c26f2694-3875-4d15-afd2-def87e94e5e3" },
      data: {
        speciality: "Gastroenterologist",
        canShowOnPublic: false
      }
    });
    console.log("DB: Successfully restored original state after failure.");
  } catch (dbErr) {
    console.error("DB: Failed to restore state after failure:", dbErr);
  }
  await prisma.$disconnect();
});
