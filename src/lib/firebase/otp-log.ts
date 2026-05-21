/** Client-side structured logs for Firebase Phone OTP (production-safe). */

type OtpLogStep =
  | "config_check"
  | "firebase_app_init"
  | "recaptcha_container_wait"
  | "recaptcha_create"
  | "recaptcha_clear"
  | "sign_in_start"
  | "sign_in_success"
  | "sign_in_error"
  | "verify_start"
  | "verify_success"
  | "verify_error"
  | "resend_start";

export function logFirebaseOtp(
  step: OtpLogStep,
  meta?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  const entry = {
    ts: new Date().toISOString(),
    step,
    ...meta,
  };
  console.info("[firebase-otp]", JSON.stringify(entry));
}

export function maskConfigForLog(config: {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  appId?: string;
}) {
  return {
    authDomain: config.authDomain || null,
    projectId: config.projectId || null,
    appId: config.appId ? `…${config.appId.slice(-6)}` : null,
    apiKeyPresent: Boolean(config.apiKey),
  };
}

export function getFirebaseErrorDetails(err: unknown): {
  code: string;
  message: string;
} {
  if (err && typeof err === "object") {
    const e = err as { code?: string; message?: string };
    return {
      code: e.code ? String(e.code) : "",
      message: e.message ? String(e.message) : String(err),
    };
  }
  return { code: "", message: String(err) };
}
