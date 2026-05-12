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
      ],
    },
    sitemap: `${SITE_CONFIG.baseUrl}/sitemap.xml`,
  };
}
