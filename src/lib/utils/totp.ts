import * as OTPAuth from "otpauth";

export function generateTOTPSecret(): string {
  const secret = new OTPAuth.Secret({ size: 20 });
  return secret.base32;
}

export function getTOTPUri(secret: string, email: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: "JivniCare",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  return totp.toString();
}

export function verifyAdminTOTP(token: string, secret?: string): boolean {
  const totpSecret = secret || process.env.ADMIN_TOTP_SECRET;
  if (!totpSecret) {
    throw new Error("No TOTP secret configured");
  }
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(totpSecret),
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  });
  return totp.validate({ token, window: 1 }) !== null;
}

export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    codes.push(code);
  }
  return codes;
}
