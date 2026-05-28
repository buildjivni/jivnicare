export function isTestOtpModeEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_ENABLE_TEST_OTP === "true"
  );
}

export function getTestOtpNumbers(): string[] {
  if (!isTestOtpModeEnabled()) return [];
  const numbers = process.env.NEXT_PUBLIC_TEST_OTP_NUMBERS?.trim();
  return numbers ? numbers.split(',').map((n) => n.trim()) : [];
}

export function getTestOtpCode(): string {
  if (!isTestOtpModeEnabled()) return '123456';
  return process.env.NEXT_PUBLIC_TEST_OTP_CODE?.trim() || '123456';
}
