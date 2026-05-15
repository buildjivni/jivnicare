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
    // Support DLT Template for Production or Fallback to Generic
    const dltTemplateId = process.env.FAST2SMS_DLT_TEMPLATE_ID;
    
    const bodyPayload = dltTemplateId ? {
      route: "dlt",
      sender_id: process.env.FAST2SMS_SENDER_ID || "JIVNIC", // Your approved 6-letter sender ID
      message: dltTemplateId,
      variables_values: otp,
      flash: 0,
      numbers: phone,
    } : {
      route: "v3",
      sender_id: "TXTIND", // Default generic sender ID
      message: `Your JivniCare login OTP is ${otp}. Valid for 5 mins. Do not share this with anyone.`,
      language: "english",
      flash: 0,
      numbers: phone,
    };

    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "authorization": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyPayload)
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
