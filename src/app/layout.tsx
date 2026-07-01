import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/shared/GoogleAnalytics";
import { SITE_CONFIG } from "@/lib/seo/metadata";
import { websiteSchema, organizationSchema } from "@/lib/seo/jsonld";
import { BRAND_ASSETS } from "@/features/marketing/components/brand/brandAssets";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

// ── Root Metadata ─────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL('https://www.jinnicare.com'),
  title: 'JivniCare — Book Verified Doctors & Specialists',
  description: 'Verified specialists in Jamui, Deoghar, Bihar, and Jharkhand. Find and book top doctors instantly on JivniCare.',
  keywords: [
    "book doctor Bihar",
    "book doctor Jharkhand",
    "doctor appointment Patna",
    "doctor Deoghar",
    "doctor Jamui",
    "healthcare discovery",
    "specialist doctor search",
    "JivniCare",
    "online doctor booking",
    "verified doctor network",
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
    title: `${SITE_CONFIG.name} — Book Verified Doctors & Specialists`,
    description: SITE_CONFIG.description,
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_CONFIG.twitterHandle,
    creator: SITE_CONFIG.twitterHandle,
    title: `${SITE_CONFIG.name} — Book Verified Doctors & Specialists`,
    description: SITE_CONFIG.description,
  },
  alternates: {
    canonical: SITE_CONFIG.baseUrl,
  },
  verification: {
    // Add your Google Search Console verification token here
    // google: "your-verification-token",
  },
  icons: {
    icon: [
      { url: BRAND_ASSETS.favicon.master, type: "image/svg+xml" },
      { url: BRAND_ASSETS.favicon.png16, sizes: "16x16", type: "image/png" }
    ],
    apple: [
      { url: BRAND_ASSETS.appIcon.png180, sizes: "180x180", type: "image/png" }
    ]
  }
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
    <html lang="hi-IN" className={`${inter.variable} ${outfit.variable} antialiased`}>
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
