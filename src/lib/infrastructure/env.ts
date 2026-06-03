/**
 * Central environment validation — no insecure auth fallbacks in production.
 * Keep this file free of @/ path aliases so next.config.ts can import it at build time.
 */

const DEV_JWT_FALLBACK =
  "development-only-jwt-secret-min-32-chars!!";

function isProduction(): boolean {
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

