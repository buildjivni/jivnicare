"use client";

import { initializeApp, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type Auth,
  type ConfirmationResult,
} from "firebase/auth";
import { assertPublicFirebaseConfig, getPublicFirebaseConfig } from "@/lib/firebase/config";
import {
  getFirebaseErrorDetails,
  logFirebaseOtp,
  maskConfigForLog,
} from "@/lib/firebase/otp-log";

const FIREBASE_APP_NAME = "jivnicare";

let auth: Auth | undefined;

function waitForRecaptchaContainer(
  containerId: string,
  timeoutMs = 8000
): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(containerId);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.getElementById(containerId);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      const el = document.getElementById(containerId);
      if (el) resolve(el);
      else reject(new Error(`reCAPTCHA container #${containerId} not found in DOM`));
    }, timeoutMs);
  });
}

export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth is only available in the browser");
  }

  if (!auth) {
    assertPublicFirebaseConfig();
    const config = getPublicFirebaseConfig();
    logFirebaseOtp("firebase_app_init", {
      config: maskConfigForLog(config),
    });

    let app: FirebaseApp;
    try {
      app = getApp(FIREBASE_APP_NAME);
    } catch {
      app = initializeApp(
        {
          apiKey: config.apiKey!,
          authDomain: config.authDomain!,
          projectId: config.projectId!,
          appId: config.appId!,
        },
        FIREBASE_APP_NAME
      );
    }

    auth = getAuth(app);
  }

  return auth;
}

export function clearRecaptchaVerifier(verifier: RecaptchaVerifier | null): void {
  if (!verifier) return;
  try {
    verifier.clear();
    logFirebaseOtp("recaptcha_clear", { cleared: true });
  } catch {
    logFirebaseOtp("recaptcha_clear", { cleared: false });
  }
}

export async function createRecaptchaVerifier(
  containerId: string,
  size: "invisible" | "normal" = "invisible"
): Promise<RecaptchaVerifier> {
  logFirebaseOtp("recaptcha_container_wait", { containerId });
  await waitForRecaptchaContainer(containerId);

  const firebaseAuth = getFirebaseAuth();
  const verifier = new RecaptchaVerifier(firebaseAuth, containerId, {
    size,
    callback: () => {
      logFirebaseOtp("recaptcha_create", { containerId, status: "solved" });
    },
    "expired-callback": () => {
      logFirebaseOtp("recaptcha_create", { containerId, status: "expired" });
    },
  });

  logFirebaseOtp("recaptcha_create", { containerId, size });
  return verifier;
}

export async function sendFirebasePhoneOtp(
  phone10: string,
  recaptcha: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const firebaseAuth = getFirebaseAuth();
  const phoneE164 = `+91${phone10}`;

  logFirebaseOtp("sign_in_start", {
    phoneSuffix: phone10.slice(-4),
    authDomain: getPublicFirebaseConfig().authDomain,
  });

  try {
    const result = await signInWithPhoneNumber(
      firebaseAuth,
      phoneE164,
      recaptcha
    );
    logFirebaseOtp("sign_in_success", {
      phoneSuffix: phone10.slice(-4),
      hasConfirmation: Boolean(result),
    });
    return result;
  } catch (err) {
    const { code, message } = getFirebaseErrorDetails(err);
    logFirebaseOtp("sign_in_error", { code, message: message.slice(0, 200) });
    throw err;
  }
}

export function mapFirebaseAuthError(err: unknown): string {
  const { code, message } = getFirebaseErrorDetails(err);

  switch (code) {
    case "auth/invalid-phone-number":
      return "Invalid mobile number. Please check and try again.";
    case "auth/missing-phone-number":
      return "Enter a valid 10-digit mobile number.";
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
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/app-not-authorized":
    case "auth/invalid-app-credential":
      return "This app is not authorized for phone sign-in. Contact support.";
    case "auth/operation-not-allowed":
      return "Phone sign-in is not enabled for this project. Contact support.";
    case "auth/billing-not-enabled":
      return "SMS verification is not active on this Firebase project. Enable Blaze billing and Phone Authentication in Firebase Console, then redeploy.";
    case "auth/internal-error":
      return "Verification service error. Please try again in a moment.";
    case "auth/popup-blocked":
      return "Browser blocked the security check. Allow popups and retry.";
    case "auth/missing-recaptcha-token":
      return "Security verification failed. Refresh and request OTP again.";
    default:
      if (message.toLowerCase().includes("recaptcha")) {
        return "Security check failed. Refresh the page and try again.";
      }
      if (message.toLowerCase().includes("network")) {
        return "Network error. Check your connection and try again.";
      }
      return code
        ? `Unable to send OTP (${code}). Please try again.`
        : "Unable to send OTP. Please try again.";
  }
}
