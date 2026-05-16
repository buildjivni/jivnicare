import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * JivniCare — Firebase Client SDK Configuration
 * Use environment variables for project-specific settings.
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
const app = getApps().length > 0 
  ? getApp() 
  : (firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null as any);

const auth = app ? getAuth(app) : null as any;

export { app, auth };
