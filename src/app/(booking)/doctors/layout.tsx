import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Doctors in Bihar | JivniCare",
  description: "Search and book appointments with verified doctors and specialists near you in Bihar.",
  openGraph: {
    title: "Find Doctors in Bihar | JivniCare",
    description: "Search and book appointments with verified doctors and specialists near you in Bihar.",
    type: "website",
  }
};

export default function DoctorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
