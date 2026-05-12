// =============================================================
//  JivniCare — Auth Store (Zustand)
//  Manages authentication state, user role, and session.
//  Persisted in localStorage for session continuity.
// =============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "user" | "doctor" | "admin" | null;

export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  verified: boolean;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: AuthUser, token?: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user, token) =>
        set({ user, token: token ?? null, isAuthenticated: true, isLoading: false }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "jivnicare-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Role-based redirect helper
export function getRoleRedirect(role: UserRole): string {
  switch (role) {
    case "doctor": return "/doctor/dashboard";
    case "admin": return "/internal-admin";
    case "user": return "/";
    default: return "/";
  }
}
