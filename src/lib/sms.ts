import { getTwoFactorApiKey } from "./infrastructure/env";
import { logger } from "./infrastructure/logger";

/**
 * Sends a transactional SMS to a 10-digit Indian phone number.
 * Safely logs the content and runs in mock-mode if TWOFACTOR_API_KEY is not set.
 */
export async function sendTransactionalSms(phone: string, message: string): Promise<boolean> {
  const phone10 = phone.replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(phone10)) {
    logger.warn({ category: "OTP", message: "Invalid phone number format", metadata: { phone } });
    return false;
  }

  // Always log the SMS to stdout/logger for observability and audit trails
  logger.info({
    category: "OTP",
    message: "Transactional SMS Dispatched",
    metadata: { phone: phone10, text: message },
  });

  const apiKey = getTwoFactorApiKey();
  if (!apiKey) {
    logger.info({ category: "OTP", message: "SMS sending skipped (No TWOFACTOR_API_KEY set)" });
    return true; // Return true as a successful mock in development
  }

  try {
    const url = `https://2factor.in/API/V1/${apiKey}/ADDON_SENDR/TSMS`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: "JIVNIC", // default sender ID
        To: phone10,
        Msg: message,
      }),
    });

    if (!response.ok) {
      logger.error({
        category: "OTP",
        message: "Failed to send SMS via 2Factor API",
        error: `HTTP status ${response.status}`,
      });
      return false;
    }

    const data = await response.json();
    if (data.Status !== "Success") {
      logger.error({
        category: "OTP",
        message: "2Factor API returned non-success response",
        error: data,
      });
      return false;
    }

    return true;
  } catch (error) {
    logger.error({
      category: "OTP",
      message: "Exception during SMS dispatch",
      error,
    });
    return false;
  }
}
