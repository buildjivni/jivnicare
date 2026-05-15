// =============================================================
//  JivniCare — Auth Layout
//  Clean, no-Header/Footer layout for login and OTP pages.
//  Provides a calm, trust-focused, minimal healthcare auth shell.
// =============================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — JivniCare",
  description: "Sign in to access JivniCare — healthcare made simple for Bihar.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
