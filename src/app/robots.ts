import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo/metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/admin/',
        '/doctor/dashboard/',
        '/checkout/',
        '/api/',
        '/internal-admin/',
        '/login/',
        '/d/',          // QR shortCode resolver — not indexable content
        '/my-bookings/', // Private patient data
        '/confirmation/', // Post-booking confirmation
      ],
    },
    sitemap: `${SITE_CONFIG.baseUrl}/sitemap.xml`,
  };
}
