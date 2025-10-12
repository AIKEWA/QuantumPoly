/**
 * Locale-Specific Configuration
 * 
 * Centralized configuration for locale-specific settings such as:
 * - Default currencies
 * - First day of week
 * - Date format preferences
 * - Number formatting preferences
 * - Timezone preferences
 */

import type { Locale } from '@/i18n';

export interface LocaleSettings {
  /** Default currency code (ISO 4217) */
  currency: string;
  
  /** First day of week (0 = Sunday, 1 = Monday, etc.) */
  firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  
  /** Human-readable date format pattern (for display purposes) */
  dateFormat: string;
  
  /** Preferred timezone (IANA timezone identifier) */
  timezone?: string;
  
  /** Measurement system */
  measurementSystem: 'metric' | 'imperial';
}

/**
 * Locale-specific settings
 * 
 * @see https://en.wikipedia.org/wiki/ISO_4217 (Currency codes)
 * @see https://en.wikipedia.org/wiki/ISO_8601 (Date formats)
 */
export const localeSettings: Record<Locale, LocaleSettings> = {
  en: {
    currency: 'USD',
    firstDayOfWeek: 0, // Sunday
    dateFormat: 'MM/DD/YYYY',
    timezone: 'America/New_York',
    measurementSystem: 'imperial',
  },
  de: {
    currency: 'EUR',
    firstDayOfWeek: 1, // Monday
    dateFormat: 'DD.MM.YYYY',
    timezone: 'Europe/Berlin',
    measurementSystem: 'metric',
  },
  tr: {
    currency: 'TRY',
    firstDayOfWeek: 1, // Monday
    dateFormat: 'DD.MM.YYYY',
    timezone: 'Europe/Istanbul',
    measurementSystem: 'metric',
  },
  es: {
    currency: 'EUR',
    firstDayOfWeek: 1, // Monday
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Europe/Madrid',
    measurementSystem: 'metric',
  },
  fr: {
    currency: 'EUR',
    firstDayOfWeek: 1, // Monday
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Europe/Paris',
    measurementSystem: 'metric',
  },
  it: {
    currency: 'EUR',
    firstDayOfWeek: 1, // Monday
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Europe/Rome',
    measurementSystem: 'metric',
  },
};

/**
 * Get locale settings for a specific locale
 */
export function getLocaleSettings(locale: Locale): LocaleSettings {
  return localeSettings[locale] || localeSettings.en;
}

/**
 * Get default currency for a locale
 */
export function getLocaleCurrency(locale: Locale): string {
  return getLocaleSettings(locale).currency;
}

/**
 * Get first day of week for a locale
 */
export function getLocaleFirstDayOfWeek(locale: Locale): number {
  return getLocaleSettings(locale).firstDayOfWeek;
}

/**
 * Get date format pattern for a locale
 */
export function getLocaleDateFormat(locale: Locale): string {
  return getLocaleSettings(locale).dateFormat;
}

/**
 * Get timezone for a locale
 */
export function getLocaleTimezone(locale: Locale): string | undefined {
  return getLocaleSettings(locale).timezone;
}

/**
 * Get measurement system for a locale
 */
export function getLocaleMeasurementSystem(
  locale: Locale
): 'metric' | 'imperial' {
  return getLocaleSettings(locale).measurementSystem;
}

/**
 * Common currency symbols
 */
export const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  TRY: '₺',
  CHF: 'CHF',
  CAD: 'C$',
  AUD: 'A$',
  CNY: '¥',
  INR: '₹',
  RUB: '₽',
};

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currencyCode: string): string {
  return currencySymbols[currencyCode.toUpperCase()] || currencyCode;
}

