/** Structured client logs for patient login / onboarding state machine. */

export type OnboardingLogStep =
  | "phone_submit"
  | "otp_send_start"
  | "otp_send_success"
  | "otp_send_error"
  | "otp_verify_start"
  | "otp_verify_success"
  | "session_created"
  | "identity_show"
  | "identity_submit"
  | "identity_success"
  | "redirect"
  | "auth_guard_skip";

export function logOnboarding(
  step: OnboardingLogStep,
  meta?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  console.info(
    "[onboarding]",
    JSON.stringify({ ts: new Date().toISOString(), step, ...meta })
  );
}

