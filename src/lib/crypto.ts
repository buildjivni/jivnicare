import crypto from 'crypto';

const isProd = process.env.NODE_ENV === 'production';

const ENCRYPTION_KEY_RAW = process.env.ENCRYPTION_KEY;
const HMAC_SECRET_KEY_RAW = process.env.HMAC_SECRET_KEY;

function assertKeys() {
  if (isProd && (!ENCRYPTION_KEY_RAW || !HMAC_SECRET_KEY_RAW)) {
    throw new Error("CRITICAL SECURITY ERROR: ENCRYPTION_KEY and HMAC_SECRET_KEY must be set in production!");
  }
}

if (!isProd && (!ENCRYPTION_KEY_RAW || !HMAC_SECRET_KEY_RAW)) {
  console.warn("⚠️ Warning: ENCRYPTION_KEY or HMAC_SECRET_KEY is missing. Using fallback dev keys. DO NOT USE IN PRODUCTION!");
}

const DEV_ENCRYPTION_KEY = "dev-encryption-key-for-local-jivnicare-development";
const DEV_HMAC_SECRET = "dev-hmac-secret-for-local-jivnicare-development";

const encryptionKey = crypto.createHash('sha256').update(ENCRYPTION_KEY_RAW || DEV_ENCRYPTION_KEY).digest();
const hmacKey = HMAC_SECRET_KEY_RAW || DEV_HMAC_SECRET;

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

/**
 * Encrypts a plain text string using AES-256-GCM.
 * Output format: ivHex:encryptedHex:authTagHex
 */
export function encrypt(text: string): string {
  if (!text) return "";
  assertKeys();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

/**
 * Decrypts an encrypted string using AES-256-GCM.
 * Falls back to returning the original string if format is invalid or decryption fails.
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) return "";
  assertKeys();
  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      return ciphertext;
    }
    const [ivHex, encryptedHex, authTagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted as any, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return ciphertext;
  }
}

/**
 * Generates a deterministic SHA-256 HMAC hash of a normalized 10-digit phone number.
 */
export function hashPhone(phone: string): string {
  if (!phone) return "";
  assertKeys();
  const normalized = phone.replace(/\D/g, "").slice(-10);
  if (normalized.length !== 10) {
    return crypto.createHmac('sha256', hmacKey).update(phone).digest('hex');
  }
  return crypto.createHmac('sha256', hmacKey).update(normalized).digest('hex');
}
