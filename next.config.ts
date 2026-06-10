import type { NextConfig } from "next";
// @ts-expect-error - next-pwa missing types
import withPWA from 'next-pwa';

// ── Startup Environment Validation ──────────────────────────────────────────
const requiredEnvVars = ["JWT_SECRET", "DATABASE_URL"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`
    ❌ Invalid/Missing Environment Variables:
    The following required environment variables are missing:
    ${missingEnvVars.join(", ")}
    Please define them in your .env.local file or Vercel environment before starting the app.
  `);
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
        pathname: '/jivnicare/**',
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

  // ── Turbopack Compatibility ─────────────────────────────────────────────
  turbopack: {},
};

const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

export default pwaConfig(nextConfig);
