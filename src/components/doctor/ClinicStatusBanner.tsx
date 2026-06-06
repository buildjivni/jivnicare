"use client";

import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json());

interface ClinicStatusBannerProps {
  doctorSlug: string;
  onStatusChange?: (canBook: boolean) => void;
}

const STATUS_UI: Record<
  string,
  { message: string; canBook: boolean; color: string }
> = {
  AVAILABLE:         { message: "Booking open hai",           canBook: true,  color: "green" },
  LIMITED_SLOTS:     { message: "Sirf kuch seats bacha hain", canBook: true,  color: "yellow" },
  SHORT_BREAK:       { message: "Doctor short break pe hain", canBook: false, color: "yellow" },
  EMERGENCY_ONLY:    { message: "Sirf emergency cases",       canBook: false, color: "red" },
  FULLY_BOOKED_AUTO: { message: "Aaj ke tokens bhar gaye",   canBook: false, color: "red" },
  CLINIC_CLOSED:     { message: "Aaj clinic band hai",        canBook: false, color: "zinc" },
};

export function ClinicStatusBanner({
  doctorSlug,
  onStatusChange,
}: ClinicStatusBannerProps) {
  const { data, isLoading } = useSWR(
    `/api/public/clinic-status/${doctorSlug}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  if (isLoading || !data) return null;

  const isClosedToday: boolean = data.isClosedToday ?? false;
  const pauseOnline: boolean = data.pauseOnlineBooking ?? false;
  const clinicStatus: string = data.status ?? "AVAILABLE";

  let message = STATUS_UI[clinicStatus]?.message ?? "Status unknown";
  let canBook = STATUS_UI[clinicStatus]?.canBook ?? true;
  let color = STATUS_UI[clinicStatus]?.color ?? "zinc";

  if (isClosedToday) {
    message = "Doctor ne aaj clinic band rakhi hai";
    canBook = false;
    color = "zinc";
  }
  if (pauseOnline) {
    message = "Online booking abhi band hai";
    canBook = false;
    color = "yellow";
  }

  onStatusChange?.(canBook);

  const colorClass = {
    green:  "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
    red:    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    zinc:   "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-700",
  }[color] ?? "";

  return (
    <div className={`rounded-lg border px-4 py-2.5 text-sm font-medium w-full ${colorClass}`}>
      {canBook ? "🟢" : "🔴"} {message}
    </div>
  );
}
