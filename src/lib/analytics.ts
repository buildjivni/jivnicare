"use client";

/**
 * JivniCare Core Analytics Architecture
 * 
 * This file prepares the platform for PostHog / GA4 integration.
 * Currently, it logs to the console in development and prevents crashes in production.
 * 
 * Usage:
 * import { trackEvent } from "@/lib/analytics";
 * 
 * trackEvent("book_appointment_started", { doctorId: doctor.id });
 */

const IS_DEV = process.env.NODE_ENV === "development";

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (IS_DEV) {
    console.log(`[Analytics] ${eventName}`, properties);
  }
  
  // TODO: Implement PostHog / GA4 here
  // Example: posthog.capture(eventName, properties);
  // Example: window.gtag('event', eventName, properties);
}

export function trackPageview(url: string) {
  if (IS_DEV) {
    console.log(`[Analytics] Pageview: ${url}`);
  }
  
  // TODO: Implement PostHog / GA4 pageview tracking
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (IS_DEV) {
    console.log(`[Analytics] Identify User: ${userId}`, traits);
  }
  
  // TODO: Implement PostHog identify
}

/**
 * Initializes global error tracking for runtime observability.
 * To be called once in the root layout or main provider.
 */
export function initMonitoring() {
  if (typeof window === "undefined") return;

  // Track Unhandled Promise Rejections (e.g. silent API failures)
  window.addEventListener("unhandledrejection", (event) => {
    trackEvent("runtime_exception", { 
      type: "unhandledrejection", 
      reason: event.reason?.message || String(event.reason) 
    });
    if (IS_DEV) console.error("[Monitoring] Caught unhandled rejection:", event.reason);
  });

  // Track standard JS runtime errors
  window.addEventListener("error", (event) => {
    trackEvent("runtime_exception", { 
      type: "error", 
      message: event.message,
      filename: event.filename,
      lineno: event.lineno
    });
    if (IS_DEV) console.error("[Monitoring] Caught error:", event.message);
  });
}
