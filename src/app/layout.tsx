import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/shared/GoogleAnalytics";
import { SITE_CONFIG } from "@/lib/seo/metadata";
import { websiteSchema, organizationSchema } from "@/lib/seo/jsonld";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// ── Root Metadata ─────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL('https://www.jinnicare.com'),
  title: 'JivniCare — Book Top Doctors in Bihar',
  description: 'Bihar mein top doctors ko instantly book karein. Verified specialists in Jamui, Deoghar aur pure Bihar mein.',
  keywords: [
    "book doctor Bihar",
    "doctor appointment Patna",
    "best hospital Patna",
    "healthcare Bihar",
    "specialist doctor Bihar",
    "emergency hospital Bihar",
    "JivniCare",
    "online doctor booking Bihar",
    "verified doctor Bihar",
  ].join(", "),
  authors: [{ name: "JivniCare", url: SITE_CONFIG.baseUrl }],
  creator: "JivniCare",
  publisher: "JivniCare",
  formatDetection: { telephone: true, email: true, address: true },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.baseUrl,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} — Book Top Doctors in Bihar`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: "/icon.svg",
        width: 1200,
        height: 630,
        alt: "JivniCare — Healthcare Discovery for Bihar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_CONFIG.twitterHandle,
    creator: SITE_CONFIG.twitterHandle,
    title: `${SITE_CONFIG.name} — Book Top Doctors in Bihar`,
    description: SITE_CONFIG.description,
    images: ["/icon.svg"],
  },
  alternates: {
    canonical: SITE_CONFIG.baseUrl,
  },
  verification: {
    // Add your Google Search Console verification token here
    // google: "your-verification-token",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: SITE_CONFIG.themeColor,
};

import { AuthProvider } from "@/components/providers/AuthProvider";
import { MonitoringProvider } from "@/components/providers/MonitoringProvider";
import { OperationalErrorBoundary } from "@/components/providers/OperationalErrorBoundary";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi-IN" className={`${geistSans.variable} antialiased`}>
      <head>
        {/* Website + Sitelinks Searchbox */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
        />
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden"
      >
        <MonitoringProvider />
        <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GA_ID || ""} />
        <OperationalErrorBoundary>
          <AuthProvider>
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </AuthProvider>
        </OperationalErrorBoundary>
      </body>
    </html>
  );
}
