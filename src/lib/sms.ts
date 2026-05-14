/**
 * JivniCare SMS Service
 * Handles sending OTPs via Fast2SMS (popular in India for healthcare/startups).
 * Falls back to console.log in development or if API key is missing.
 */

export const sendSMS = async (phone: string, otp: string) => {
  const isDev = process.env.NODE_ENV === "development";
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (isDev || !apiKey) {
    console.log(`\n========================================`);
    console.log(`📱 [MOCK SMS] To: ${phone}`);
    console.log(`🔐 OTP: ${otp}`);
    console.log(`ℹ️ Add FAST2SMS_API_KEY in .env to send real SMS`);
    console.log(`========================================\n`);
    return true; // Simulate success
  }

  try {
    // Fast2SMS Route API (Transactional)
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "authorization": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        route: "v3",
        sender_id: "TXTIND", // Default sender ID or use custom DLT approved
        message: `Your JivniCare login OTP is ${otp}. Valid for 5 mins. Do not share this with anyone.`,
        language: "english",
        flash: 0,
        numbers: phone,
      })
    });

    const data = await response.json();
    
    if (data.return) {
      console.log(`[SMS] Successfully sent to ${phone}`);
      return true;
    } else {
      console.error(`[SMS] Fast2SMS Error:`, data);
      return false;
    }
  } catch (error) {
    console.error(`[SMS] Network Error while sending SMS to ${phone}:`, error);
    return false;
  }
};
