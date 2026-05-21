"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type Auth,
  type ConfirmationResult,
} from "firebase/auth";
import { assertPublicFirebaseConfig, getPublicFirebaseConfig } from "@/lib/firebase/config";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth is only available in the browser");
  }
  if (!auth) {
    assertPublicFirebaseConfig();
    const config = getPublicFirebaseConfig();
    app = getApps().length
      ? getApps()[0]
      : initializeApp({
          apiKey: config.apiKey!,
          authDomain: config.authDomain!,
          projectId: config.projectId!,
          appId: config.appId!,
        });
    auth = getAuth(app);
  }
  return auth;
}

export function createRecaptchaVerifier(
  containerId: string,
  size: "invisible" | "normal" = "invisible"
): RecaptchaVerifier {
  const firebaseAuth = getFirebaseAuth();
  return new RecaptchaVerifier(firebaseAuth, containerId, {
    size,
    callback: () => {},
    "expired-callback": () => {},
  });
}

export async function sendFirebasePhoneOtp(
  phone10: string,
  recaptcha: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const firebaseAuth = getFirebaseAuth();
  return signInWithPhoneNumber(firebaseAuth, `+91${phone10}`, recaptcha);
}

export function mapFirebaseAuthError(code: string): string {
  switch (code) {
    case "auth/invalid-phone-number":
      return "Invalid mobile number. Please check and try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/code-expired":
      return "OTP expired. Please request a new code.";
    case "auth/invalid-verification-code":
      return "Incorrect OTP. Please try again.";
    case "auth/captcha-check-failed":
      return "Security check failed. Refresh the page and try again.";
    case "auth/quota-exceeded":
      return "SMS service is temporarily unavailable. Try again later.";
    default:
      return "Unable to verify phone number. Please try again.";
  }
}
