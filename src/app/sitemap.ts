import { MetadataRoute } from 'next';

import { locales } from '@/i18n';
import { PUBLIC_ROUTES } from '@/lib/routes';

/**
 * Sitemap generation for SEO coverage with full internationalization support
 *
 * Generates sitemap entries for all public routes across all supported locales.
 * Each entry includes hreflang alternates for proper multi-language SEO.
 *
 * Features:
 * - Full locale coverage (en, de, tr, es, fr, it)
 * - hreflang alternates for each URL
 * - x-default fallback (points to English)
 * - Environment-aware base URL
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 * @see https://developers.google.com/search/docs/specialty/international/localized-versions
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.quantumpoly.com';
  const currentDate = new Date().toISOString();

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Generate entries for each public route
  for (const route of PUBLIC_ROUTES) {
    // Normalize route for URL construction (remove leading slash for non-root)
    const normalizedRoute = route === '/' ? '' : route;

    // Build alternate language URLs for all supported locales
    const languages: Record<string, string> = {};

    // Add x-default pointing to English version (recommended by Google)
    languages['x-default'] = `${baseUrl}/en${normalizedRoute}`;

    // Add all locale-specific URLs
    for (const locale of locales) {
      languages[locale] = `${baseUrl}/${locale}${normalizedRoute}`;
    }

    // Primary URL uses English as canonical (you can adjust this policy)
    const canonicalUrl = `${baseUrl}/en${normalizedRoute}`;

    // Determine priority based on route importance
    let priority = 0.7; // Default for policy pages
    if (route === '/') {
      priority = 1.0; // Homepage is highest priority
    } else if (route === '/privacy') {
      priority = 0.8; // Privacy is important for compliance
    }

    // Determine change frequency
    const changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] =
      route === '/' ? 'weekly' : 'monthly';

    sitemapEntries.push({
      url: canonicalUrl,
      lastModified: currentDate,
      changeFrequency,
      priority,
      alternates: {
        languages,
      },
    });
  }

  return sitemapEntries;
}
