// =============================================================
//  JivniCare — Auth Store (Zustand)
//  Manages authentication state, user role, and session.
//  Persisted in localStorage for session continuity.
//
//  PD4 Changes:
//  - Added `doctorId` to AuthUser for dashboard hydration
//  - Added `updateUser()` action for post-onboarding role upgrade
//  - Fixed async logout — now synchronous store clear + async cookie
//  - `getRoleRedirect` is the single source of truth for routing
// =============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "PATIENT" | "DOCTOR" | "ADMIN" | null;

export interface AuthUser {
  id: string;
  phone?: string;
  email?: string;
  name: string;
  role: UserRole;
  verified?: boolean;
  avatar?: string;
  /** Linked doctor record ID — populated after onboarding completes */
  doctorId?: string | null;
}


interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;

  // Actions
  login: (user: AuthUser) => void;
  /** Merge partial fields into existing user — used after role upgrade/onboarding */
  updateUser: (partial: Partial<AuthUser>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      login: (user) =>
        set({ user, isAuthenticated: true, isLoading: false }),

      updateUser: (partial) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...partial } });
      },

      logout: () => {
        // 1. Clear store state immediately (synchronous)
        set({ user: null, isAuthenticated: false });

        // 2. Fire-and-forget server-side cookie cleanup
        fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      },

      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "jivnicare-auth",
      // Persist only what's needed for session continuity.
      // token is NOT persisted (read from HttpOnly cookie on server).
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, err) => {
        if (err) {
          state?.logout();
          state?.setHasHydrated(true);
          return;
        }
        state?.setHasHydrated(true);
        if (state?.isAuthenticated) {
          fetch("/api/auth/me", { credentials: "include" })
            .then(async (res) => {
              if (!res.ok) {
                state?.logout();
                return;
              }
              let data: { user?: AuthUser } | null = null;
              try {
                data = await res.json();
              } catch {
                state?.logout();
                return;
              }
              if (data?.user?.id && data.user.role) {
                state?.login({
                  id: data.user.id,
                  phone: data.user.phone,
                  name: data.user.name,
                  role: data.user.role,
                  doctorId: data.user.doctorId ?? null,
                  verified: data.user.verified,
                });
              } else {
                state?.logout();
              }
            })
            .catch(() => state?.logout());
        }
      },
    }
  )
);

// ── Routing Helpers ──────────────────────────────────────────────

/**
 * Single source of truth for role-based redirect target.
 * Used by: login page, onboarding page, middleware.
 */
export function getRoleRedirect(role: UserRole): string {
  switch (role) {
    case "DOCTOR": return "/doctor/dashboard";
    case "ADMIN":  return "/admin/dashboard";
    case "PATIENT":
    default:       return "/";
  }
}

