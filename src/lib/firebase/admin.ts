import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { isFirebaseConfigured } from "@/lib/infrastructure/env";

let adminApp: App | undefined;

function initAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  if (!isFirebaseConfigured()) {
    throw new Error("Firebase Admin is not configured");
  }

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    let serviceAccount: Record<string, unknown>;
    try {
      serviceAccount = JSON.parse(json);
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is malformed JSON");
    }
    return initializeApp({ credential: cert(serviceAccount) });
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

export function getFirebaseAdminAuth(): Auth {
  if (!adminApp) {
    adminApp = initAdminApp();
  }
  return getAuth(adminApp);
}

/** Verify Firebase ID token from phone OTP sign-in. Returns E.164 phone and uid. */
export async function verifyFirebaseIdToken(idToken: string) {
  const auth = getFirebaseAdminAuth();
  const decoded = await auth.verifyIdToken(idToken);

  const phone =
    decoded.phone_number ||
    (decoded.firebase as { identities?: { phone?: string[] } } | undefined)?.identities
      ?.phone?.[0];

  if (!phone) {
    throw new Error("PHONE_NOT_FOUND");
  }

  return {
    uid: decoded.uid,
    phoneE164: phone,
    phone10: normalizeIndianPhone(phone),
  };
}

export function normalizeIndianPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 10) return digits;
  throw new Error("INVALID_PHONE");
}
