// =============================================================
//  JivniCare — Auth Store (Zustand)
//  Manages authentication state, user role, and session.
//  Persisted in localStorage for session continuity.
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
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;

  // Actions
  login: (user: AuthUser, token?: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      login: (user, token) =>
        set({ user, token: token ?? null, isAuthenticated: true, isLoading: false }),

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.error("Logout error", error);
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "jivnicare-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Role-based redirect helper
export function getRoleRedirect(role: UserRole): string {
  switch (role) {
    case "DOCTOR": return "/doctor/dashboard";
    case "ADMIN": return "/admin/dashboard";
    case "PATIENT": return "/";
    default: return "/";
  }
}

export const isDoctor = (role: UserRole) => role === "DOCTOR";
export const isAdmin = (role: UserRole) => role === "ADMIN";
export const isPatient = (role: UserRole) => role === "PATIENT";
