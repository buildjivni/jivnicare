import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      // {
      //   // Long-lived cache for immutable static assets
      //   source: "/_next/static/(.*)",
      //   headers: [
      //     {
      //       key: "Cache-Control",
      //       value: "public, max-age=31536000, immutable",
      //     },
      //   ],
      // },
    ];
  },

  // ── External Server Packages (Prisma, bcryptjs) ────────────────────────────
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
