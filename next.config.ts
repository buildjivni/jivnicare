import type { NextConfig } from "next";

// ── Build-time environment validation ─────────────────────────────────────────
// These checks run at build time on Vercel. If any critical secret is missing,
// the build will FAIL LOUDLY instead of deploying a broken app silently.
const requiredEnvVars = ["JWT_SECRET", "DATABASE_URL"];

if (process.env.NODE_ENV === "production") {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(
        `\n\n❌ FATAL BUILD ERROR: Missing required environment variable: ${envVar}\n` +
        `   Go to Vercel Dashboard → Settings → Environment Variables and add it.\n\n`
      );
    }
  }
}

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 1 month
    // Locked down to specific trusted domains only
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/photo-**', // Only actual photos, not arbitrary paths
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      }
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
