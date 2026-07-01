const { chromium } = require("@playwright/test");

const CONVERSATION_ID = "f38e1754-fed2-42be-9702-0592d34035a5";
const SCREENSHOT_DIR = `C:/Users/dharm/.gemini/antigravity/brain/${CONVERSATION_ID}`;

const VIEWPORTS = {
  desktop: { width: 1200, height: 950 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 }
};

const PAGES = [
  {
    name: "header",
    path: "/",
    role: null,
    action: async (page) => {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
    }
  },
  {
    name: "footer",
    path: "/",
    role: null,
    action: async (page) => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
    }
  },
  {
    name: "loading",
    path: "/loading-preview",
    role: null
  },
  {
    name: "login",
    path: "/login",
    role: null
  },
  {
    name: "partner_login",
    path: "/partners/login",
    role: null
  },
  {
    name: "admin_login",
    path: "/admin/jvc-26",
    role: null
  },
  {
    name: "partner_onboard",
    path: "/partners/onboard",
    role: "DOCTOR"
  },
  {
    name: "admin_dashboard",
    path: "/admin/dashboard",
    role: "ADMIN",
    action: async (page, device) => {
      if (device === "mobile") {
        // Capture drawer closed first
        await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile_admin_dashboard_drawer_closed.png` });
        // Click hamburger button to open drawer
        await page.locator("button.text-slate-600").first().click();
        await page.waitForTimeout(500); // Animation buffer
        await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile_admin_dashboard_drawer_open.png` });
      }
    }
  },
  {
    name: "doctor_dashboard",
    path: "/doctor/dashboard",
    role: "DOCTOR",
    action: async (page, device) => {
      if (device === "mobile") {
        // Capture drawer closed first
        await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile_doctor_dashboard_drawer_closed.png` });
        // Click hamburger button to open drawer
        await page.locator("button.text-slate-600").first().click();
        await page.waitForTimeout(500); // Animation buffer
        await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile_doctor_dashboard_drawer_open.png` });
      }
    }
  },
  {
    name: "search_insights",
    path: "/admin/search-insights",
    role: "ADMIN",
    action: async (page, device) => {
      if (device === "mobile") {
        // Capture drawer closed first
        await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile_search_insights_drawer_closed.png` });
        // Click hamburger button to open drawer
        await page.locator("button.text-slate-600").first().click();
        await page.waitForTimeout(500); // Animation buffer
        await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile_search_insights_drawer_open.png` });
      }
    }
  },
  {
    name: "totp_setup",
    path: "/admin/totp-setup",
    role: "ADMIN"
  },
  {
    name: "totp_verify",
    path: "/admin/totp-verify",
    role: "ADMIN"
  },
  {
    name: "auth_error",
    path: "/auth/error?error=AccessDenied",
    role: null
  }
];

async function capture() {
  console.log("📸 Starting Stage 3E Comprehensive Screenshot Capture...");

  const browser = await chromium.launch({ headless: true });

  for (const [device, viewport] of Object.entries(VIEWPORTS)) {
    console.log(`\n📐 Processing Viewport: ${device} (${viewport.width}x${viewport.height})`);

    for (const item of PAGES) {
      console.log(`🔗 Navigating to ${item.path} (Role: ${item.role || "PUBLIC"})...`);

      // Create a fresh context for each page to avoid cross-contamination
      const context = await browser.newContext({ viewport });

      // Intercept calls to auth and data routes
      await context.route("**/api/auth/me", (route) => {
        if (item.role) {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              user: {
                id: "temp-user-id",
                name: "Test User",
                role: item.role,
                doctorId: item.role === "DOCTOR" ? "temp-doctor-id" : null,
                email: "test@jivnicare.com"
              }
            })
          });
        } else {
          route.fulfill({ status: 401, body: JSON.stringify({ error: "Unauthorized" }) });
        }
      });

      await context.route("**/api/doctor/**", (route, request) => {
        const url = request.url();
        if (url.includes("/api/doctor/profile")) {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              doctor: {
                id: "temp-doctor-id",
                name: "Dr. Test Doctor",
                speciality: "General Physician",
                verificationStatus: "VERIFIED",
                jivnicarePatientsServed: 120,
                platformPricing: { monthlyFee: 2999, discountPercent: 100, perBookingFee: 29 }
              }
            })
          });
        } else if (url.includes("/api/doctor/settings")) {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              weeklySchedule: {}
            })
          });
        } else if (url.includes("/api/doctor/queue")) {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              doctor: { name: "Dr. Test Doctor", speciality: "General Physician", verificationStatus: "VERIFIED" },
              queue: { id: "q1", status: "ACTIVE", nowCalling: null, tokens: [] },
              stats: { todayTotal: 15, completed: 8, waiting: 7 }
            })
          });
        } else {
          route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
        }
      });

      await context.route("**/api/admin/stats", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            totalDoctors: 45,
            pendingDoctors: 3,
            totalPatients: 840,
            activeQueues: 12,
            activeTokens: 114
          })
        });
      });

      await context.route("**/api/admin/search-insights", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            topQueries: [{ query: "Gynecologist", searchCount: 154, resultCount: 22 }],
            zeroResultQueries: []
          })
        });
      });

      await context.route("**/api/auth/totp/setup", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            secret: "JIVNICARESECRET2FA",
            qrCodeUri: "otpauth://totp/JivniCare:test?secret=JIVNICARESECRET2FA"
          })
        });
      });

      // Inject auth state if a role is requested
      if (item.role) {
        await context.addInitScript((role) => {
          window.localStorage.setItem("jivnicare-auth", JSON.stringify({
            state: {
              user: {
                id: "temp-user-id",
                name: "Test User",
                role: role,
                doctorId: role === "DOCTOR" ? "temp-doctor-id" : null,
                email: "test@jivnicare.com"
              },
              isAuthenticated: true
            }
          }));
        }, item.role);
      }

      const page = await context.newPage();

      try {
        await page.goto(`http://localhost:3000${item.path}`, { waitUntil: "networkidle", timeout: 15000 });

        if (item.action) {
          await item.action(page, device);
        } else {
          await page.waitForTimeout(500);
        }

        const screenshotPath = `${SCREENSHOT_DIR}/${device}_${item.name}.png`;
        await page.screenshot({ path: screenshotPath });
        console.log(`   Captured: ${device}_${item.name}.png`);
      } catch (err) {
        console.error(`🚨 Error on ${device}_${item.name}:`, err.message);
      } finally {
        await context.close();
      }
    }
  }

  await browser.close();
  console.log("🎉 All verification screenshots captured successfully!");
}

capture().catch(err => {
  console.error("Error during execution:", err);
});
