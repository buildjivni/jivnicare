"use client";

import { useCallback, useRef, useState } from "react";
import type { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import {
  createRecaptchaVerifier,
  getFirebaseAuth,
  mapFirebaseAuthError,
  sendFirebasePhoneOtp,
} from "@/lib/firebase/client";

export function useFirebasePhoneAuth(recaptchaContainerId = "firebase-recaptcha") {
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const [isSending, setIsSending] = useState(false);

  const ensureRecaptcha = useCallback(() => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = createRecaptchaVerifier(recaptchaContainerId);
    }
    return recaptchaRef.current;
  }, [recaptchaContainerId]);

  const sendOtp = useCallback(
    async (phone10: string) => {
      if (phone10.length < 10) {
        throw new Error("Enter a valid 10-digit mobile number.");
      }
      setIsSending(true);
      try {
        getFirebaseAuth();
        const verifier = ensureRecaptcha();
        confirmationRef.current = await sendFirebasePhoneOtp(phone10, verifier);
      } catch (err: unknown) {
        const code =
          err && typeof err === "object" && "code" in err
            ? String((err as { code: string }).code)
            : "";
        throw new Error(mapFirebaseAuthError(code) || "Failed to send OTP.");
      } finally {
        setIsSending(false);
      }
    },
    [ensureRecaptcha]
  );

  const verifyOtpCode = useCallback(async (code: string) => {
    if (!confirmationRef.current) {
      throw new Error("Please request an OTP first.");
    }
    try {
      const credential = await confirmationRef.current.confirm(code);
      return credential.user.getIdToken();
    } catch (err: unknown) {
      const errorCode =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";
      throw new Error(mapFirebaseAuthError(errorCode) || "Invalid OTP.");
    }
  }, []);

  const resetConfirmation = useCallback(() => {
    confirmationRef.current = null;
  }, []);

  return { sendOtp, verifyOtpCode, isSending, resetConfirmation };
}
