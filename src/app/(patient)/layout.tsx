"use client";

import { Header, Footer } from "@/components/shared";
import { RoleGuard } from "@/components/shared/RoleGuard";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["PATIENT"]}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </RoleGuard>
  );
}
