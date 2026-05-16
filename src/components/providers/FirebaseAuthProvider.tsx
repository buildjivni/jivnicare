"use client";

import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

/**
 * JivniCare — Firebase Auth Provider
 * Wraps the application to ensure auth synchronization is always active.
 */

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  // This hook handles the heavy lifting of onAuthStateChanged and session sync
  useFirebaseAuth();
  
  return <>{children}</>;
}
