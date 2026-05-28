/**
 * Central environment validation — no insecure auth fallbacks in production.
 * Keep this file free of @/ path aliases so next.config.ts can import it at build time.
 */

const DEV_JWT_FALLBACK =
  "development-only-jwt-secret-min-32-chars!!";

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production" || !!process.env.VERCEL;
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    if (isProduction()) {
      throw new Error("FATAL: JWT_SECRET is required in production");
    }
    console.warn(
      "[env] JWT_SECRET is not set — using development-only fallback. Add JWT_SECRET to .env.local."
    );
    return DEV_JWT_FALLBACK;
  }
  if (isProduction() && secret.length < 32) {
    throw new Error("FATAL: JWT_SECRET must be at least 32 characters in production");
  }
  if (secret === DEV_JWT_FALLBACK && isProduction()) {
    throw new Error("FATAL: Development JWT fallback cannot be used in production");
  }
  return secret;
}

export function isTestOtpAllowed(): boolean {
  return !isProduction() && process.env.ALLOW_TEST_OTP === "true";
}

/** Lightweight Test OTP Mode */
export function getTestOtpNumbers(): string[] {
  const numbers = process.env.TEST_OTP_NUMBERS || '';
  return numbers
    .split(',')
    .map(n => n.replace(/\D/g, '').slice(-10))
    .filter(Boolean);
}

export function getTestOtpCode(): string {
  return process.env.TEST_OTP_CODE?.trim() ?? "";
}

export function isTestOtpModeEnabled(): boolean {
  const isEnabled = process.env.ENABLE_TEST_OTP === "true" || process.env.NEXT_PUBLIC_ENABLE_TEST_OTP === "true";
  return (
    isEnabled &&
    getTestOtpCode().length > 0 &&
    getTestOtpNumbers().length > 0
  );
}

/** Re-export for env.ts consumers that cannot import pilot-otp (no firebase admin in next.config path). */
export function isPilotOtpModeEnabled(): boolean {
  return (
    process.env.PILOT_OTP_MODE === "true" &&
    Boolean(process.env.ALLOWED_TEST_NUMBERS?.trim())
  );
}

/** Client UI flag — set NEXT_PUBLIC_PILOT_OTP_MODE=true when server pilot mode is on. */
export function isPilotOtpModeClient(): boolean {
  return process.env.NEXT_PUBLIC_PILOT_OTP_MODE === "true";
}

export function isFirebaseConfigured(): boolean {
  return !!(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    (process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY)
  );
}

export function isFirebaseClientConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim()
  );
}

export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN?.trim();
}

/** Validates all required production/staging deployment variables. */
export function assertProductionEnv(): void {
  if (!isProduction()) return;

  const errors: string[] = [];

  try {
    getJwtSecret();
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "JWT_SECRET invalid");
  }

  if (!process.env.DATABASE_URL?.trim()) {
    errors.push("FATAL: DATABASE_URL is required in production");
  }

  if (!isPilotOtpModeEnabled()) {
    if (!isFirebaseConfigured()) {
      errors.push(
        "FATAL: Firebase Admin credentials are required (FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY)"
      );
    }

    if (!isFirebaseClientConfigured()) {
      errors.push(
        "FATAL: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, and NEXT_PUBLIC_FIREBASE_APP_ID are required in production"
      );
    }
  }

  if (!isBlobConfigured()) {
    errors.push("FATAL: BLOB_READ_WRITE_TOKEN is required in production for uploads");
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
}

/** Human-readable checklist for deploy dashboards (does not throw). */
export function getProductionEnvStatus(): {
  ok: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || secret.length < 32) missing.push("JWT_SECRET (min 32 chars)");
  if (!process.env.DATABASE_URL?.trim()) missing.push("DATABASE_URL");
  if (!isFirebaseConfigured()) missing.push("Firebase Admin credentials");
  if (!isFirebaseClientConfigured()) {
    missing.push(
      "NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID"
    );
  }
  if (!isBlobConfigured()) missing.push("BLOB_READ_WRITE_TOKEN");
  return { ok: missing.length === 0, missing };
}
