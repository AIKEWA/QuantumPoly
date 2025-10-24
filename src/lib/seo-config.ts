/**
 * SEO Configuration Constants and Helpers
 *
 * Centralized configuration for SEO metadata generation across the QuantumPoly site.
 * Provides locale mappings, URL helpers, and default values for Open Graph and Twitter Cards.
 *
 * @module seo-config
 */

import { type Locale, locales } from '@/i18n';

/**
 * Default Open Graph image path
 * Used as fallback when no page-specific image is provided
 */
export const DEFAULT_OG_IMAGE = '/og-image.jpg';

/**
 * Maps our internal locale codes to Open Graph locale format
 *
 * @see https://ogp.me/#optional
 */
export const LOCALE_TO_OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  de: 'de_DE',
  tr: 'tr_TR',
  es: 'es_ES',
  fr: 'fr_FR',
  it: 'it_IT',
} as const;

/**
 * Default Twitter handle for the site
 */
export const DEFAULT_TWITTER_HANDLE = '@quantumpoly';

/**
 * Get the base site URL from environment variable or fallback
 *
 * @returns Base URL for the site (without trailing slash)
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://www.quantumpoly.com';
}

/**
 * Generate canonical URL for a given route and locale
 *
 * @param route - The route path (e.g., '/', '/ethics')
 * @param locale - The locale code
 * @returns Full canonical URL
 *
 * @example
 * ```ts
 * getCanonicalUrl('/ethics', 'de') // 'https://www.quantumpoly.com/de/ethics'
 * getCanonicalUrl('/', 'en') // 'https://www.quantumpoly.com/en'
 * ```
 */
export function getCanonicalUrl(route: string, locale: Locale): string {
  const baseUrl = getSiteUrl();
  const normalizedRoute = route === '/' ? '' : route;
  return `${baseUrl}/${locale}${normalizedRoute}`;
}

/**
 * Generate alternate language URLs for all supported locales
 *
 * @param route - The route path (e.g., '/', '/ethics')
 * @returns Record mapping each locale to its full URL
 *
 * @example
 * ```ts
 * getAlternateLanguages('/privacy')
 * // {
 * //   en: 'https://www.quantumpoly.com/en/privacy',
 * //   de: 'https://www.quantumpoly.com/de/privacy',
 * //   ...
 * // }
 * ```
 */
export function getAlternateLanguages(route: string): Record<Locale, string> {
  const normalizedRoute = route === '/' ? '' : route;
  const baseUrl = getSiteUrl();

  return locales.reduce(
    (acc, locale) => {
      acc[locale] = `${baseUrl}/${locale}${normalizedRoute}`;
      return acc;
    },
    {} as Record<Locale, string>,
  );
}

/**
 * Convert internal locale code to Open Graph locale format
 *
 * @param locale - Internal locale code
 * @returns Open Graph locale string
 *
 * @example
 * ```ts
 * getOgLocale('en') // 'en_US'
 * getOgLocale('de') // 'de_DE'
 * ```
 */
export function getOgLocale(locale: Locale): string {
  return LOCALE_TO_OG_LOCALE[locale];
}
