const { chromium } = require("@playwright/test");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const TEMP_DOC_ID = "temp-doc-rajesh-id-999";
const TEMP_USER_ID = "temp-user-rajesh-id-999";

async function setupTempDoctor() {
  console.log("🌱 Creating a temporary real-sounding doctor Dr. Rajesh Ranjan...");
  
  // 1. Create User
  const user = await prisma.user.create({
    data: {
      id: TEMP_USER_ID,
      phone: "9999999991",
      name: "Dr. Rajesh Ranjan",
      role: "DOCTOR"
    }
  });

  // 2. Create Doctor
  const doctor = await prisma.doctor.create({
    data: {
      id: TEMP_DOC_ID,
      userId: TEMP_USER_ID,
      internalDoctorId: "TEMP_DOC_RAJESH_001",
      slug: "dr-rajesh-ranjan-gp-jamui",
      name: "Dr. Rajesh Ranjan",
      phone: "9999999991",
      speciality: "General Physician",
      qualifications: ["MBBS", "MD (Internal Medicine)"],
      experienceYears: 12,
      registrationNumber: "MCI-12345",
      clinicName: "Ranjan Clinic & Diagnostics",
      clinicAddress: "Station Road, Jamui",
      clinicCity: "Jamui",
      clinicDistrict: "Jamui",
      operatorName: "Rajesh Ranjan",
      operatorMobile: "9999999991",
      verificationStatus: "VERIFIED",
      availabilityStatus: "AVAILABLE",
      isAcceptingBookings: true,
      canShowOnPublic: true,
      isEmergencyEnabled: true
    }
  });

  // 3. Create Platform Pricing
  await prisma.platformPricing.create({
    data: {
      doctorId: TEMP_DOC_ID,
      monthlyFee: 2999,
      perBookingFee: 29,
      discountPercent: 100,
      partnerTier: "EARLY_PARTNER"
    }
  });

  console.log("✅ Temporary doctor setup successful!");
}

async function cleanupTempDoctor() {
  console.log("🧹 Cleaning up temporary doctor Dr. Rajesh Ranjan...");
  try {
    await prisma.platformPricing.deleteMany({ where: { doctorId: TEMP_DOC_ID } });
    await prisma.doctor.deleteMany({ where: { id: TEMP_DOC_ID } });
    await prisma.user.deleteMany({ where: { id: TEMP_USER_ID } });
    console.log("✅ Temporary doctor cleanup successful!");
  } catch (e) {
    console.error("⚠️ Cleanup failed:", e);
  }
}

