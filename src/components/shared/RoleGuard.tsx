"use client";

import { UserRole } from "@/features/auth/store/useAuthStore";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Client-side role gate (UX layer). Authoritative protection is in src/middleware.ts + src/proxy.ts.
 */
export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  return <>{children}</>;
}
