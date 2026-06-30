const fs = require("fs");
const path = require("path");

const files = [
  "src/app/(booking)/checkout/page.tsx",
  "src/app/(booking)/confirmation/page.tsx",
  "src/app/(patient)/my-bookings/page.tsx",
  "src/app/(public)/districts/page.tsx",
  "src/app/(public)/districts/[district]/page.tsx",
  "src/app/(public)/doctors/[slug]/page.tsx",
  "src/app/(public)/login/page.tsx",
  "src/app/(public)/partners/onboard/page.tsx",
  "src/app/(public)/partners/page.tsx",
  "src/app/admin/dashboard/page.tsx",
  "src/app/admin/jvc-26/page.tsx",
  "src/app/auth/error/page.tsx",
  "src/app/doctor/dashboard/page.tsx",
  "src/app/globals.css",
  "src/components/DoctorMeta.tsx",
  "src/components/shared/DoctorCard.tsx",
  "src/components/shared/Header.tsx",
  "src/components/shared/MobileNav.tsx",
  "src/features/booking/components/checkout/OrderSummary.tsx",
  "src/features/booking/components/checkout/PatientDetailsForm.tsx",
  "src/features/doctor/components/settings/OperatorManagement.tsx",
  "src/features/marketing/components/home/CtaBannerSection.tsx",
  "src/features/marketing/components/home/HeroSection.tsx",
  "src/features/marketing/components/home/ProductDemosSection.tsx",
  "src/features/marketing/components/home/TrustSection.tsx",
  "src/features/marketing/components/home/VerifiedDoctorsSection.tsx",
  "src/features/marketing/components/trust/HelpEcosystem.tsx",
  "src/features/patient/components/doctors/profile/BookingWidget.tsx",
  "src/features/patient/components/doctors/profile/DoctorProfileView.tsx",
  "src/lib/seo/metadata.ts"
];

const rootDir = path.resolve(__dirname, "..");

console.log("🎨 Starting official brand color adjustments...");

files.forEach((relPath) => {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️ File not found: ${relPath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, "utf8");
  let modified = false;

  // Replace Blue #5297ce
  if (content.includes("#5297ce")) {
    content = content.replace(/#5297ce/g, "#5696C7");
    modified = true;
  }
  if (content.includes("#5297CE")) {
    content = content.replace(/#5297CE/g, "#5696C7");
    modified = true;
  }

  // Replace Green #4b9f5f
  if (content.includes("#4b9f5f")) {
    content = content.replace(/#4b9f5f/g, "#529C60");
    modified = true;
  }
  if (content.includes("#4b9f5F")) {
    content = content.replace(/#4b9f5F/g, "#529C60");
    modified = true;
  }

  // Specific corrections for globals.css variables
  if (relPath.endsWith("globals.css")) {
    if (content.includes("rgba(82, 151, 206")) {
      content = content.replace(/rgba\(82, 151, 206/g, "rgba(86, 150, 199");
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, "utf8");
    console.log(`✅ Updated: ${relPath}`);
  }
});

console.log("🎉 Brand color adjustments complete!");
