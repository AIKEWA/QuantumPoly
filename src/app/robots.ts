import { MetadataRoute } from 'next';

/**
 * Robots.txt generation with environment-aware crawling rules
 *
 * Implements security-conscious crawling policies:
 * - **Production**: Allows all crawlers, enables indexing
 * - **Non-production**: Blocks all crawlers, prevents accidental indexing
 *
 * Always includes sitemap reference for crawler discovery.
 *
 * Environment Detection:
 * - Uses NODE_ENV to determine production vs development
 * - Preview/staging environments are treated as non-production
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 * @see https://developers.google.com/search/docs/crawling-indexing/robots/intro
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.quantumpoly.com';
  const isProd = process.env.NODE_ENV === 'production';

  return {
    rules: {
      userAgent: '*',
      // Production: Allow all paths
      // Non-production: Disallow all paths (prevents indexing of dev/preview environments)
      allow: isProd ? '/' : '',
      disallow: isProd ? '' : '/',
    },
    // Always include sitemap for crawler discovery
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
