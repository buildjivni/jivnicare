"use client";

import { useCallback, useRef, useState } from "react";
import type { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import {
  clearRecaptchaVerifier,
  createRecaptchaVerifier,
  getFirebaseAuth,
  mapFirebaseAuthError,
  sendFirebasePhoneOtp,
} from "@/lib/firebase/client";
import {
  isFirebaseClientConfigured,
  getPublicFirebaseConfig,
} from "@/lib/firebase/config";
import {
  getFirebaseErrorDetails,
  logFirebaseOtp,
  maskConfigForLog,
} from "@/lib/firebase/otp-log";

export function useFirebasePhoneAuth(recaptchaContainerId = "firebase-recaptcha") {
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [otpReady, setOtpReady] = useState(false);

  const destroyRecaptcha = useCallback(() => {
    clearRecaptchaVerifier(recaptchaRef.current);
    recaptchaRef.current = null;
  }, []);

  const resetConfirmation = useCallback(() => {
    confirmationRef.current = null;
    setOtpReady(false);
    destroyRecaptcha();
  }, [destroyRecaptcha]);

  const sendOtp = useCallback(
    async (phone10: string) => {
      if (phone10.length < 10) {
        throw new Error("Enter a valid 10-digit mobile number.");
      }

      if (!isFirebaseClientConfigured()) {
        logFirebaseOtp("config_check", {
          ok: false,
          config: maskConfigForLog(getPublicFirebaseConfig()),
        });
        throw new Error(
          "Phone verification is not configured. Missing Firebase client environment variables."
        );
      }

      logFirebaseOtp("config_check", {
        ok: true,
        config: maskConfigForLog(getPublicFirebaseConfig()),
      });

      if (isSending) {
        throw new Error("OTP is already being sent. Please wait.");
      }

      setIsSending(true);
      confirmationRef.current = null;
      setOtpReady(false);
      destroyRecaptcha();

      try {
        getFirebaseAuth();
        const verifier = await createRecaptchaVerifier(recaptchaContainerId);
        recaptchaRef.current = verifier;

        logFirebaseOtp("resend_start", {
          phoneSuffix: phone10.slice(-4),
          containerId: recaptchaContainerId,
        });

        confirmationRef.current = await sendFirebasePhoneOtp(phone10, verifier);

        if (!confirmationRef.current) {
          throw new Error("OTP session was not created. Please try again.");
        }

        setOtpReady(true);
      } catch (err: unknown) {
        destroyRecaptcha();
        confirmationRef.current = null;
        setOtpReady(false);
        const { code, message } = getFirebaseErrorDetails(err);
        logFirebaseOtp("sign_in_error", {
          code,
          message: message.slice(0, 200),
          containerId: recaptchaContainerId,
        });
        throw new Error(mapFirebaseAuthError(err));
      } finally {
        setIsSending(false);
      }
    },
    [recaptchaContainerId, destroyRecaptcha, isSending]
  );

  const verifyOtpCode = useCallback(async (code: string) => {
    if (!confirmationRef.current) {
      logFirebaseOtp("verify_error", {
        reason: "missing_confirmation_result",
        otpReady,
      });
      throw new Error("Please request an OTP first.");
    }

    logFirebaseOtp("verify_start", { otpReady });

    try {
      const credential = await confirmationRef.current.confirm(code);
      const idToken = await credential.user.getIdToken();
      logFirebaseOtp("verify_success", { hasToken: Boolean(idToken) });
      return idToken;
    } catch (err: unknown) {
      const { code, message } = getFirebaseErrorDetails(err);
      logFirebaseOtp("verify_error", { code, message: message.slice(0, 200) });
      throw new Error(mapFirebaseAuthError(err));
    }
  }, [otpReady]);

  return {
    sendOtp,
    verifyOtpCode,
    isSending,
    otpReady,
    hasConfirmation: otpReady,
    resetConfirmation,
  };
}
