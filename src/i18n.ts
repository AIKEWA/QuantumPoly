import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Supported locales for QuantumPoly
export const locales = ['en', 'de', 'tr', 'es', 'fr', 'it'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'en';

// Locale labels for display
export const localeLabels: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  tr: 'Türkçe',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
};

// Text direction for each locale (LTR or RTL)
export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  de: 'ltr',
  tr: 'ltr',
  es: 'ltr',
  fr: 'ltr',
  it: 'ltr',
  // Future RTL languages:
  // ar: 'rtl',
  // he: 'rtl',
  // fa: 'rtl',
};

// Locale fallback configuration (for regional variants)
export const localeFallbacks: Record<string, Locale> = {
  'es-MX': 'es',
  'es-AR': 'es',
  'es-ES': 'es',
  'fr-CA': 'fr',
  'fr-FR': 'fr',
  'it-IT': 'it',
  'de-DE': 'de',
  'de-AT': 'de',
  'de-CH': 'de',
  'en-US': 'en',
  'en-GB': 'en',
  'en-CA': 'en',
  'tr-TR': 'tr',
};

// Validate locale helper
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// Get text direction for a locale
export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return localeDirections[locale] || 'ltr';
}

// Get fallback locale for a regional variant
export function getFallbackLocale(locale: string): Locale {
  return localeFallbacks[locale] || defaultLocale;
}

// next-intl configuration
// eslint-disable-next-line import/no-default-export -- Required by next-intl
export default getRequestConfig(async ({ locale: localeParam }) => {
  // Dynamically import headers to avoid client component issues
  const { headers } = await import('next/headers');
  
  // In next-intl v4 with Next.js 14, we need to extract locale from headers
  // The middleware sets the x-next-intl-locale header
  const headersList = await headers();
  const localeFromHeader = headersList.get('x-next-intl-locale');
  
  // Try locale parameter first, then header, then extract from pathname
  let locale = localeParam || localeFromHeader;
  
  // If still no locale, try to extract from the pathname
  if (!locale) {
    const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || '';
    const match = pathname.match(/^\/([a-z]{2})(\/|$)/);
    locale = match?.[1] || defaultLocale;
  }
  
  // Validate locale
  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = (await import(`./locales/${locale}/index.ts`)).default;

  return {
    locale,
    messages,
  };
});

