import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

/**
 * JivniCare — Firebase Client SDK Configuration
 * Use environment variables for project-specific settings.
 *
 * NOTE: Firebase is only used for legacy partner email/password auth and
 * doctor onboarding reCAPTCHA flow.
 * Primary patient/doctor auth uses OTP → JWT (HttpOnly cookie).
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase for Next.js (Safe for SSR and Hot Reloading)
// We only initialize if apiKey is present to prevent 'auth/invalid-api-key' errors during Vercel builds.
const app: FirebaseApp = getApps().length > 0
  ? getApp()
  : (firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null as unknown as FirebaseApp);

const auth: Auth = app ? getAuth(app) : null as unknown as Auth;

export { app, auth };
