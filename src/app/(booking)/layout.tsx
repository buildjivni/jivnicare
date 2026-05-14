"use client";

import { RoleGuard } from "@/components/shared/RoleGuard";

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["PATIENT"]}>
      {children}
    </RoleGuard>
  );
}
