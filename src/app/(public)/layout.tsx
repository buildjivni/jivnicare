"use client";

import { usePathname } from "next/navigation";
import { Header, Footer } from "@/components/shared";

const HIDE_SYSTEM_LAYOUT_ROUTES = [
  "/login",
  "/partners/login",
  "/partners/onboard",
  "/partners/forgot-password"
];

function PublicLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHidden = HIDE_SYSTEM_LAYOUT_ROUTES.some(route => pathname === route || pathname.startsWith(route + "?"));

  return (
    <>
      {!isHidden && <Header />}
      <main className="flex-1">{children}</main>
      {!isHidden && <Footer />}
    </>
  );
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicLayoutShell>{children}</PublicLayoutShell>
  );
}
