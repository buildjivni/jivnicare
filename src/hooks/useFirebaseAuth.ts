"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * JivniCare — Firebase Auth Integration Hook
 * Synchronizes Firebase Auth state with our internal session and Zustand store.
 */

export function useFirebaseAuth() {
  const { login, logout, setLoading } = useAuthStore();
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFbUser(user);
      
      if (user) {
        setLoading(true);
        try {
          // 1. Get a fresh ID Token from Firebase
          const idToken = await user.getIdToken(true);

          // 2. Exchange for JivniCare Session Cookie
          const res = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });

          if (res.ok) {
            const data = await res.json();
            login(data.user);
          } else {
            console.error("Session sync failed");
            logout();
          }
        } catch (error) {
          console.error("Auth state sync error:", error);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        // Firebase signed out -> Sync JivniCare logout
        // (Only if we were previously authenticated in store)
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          logout();
        }
      }
    });

    return () => unsubscribe();
  }, [login, logout, setLoading]);

  return { fbUser };
}
