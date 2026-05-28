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



export function getTwoFactorApiKey(): string {
  const key = process.env.TWOFACTOR_API_KEY?.trim();
  if (!key) {
    if (isProduction()) {
      throw new Error("FATAL: TWOFACTOR_API_KEY is required in production");
    }
    return "";
  }
  return key;
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

  if (!getTwoFactorApiKey()) {
    errors.push("FATAL: TWOFACTOR_API_KEY is required in production for SMS OTP");
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
  if (!getTwoFactorApiKey()) missing.push("TWOFACTOR_API_KEY");
  if (!isBlobConfigured()) missing.push("BLOB_READ_WRITE_TOKEN");
  return { ok: missing.length === 0, missing };
}

