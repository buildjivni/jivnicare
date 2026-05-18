"use client";

import { UserRole } from "@/store/useAuthStore";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * RoleGuard is now a passthrough component.
 * Role-based routing and session validation is handled deterministically
 * by the Next.js Edge Middleware (`src/middleware.ts`).
 */
export function RoleGuard({ children }: RoleGuardProps) {
  return <>{children}</>;
}
