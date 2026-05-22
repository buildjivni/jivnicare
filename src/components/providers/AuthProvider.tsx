"use client";

import { useJivniAuth } from "@/features/auth/hooks/useJivniAuth";

/**
 * JivniCare — Auth Provider
 * Wraps the application to ensure session synchronization is always active.
 * Decoupled from Firebase.
 */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // This hook handles the heavy lifting of session hydration and cookie-to-store sync
  useJivniAuth();
  
  return <>{children}</>;
}
