/**
 * SEO Utilities for QuantumPoly
 *
 * Centralized SEO metadata generation with full internationalization support.
 * Provides type-safe functions to retrieve SEO config for any route/locale combination.
 *
 * @module seo
 */

import { type Locale, defaultLocale, isValidLocale } from '@/i18n';

import {
  getCanonicalUrl,
  getAlternateLanguages,
  getOgLocale,
  DEFAULT_OG_IMAGE,
  DEFAULT_TWITTER_HANDLE,
} from './seo-config';

/**
 * Valid route paths for SEO metadata
 * Must match PUBLIC_ROUTES in lib/routes.ts
 */
export type SEORoute = '/' | '/ethics' | '/privacy' | '/imprint' | '/gep';

/**
 * Complete SEO configuration for a page
 * Compatible with Next.js 14 Metadata API
 */
export interface SEOConfig {
  /** Page title (used in <title> tag) */
  title: string;
  /** Meta description */
  description: string;
  /** Comma-separated keywords for SEO */
  keywords?: string;
  /** Robots directive (e.g., 'index, follow') */
  robots?: string;
  /** Open Graph metadata */
  openGraph: {
    title: string;
    description: string;
    locale: string;
    type: 'website' | 'article';
    images?: Array<{ url: string; alt: string }>;
  };
  /** Twitter Card metadata */
  twitter: {
    card: 'summary_large_image' | 'summary';
    title: string;
    description: string;
    site?: string;
  };
  /** Alternate language versions and canonical URL */
  alternates: {
    canonical: string;
    languages: Record<Locale, string>;
  };
}

/**
 * Structure of SEO locale files (seo.json)
 */
interface SEOLocaleData {
  global: {
    siteName: string;
    defaultTitle: string;
    defaultDescription: string;
    keywords: string;
    ogImage: string;
    twitterHandle: string;
  };
  [key: `section:${string}`]: {
    titleSuffix?: string;
    description?: string;
    keywords?: string;
  };
  [key: `page:${string}`]: {
    title?: string;
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
    keywords?: string;
    robots?: string;
  };
}

/**
 * Cache for loaded SEO locale data
 * Prevents redundant file reads during SSR
 */
const seoLocaleCache = new Map<Locale, SEOLocaleData>();

/**
 * Load SEO locale data from JSON file
 *
 * @param locale - Target locale
 * @returns SEO locale data
 * @throws Error if file cannot be loaded
 */
async function loadSeoLocale(locale: Locale): Promise<SEOLocaleData> {
  // Check cache first
  if (seoLocaleCache.has(locale)) {
    return seoLocaleCache.get(locale)!;
  }

  try {
    // Dynamically import the locale data
    const data = (await import(`@/locales/${locale}/seo.json`)) as SEOLocaleData;
    seoLocaleCache.set(locale, data);
    return data;
  } catch (error) {
    // Fallback to English if locale file not found
    if (locale !== defaultLocale) {
      console.warn(`SEO locale file not found for '${locale}', falling back to '${defaultLocale}'`);
      return loadSeoLocale(defaultLocale);
    }

    // If even English fails, throw error
    throw new Error(`Failed to load SEO locale data for '${locale}': ${error}`);
  }
}

/**
 * Get SEO configuration for a specific route and locale
 *
 * Implements fallback hierarchy:
 * 1. Page-specific overrides (page:/route)
 * 2. Section defaults (section:about, section:vision)
 * 3. Global defaults
 * 4. English locale (if current locale fails)
 *
 * @param route - The route path
 * @param locale - The locale code
 * @returns Complete SEO configuration
 *
 * @example
 * ```ts
 * const seo = await getSeoForRoute('/ethics', 'de');
 * // Returns SEO config with German metadata for ethics page
 * ```
 */
export async function getSeoForRoute(route: SEORoute, locale: Locale): Promise<SEOConfig> {
  // Validate locale
  if (!isValidLocale(locale)) {
    console.warn(`Invalid locale '${locale}', using default '${defaultLocale}'`);
    locale = defaultLocale;
  }

  // Load locale data
  const seoData = await loadSeoLocale(locale);
  const { global } = seoData;

  // Determine page key and section key
  const pageKey = `page:${route}` as keyof SEOLocaleData;
  const sectionKey = determineSectionKey(route);

  // Get page-specific data (if exists)
  const pageData = seoData[pageKey] as SEOLocaleData[`page:${string}`] | undefined;

  // Get section-specific data (if exists)
  const sectionData = sectionKey
    ? (seoData[sectionKey] as SEOLocaleData[`section:${string}`] | undefined)
    : undefined;

  // Build SEO config with fallback hierarchy
  const title =
    pageData?.title || sectionData?.titleSuffix
      ? `${sectionData?.titleSuffix || route} | ${global.siteName}`
      : global.defaultTitle;

  const description =
    pageData?.description || sectionData?.description || global.defaultDescription;

  const keywords = pageData?.keywords || sectionData?.keywords || global.keywords;

  const ogTitle = pageData?.ogTitle || pageData?.title || title;
  const ogDescription = pageData?.ogDescription || description;

  const robots = pageData?.robots || 'index, follow';

  // Determine Open Graph type
  const ogType: 'website' | 'article' = route === '/' ? 'website' : 'article';

  // Generate URLs
  const canonical = getCanonicalUrl(route, locale);
  const languages = getAlternateLanguages(route);
  const ogLocale = getOgLocale(locale);

  return {
    title,
    description,
    keywords,
    robots,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      locale: ogLocale,
      type: ogType,
      images: [
        {
          url: global.ogImage || DEFAULT_OG_IMAGE,
          alt: global.siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      site: global.twitterHandle || DEFAULT_TWITTER_HANDLE,
    },
    alternates: {
      canonical,
      languages,
    },
  };
}

/**
 * Determine section key for a route
 * Maps routes to their section identifiers
 *
 * @param _route - The route path
 * @returns Section key or undefined
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function determineSectionKey(_route: SEORoute): keyof SEOLocaleData | undefined {
  // Policy pages and homepage don't use sections (they have direct page overrides)
  // Future: Add section mappings for /about and /vision when implemented
  return undefined;
}

/**
 * Validate if a string is a valid SEO route
 *
 * @param route - Route to validate
 * @returns True if valid SEO route
 */
export function isValidSEORoute(route: string): route is SEORoute {
  const validRoutes: SEORoute[] = ['/', '/ethics', '/privacy', '/imprint', '/gep'];
  return validRoutes.includes(route as SEORoute);
}
