/**
 * Internationalization utilities for QuantumPoly
 *
 * This module provides type-safe translation functions and locale management
 * following Next.js i18n best practices and the project's clean code standards.
 *
 * @module i18n
 * @version 1.0.0
 * @author QuantumPoly Development Team
 */

import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';

// REVIEW: Consider adding support for pluralization rules and number formatting
export type Locale = 'en' | 'de' | 'fr' | 'es';

export interface TranslationKeys {
  nav: {
    home: string;
    about: string;
    vision: string;
    contact: string;
  };
  hero: {
    title: string;
    subtitle: string;
    cta: string;
  };
  about: {
    title: string;
    description: string;
  };
  vision: {
    title: string;
    description: string;
  };
  newsletter: {
    title: string;
    description: string;
    placeholder: string;
    subscribe: string;
    success: string;
    error: string;
  };
  footer: {
    copyright: string;
    privacy: string;
    terms: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    close: string;
  };
}

/**
 * Default locale configuration
 */
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Available locales
 */
export const SUPPORTED_LOCALES: Locale[] = ['en', 'de', 'fr', 'es'];

/**
 * Locale display names for UI components
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
};

/**
 * Hook for accessing translation functions and locale management
 *
 * @returns Object containing translation function and locale utilities
 *
 * @example
 * ```tsx
 * const { t, locale, changeLocale } = useTranslation();
 *
 * return (
 *   <div>
 *     <h1>{t('hero.title')}</h1>
 *     <button onClick={() => changeLocale('de')}>
 *       Switch to German
 *     </button>
 *   </div>
 * );
 * ```
 */
export function useTranslation() {
  const router = useRouter();
  const { locale = DEFAULT_LOCALE, asPath, push } = router;

  // FEEDBACK: Monitor translation loading performance in production
  const translations = useMemo(() => {
    try {
      // Dynamic import would be better here but requires async handling
      return require(`../locales/${locale}/common.json`) as TranslationKeys;
    } catch (error) {
      console.warn(`Failed to load translations for locale: ${locale}`, error);
      return require(
        `../locales/${DEFAULT_LOCALE}/common.json`
      ) as TranslationKeys;
    }
  }, [locale]);

  /**
   * Translation function with type safety and nested key support
   *
   * @param key - Dot-notation key path to translation
   * @returns Translated string or key if translation not found
   */
  const t = useCallback(
    (key: string): string => {
      try {
        const keys = key.split('.');
        let value: any = translations;

        for (const k of keys) {
          value = value[k];
          if (value === undefined) {
            throw new Error(`Translation key not found: ${key}`);
          }
        }

        return String(value);
      } catch (error) {
        console.warn(`Translation missing for key: ${key}`, error);
        return key; // Fallback to key itself
      }
    },
    [translations]
  );

  /**
   * Change application locale
   *
   * @param newLocale - Target locale
   */
  const changeLocale = useCallback(
    (newLocale: Locale) => {
      if (!SUPPORTED_LOCALES.includes(newLocale)) {
        console.warn(`Unsupported locale: ${newLocale}`);
        return;
      }

      push(asPath, asPath, { locale: newLocale });
    },
    [asPath, push]
  );

  /**
   * Check if locale is right-to-left
   *
   * @param checkLocale - Locale to check (defaults to current locale)
   * @returns Boolean indicating RTL direction
   */
  const isRTL = useCallback(
    (checkLocale: Locale = locale as Locale): boolean => {
      // Add RTL languages as needed
      const rtlLocales: Locale[] = [];
      return rtlLocales.includes(checkLocale);
    },
    [locale]
  );

  return {
    t,
    locale: locale as Locale,
    changeLocale,
    isRTL,
    supportedLocales: SUPPORTED_LOCALES,
    localeNames: LOCALE_NAMES,
  };
}

/**
 * Server-side translation function for static generation
 *
 * @param locale - Target locale
 * @param key - Translation key
 * @returns Translated string
 */
export function getStaticTranslation(locale: Locale, key: string): string {
  try {
    const translations = require(
      `../locales/${locale}/common.json`
    ) as TranslationKeys;
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      value = value[k];
      if (value === undefined) {
        throw new Error(`Translation key not found: ${key}`);
      }
    }

    return String(value);
  } catch (error) {
    console.warn(
      `Static translation missing for key: ${key} in locale: ${locale}`,
      error
    );
    return key;
  }
}

/**
 * Format number according to locale
 *
 * @param value - Number to format
 * @param locale - Target locale
 * @param options - Intl.NumberFormat options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  locale: Locale = DEFAULT_LOCALE,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format date according to locale
 *
 * @param date - Date to format
 * @param locale - Target locale
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  locale: Locale = DEFAULT_LOCALE,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}
