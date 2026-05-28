/** Client-safe Firebase config (NEXT_PUBLIC_* only). */
import { getApps, initializeApp, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export function getPublicFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

export function isFirebaseClientConfiguredLocal(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim()
  );
}

export function isFirebaseClientConfigured(): boolean {
  return isFirebaseClientConfiguredLocal();
}

export function initializeFirebaseAuth() {
  if (typeof window === "undefined") return null;

  if (!isFirebaseClientConfiguredLocal()) {
    return null;
  }

  try {
    const app =
      getApps().length === 0 ? initializeApp(getPublicFirebaseConfig()) : getApp();
    return getAuth(app);
  } catch (error) {
    console.error("Failed to initialize Firebase Auth", error);
    return null;
  }
}

export function assertPublicFirebaseConfig(): void {
  const cfg = getPublicFirebaseConfig();
  if (!cfg.apiKey || !cfg.authDomain || !cfg.projectId || !cfg.appId) {
    throw new Error(
      "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables."
    );
  }
}
