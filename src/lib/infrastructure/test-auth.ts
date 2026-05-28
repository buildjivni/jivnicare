/**
 * Encapsulates all E2E testing and pilot mode authentication logic.
 * Keeps production env and auth services clean of test mocks.
 */

import { signToken } from "@/lib/jwt";

export function isTestOtpModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_TEST_OTP === 'true';
}

export function getTestOtpNumbers(): string[] {
  const numbers = process.env.NEXT_PUBLIC_TEST_OTP_NUMBERS?.trim();
  return numbers ? numbers.split(',').map((n) => n.trim()) : [];
}

export function getTestOtpCode(): string {
  return process.env.NEXT_PUBLIC_TEST_OTP_CODE?.trim() || '123456';
}

export function handleTestAdminLogin(identifier: string, password: string, role: string) {
  if (
    isTestOtpModeEnabled() &&
    identifier === "admin@jivnicare.com" &&
    password === "admin123" &&
    role === "ADMIN"
  ) {
    const user = {
      id: "admin-test-id",
      email: "admin@jivnicare.com",
      name: "Test Admin",
      phone: null,
      role: "ADMIN" as const,
    };
    const token = signToken({ id: user.id, role, email: user.email }, "1d");
    return { user, token };
  }
  return null;
}
