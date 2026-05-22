"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, getRoleRedirect } from "@/features/auth/store/useAuthStore";

export function PublicGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const isOnboardingRoute = pathname.startsWith("/partners/onboard");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (_hasHydrated) {
      setMounted(true);
    }
  }, [_hasHydrated]);

  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      if (user.role === "ADMIN") {
        router.replace(getRoleRedirect(user.role));
        return;
      }
      // Allow doctors to complete or resume onboarding
      if (user.role === "DOCTOR" && !isOnboardingRoute) {
        router.replace(getRoleRedirect(user.role));
      }
    }
  }, [mounted, isAuthenticated, user, router, isOnboardingRoute]);

  if (
    mounted &&
    isAuthenticated &&
    (user?.role === "ADMIN" || (user?.role === "DOCTOR" && !isOnboardingRoute))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
