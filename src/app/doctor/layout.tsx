"use client";


import { RoleGuard } from "@/components/shared";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["DOCTOR"]}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* <DoctorHeader /> removed to prevent layout duplication */}
        <main className="flex-1">{children}</main>
      </div>
    </RoleGuard>
  );
}