async function run() {
  console.log("📸 Starting Clean Hero Section Screenshot Capture Flow (Revision 6)...");

  // Step 1: Setup temp doctor
  await setupTempDoctor();

  // Set Dr. Alok Sharma to have emergency enabled
  await prisma.doctor.updateMany({
    where: { name: "Dr. Alok Sharma" },
    data: { isEmergencyEnabled: true }
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Desktop Viewport
  await page.setViewportSize({ width: 1200, height: 950 });

  console.log("🔗 Navigating to JivniCare landing page...");
  await page.goto("http://localhost:3000");
  await page.waitForSelector("text=Location", { timeout: 10000 });
  await page.waitForTimeout(2000); // Allow hydration to stabilize

  // Screenshot 1: Default Hero State (placeholder visible, no results selected)
  console.log("📸 Capturing: hero_default.png...");
  await page.screenshot({ 
    path: "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5/hero_default.png"
  });

  // Screenshot 2: Suggestions Dropdown Panel focused (before typing)
  console.log("👉 Focusing unified search input to open suggestions dropdown...");
  await page.click("#unified-search");
  await page.waitForSelector("text=Common Specialties", { timeout: 5000 });
  
  console.log("📸 Capturing: hero_dropdown_open.png...");
  await page.screenshot({ 
    path: "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5/hero_dropdown_open.png"
  });

  // Screenshot 3: Specialty Selected inline (carousel populated with General Physicians)
  console.log("👉 Clicking specialty option 'General Physician' in dropdown...");
  await page.locator('button:has-text("General Physician")').first().click();
  await page.waitForSelector("text=Explore All General Physician Specialists in", { timeout: 10000 });

  console.log("📸 Capturing: hero_carousel.png...");
  await page.screenshot({
    path: "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5/hero_carousel.png"
  });

  // Screenshot 4: Emergency Filter selected
  console.log("👉 Clearing search input first...");
  await page.fill("#unified-search", "");
  console.log("👉 Clicking search input to reopen dropdown...");
  await page.click("#unified-search");
  await page.waitForSelector("text=Need Urgent Care?", { timeout: 5000 });

  console.log("👉 Clicking Emergency option...");
  await page.locator('button:has-text("Need Urgent Care?")').first().click();
  await page.waitForSelector("text=Explore All Emergency Specialists in", { timeout: 10000 });

  console.log("📸 Capturing: hero_emergency.png...");
  await page.screenshot({
    path: "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5/hero_emergency.png"
  });

  // Screenshot 5: Empty state (Dentist)
  console.log("👉 Clearing search input...");
  await page.fill("#unified-search", "");
  console.log("👉 Clicking search input to reopen dropdown...");
  await page.click("#unified-search");
  await page.waitForSelector("text=Common Specialties", { timeout: 5000 });
  console.log("👉 Clicking Dentist...");
  await page.locator('button:has-text("Dentist")').first().click();
  await page.waitForSelector("text=No Doctors Found", { timeout: 10000 });

  console.log("📸 Capturing: hero_empty.png...");
  await page.screenshot({
    path: "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5/hero_empty.png"
  });

  // Screenshot 6: Single Centered Card (Pediatrician -> Dr. Neha Verma)
  console.log("👉 Clearing search input...");
  await page.fill("#unified-search", "");
  console.log("👉 Clicking search input to reopen dropdown...");
  await page.click("#unified-search");
  await page.waitForSelector("text=Common Specialties", { timeout: 5000 });
  console.log("👉 Clicking Pediatrician...");
  await page.locator('button:has-text("Pediatrician")').first().click();
  await page.waitForSelector("text=Explore All Pediatrician Specialists in", { timeout: 10000 });

  console.log("📸 Capturing: hero_single.png...");
  await page.screenshot({
    path: "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5/hero_single.png"
  });

  // Screenshot 7: Doctors Listing Page
  console.log("🔗 Navigating to /doctors page...");
  await page.goto("http://localhost:3000/doctors");
  await page.waitForSelector("text=Book Clinic Visit", { timeout: 10000 });

  console.log("📸 Capturing: doctors_listing.png...");
  await page.screenshot({
    path: "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5/doctors_listing.png"
  });

  // Screenshot 8: Mobile viewport populated carousel
  console.log("📱 Setting mobile viewport size (375x812)...");
  await page.setViewportSize({ width: 375, height: 812 });

  console.log("🔗 Navigating back to landing page...");
  await page.goto("http://localhost:3000");
  await page.waitForSelector("text=Location", { timeout: 10000 });
  await page.waitForTimeout(2000);

  console.log("👉 Clearing search input on mobile...");
  await page.fill("#unified-search", "");
  console.log("👉 Clicking search input on mobile...");
  await page.click("#unified-search");
  await page.waitForSelector("text=General Physician", { timeout: 5000 });

  console.log("👉 Clicking General Physician on mobile...");
  await page.locator('button:has-text("General Physician")').first().click();
  await page.waitForSelector("text=Explore All General Physician Specialists in", { timeout: 10000 });

  console.log("📸 Capturing: hero_mobile.png...");
  await page.screenshot({
    path: "C:/Users/dharm/.gemini/antigravity/brain/f38e1754-fed2-42be-9702-0592d34035a5/hero_mobile.png"
  });

  // Close browser and restore DB
  await browser.close();

  // Reset Alok Sharma emergency flag
  await prisma.doctor.updateMany({
    where: { name: "Dr. Alok Sharma" },
    data: { isEmergencyEnabled: false }
  });

  await cleanupTempDoctor();
  await prisma.$disconnect();
  console.log("🎉 Screenshots generation complete! No renaming workarounds used. DB clean.");
}

run().catch(async (err) => {
  console.error("Error during execution:", err);
  // Reset Alok Sharma emergency flag
  try {
    await prisma.doctor.updateMany({
      where: { name: "Dr. Alok Sharma" },
      data: { isEmergencyEnabled: false }
    });
  } catch {}
  await cleanupTempDoctor();
  await prisma.$disconnect();
});
