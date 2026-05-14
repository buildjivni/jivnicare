"use client";

import { PatientHeader, Footer, RoleGuard } from "@/components/shared";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["PATIENT"]}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <PatientHeader />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </RoleGuard>
  );
}
