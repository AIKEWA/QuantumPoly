import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Supported locales for QuantumPoly
export const locales = ['en', 'de', 'tr'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'en';

// Locale labels for display
export const localeLabels: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  tr: 'Türkçe',
};

// Validate locale helper
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// next-intl configuration
// eslint-disable-next-line import/no-default-export -- Required by next-intl
export default getRequestConfig(async ({ locale }) => {
  // Validate incoming locale parameter
  if (!locale || !isValidLocale(locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`./locales/${locale}/index.ts`)).default,
  };
});

