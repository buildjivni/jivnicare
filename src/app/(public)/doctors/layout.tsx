import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Verified Doctors & Specialists | JivniCare",
  description: "Search and book appointments with verified doctors and specialists in your city.",
  openGraph: {
    title: "Find Verified Doctors & Specialists | JivniCare",
    description: "Search and book appointments with verified doctors and specialists in your city.",
    type: "website",
  }
};

export default function DoctorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
