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

console.log("🎨 Starting sitewide color corrections...");

files.forEach((relPath) => {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️ File not found: ${relPath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, "utf8");
  let modified = false;

  // Replace old Blue #205E98
  if (content.includes("#205E98")) {
    content = content.replace(/#205E98/g, "#5297ce");
    modified = true;
  }
  if (content.includes("#205e98")) {
    content = content.replace(/#205e98/g, "#5297ce");
    modified = true;
  }

  // Replace old Green #4A8C4A
  if (content.includes("#4A8C4A")) {
    content = content.replace(/#4A8C4A/g, "#4b9f5f");
    modified = true;
  }
  if (content.includes("#4a8c4a")) {
    content = content.replace(/#4a8c4a/g, "#4b9f5f");
    modified = true;
  }

  // Specific corrections for globals.css variables
  if (relPath.endsWith("globals.css")) {
    if (content.includes("--primary: #5298D2;")) {
      content = content.replace(/--primary: #5298D2;/g, "--primary: #5297ce;");
      modified = true;
    }
    if (content.includes("--secondary: #489C66;")) {
      content = content.replace(/--secondary: #489C66;/g, "--secondary: #4b9f5f;");
      modified = true;
    }
    if (content.includes("rgba(82, 152, 210")) {
      content = content.replace(/rgba\(82, 152, 210/g, "rgba(82, 151, 206");
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, "utf8");
    console.log(`✅ Updated: ${relPath}`);
  }
});

console.log("🎉 Sitewide color corrections complete!");
