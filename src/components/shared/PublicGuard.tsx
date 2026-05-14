"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, getRoleRedirect } from "@/store/useAuthStore";

export function PublicGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (_hasHydrated) {
      setMounted(true);
    }
  }, [_hasHydrated]);

  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      // Patients (role: 'PATIENT') can stay on public pages
      // Doctors and Admins should be redirected to their dashboards
      if (user.role === "DOCTOR" || user.role === "ADMIN") {
        router.replace(getRoleRedirect(user.role));
      }
    }
  }, [mounted, isAuthenticated, user, router]);

  // To prevent flickering/flash of content while redirecting
  if (mounted && isAuthenticated && (user?.role === "DOCTOR" || user?.role === "ADMIN")) {
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
