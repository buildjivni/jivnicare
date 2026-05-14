import { Header, Footer, PublicGuard } from "@/components/shared";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicGuard>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </PublicGuard>
  );
}
