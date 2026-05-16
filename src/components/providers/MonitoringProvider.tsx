"use client";

import { useEffect } from "react";
import { initMonitoring, trackPageview } from "@/lib/analytics";
import { usePathname } from "next/navigation";

export function MonitoringProvider() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize error catchers globally
    initMonitoring();
  }, []);

  useEffect(() => {
    // Log page views on route change
    if (pathname) {
      trackPageview(pathname);
    }
  }, [pathname]);

  return null;
}
