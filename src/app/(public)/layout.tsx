"use client";

import { usePathname } from "next/navigation";
import { Header, Footer, PublicGuard } from "@/components/shared";

const HIDE_SYSTEM_LAYOUT_ROUTES = [
  "/login",
  "/partners/login",
  "/partners/onboard",
  "/partners/forgot-password"
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHidden = HIDE_SYSTEM_LAYOUT_ROUTES.some(route => pathname === route);

  return (
    <PublicGuard>
      {!isHidden && <Header />}
      <main className="flex-1">{children}</main>
      {!isHidden && <Footer />}
    </PublicGuard>
  );
}
