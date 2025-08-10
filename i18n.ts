/**
 * next-intl Configuration for QuantumPoly
 *
 * This module configures internationalization using next-intl for the App Router.
 * Provides type-safe translations and locale routing for our multi-language support.
 *
 * @module i18n-config
 * @version 2.0.0
 * @author QuantumPoly Development Team
 */

import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Define supported locales with TypeScript safety
export const locales = ['en', 'de', 'tr'] as const;
export type Locale = (typeof locales)[number];

/**
 * Default locale configuration
 */
export const defaultLocale: Locale = 'en';

/**
 * Locale display names for UI components
 */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  tr: 'Türkçe',
};

/**
 * Locale flag emojis for visual identification
 */
export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  de: '🇩🇪',
  tr: '🇹🇷',
};

/**
 * Configure next-intl request handling
 *
 * This function is called for each request to load the appropriate
 * translation messages based on the current locale.
 */
export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  try {
    // Load messages for the current locale
    const messages = (await import(`./src/locales/${locale}.json`)).default;

    return {
      messages,
      // Optional: Configure time zone
      timeZone: 'Europe/Berlin',
      // Optional: Configure number formatting
      formats: {
        dateTime: {
          short: {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          },
        },
        number: {
          precise: {
            maximumFractionDigits: 5,
          },
        },
        list: {
          enumeration: {
            style: 'long',
            type: 'conjunction',
          },
        },
      },
    };
  } catch (error) {
    // FEEDBACK: Monitor translation loading errors in production
    console.error(`Failed to load messages for locale: ${locale}`, error);
    notFound();
  }
});

/**
 * Type definitions for translation keys
 *
 * This ensures type safety when accessing translation keys
 * throughout the application.
 */
export type Messages = typeof import('./src/locales/en.json');

// Export types for use in components
export type MessageKeys = keyof Messages;

/**
 * Helper function to check if a locale is supported
 *
 * @param locale - Locale to check
 * @returns Boolean indicating if locale is supported
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Get the opposite text direction for RTL languages
 * Note: Turkish and German use LTR, but this is prepared for future RTL support
 *
 * @param locale - Current locale
 * @returns Text direction
 */
export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  // Add RTL locales here when needed (e.g., Arabic, Hebrew)
  const rtlLocales: Locale[] = [];
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}
