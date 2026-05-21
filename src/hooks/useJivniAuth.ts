"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * JivniCare — Custom Auth Integration Hook
 * Synchronizes the HttpOnly session cookie with our internal Zustand store.
 * Replaces the legacy Firebase onAuthStateChanged pattern.
 */

export function useJivniAuth() {
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const setLoading = useAuthStore((state) => state.setLoading);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  const hasSyncedRef = useRef(false);

  const syncSession = useCallback(async () => {
    if (!_hasHydrated) return;

    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          login({
            id: data.user.id,
            name: data.user.name,
            phone: data.user.phone,
            role: data.user.role,
            verified: data.user.verified,
            doctorId: data.user.doctorId ?? null,
          });
        }
      } else if (res.status === 401) {
        // Since we are decoupling this from reactive loop, 
        // if /me says 401, we just unconditionally clear the client session
        // to match the server state.
        logout();
      }
    } catch (error) {
      console.error("Session sync error:", error);
    } finally {
      setLoading(false);
    }
  }, [_hasHydrated, login, logout, setLoading]);

  useEffect(() => {
    // Only run when the store first hydrates, and only run ONCE.
    if (_hasHydrated && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      syncSession();
    }
  }, [_hasHydrated, syncSession]);

  return { syncSession };
}
