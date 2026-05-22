import type { NextConfig } from "next";
import { assertProductionEnv } from "./src/lib/infrastructure/env";

try {
  assertProductionEnv();
} catch (e) {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    console.error(e instanceof Error ? e.message : e);
    throw e;
  }
}

const nextConfig: NextConfig = {
  // ── Tech Stack Obfuscation ──────────────────────────────────────────────────
  poweredByHeader: false,

  // ── Image Optimization ──────────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 1 month
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/photo-**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
      {
        // Used for texture backgrounds in PartnerCtaSection and confirmation
        protocol: 'https',
        hostname: 'www.transparenttextures.com',
        pathname: '/patterns/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
  },

  // ── TypeScript ─────────────────────────────────────────────────────────────
  typescript: {
    // TSC passes cleanly — keep this false in production for correctness
    ignoreBuildErrors: false,
  },

  // ── Production Security Headers ─────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      // NOTE: Do NOT set Cache-Control for /_next/static in dev — it breaks Turbopack HMR.
      // In production (Vercel/CDN), these are handled automatically with content-hashing.
    ];
  },

  // ── External Server Packages (Prisma, bcryptjs) ────────────────────────────
  serverExternalPackages: ["@prisma/client", "bcryptjs", "firebase-admin"],
};

export default nextConfig;
