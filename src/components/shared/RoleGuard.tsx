"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, UserRole } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { isAuthenticated, user, isLoading, _hasHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (_hasHydrated) {
      setMounted(true);
    }
  }, [_hasHydrated]);

  useEffect(() => {
    // ONLY redirect if we are mounted, NOT loading, and have hydrated
    if (mounted && !isLoading && _hasHydrated) {
      if (!isAuthenticated || !user) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (!allowedRoles.includes(user.role)) {
        router.replace("/");
      }
    }
  }, [mounted, isLoading, _hasHydrated, isAuthenticated, user, pathname, router, allowedRoles]);

  if (!mounted || isLoading || !isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
