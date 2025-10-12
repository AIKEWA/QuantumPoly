/**
 * Internationalization Formatting Utilities
 * 
 * Type-safe wrappers around the native Intl API for consistent
 * locale-aware formatting across the application.
 * 
 * Features:
 * - Date and time formatting
 * - Number formatting
 * - Currency formatting
 * - Relative time formatting
 * - Percentage formatting
 * - List formatting
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
 */

import type { Locale } from '@/i18n';

/**
 * Format a date according to the locale
 * 
 * @example
 * formatDate(new Date('2024-01-15'), 'en') // "January 15, 2024"
 * formatDate(new Date('2024-01-15'), 'de') // "15. Januar 2024"
 */
export function formatDate(
  date: Date | number | string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    dateStyle: 'long',
  };

  return new Intl.DateTimeFormat(locale, {
    ...defaultOptions,
    ...options,
  }).format(dateObj);
}

/**
 * Format a date and time according to the locale
 * 
 * @example
 * formatDateTime(new Date(), 'en') // "January 15, 2024 at 3:45 PM"
 * formatDateTime(new Date(), 'de') // "15. Januar 2024 um 15:45"
 */
export function formatDateTime(
  date: Date | number | string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    dateStyle: 'long',
    timeStyle: 'short',
  };

  return new Intl.DateTimeFormat(locale, {
    ...defaultOptions,
    ...options,
  }).format(dateObj);
}

/**
 * Format a time according to the locale
 * 
 * @example
 * formatTime(new Date(), 'en') // "3:45 PM"
 * formatTime(new Date(), 'de') // "15:45"
 */
export function formatTime(
  date: Date | number | string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeStyle: 'short',
  };

  return new Intl.DateTimeFormat(locale, {
    ...defaultOptions,
    ...options,
  }).format(dateObj);
}

/**
 * Format a number according to the locale
 * 
 * @example
 * formatNumber(1234.56, 'en') // "1,234.56"
 * formatNumber(1234.56, 'de') // "1.234,56"
 */
export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format a currency amount according to the locale
 * 
 * @example
 * formatCurrency(99.99, 'en', 'USD') // "$99.99"
 * formatCurrency(99.99, 'de', 'EUR') // "99,99 €"
 */
export function formatCurrency(
  amount: number,
  locale: Locale,
  currency: string = 'EUR',
  options?: Intl.NumberFormatOptions
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      ...options,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currency codes
    console.warn(`Unsupported currency: ${currency}, falling back to EUR`);
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      ...options,
    }).format(amount);
  }
}

/**
 * Format a percentage according to the locale
 * 
 * @example
 * formatPercent(0.1556, 'en') // "15.56%"
 * formatPercent(0.1556, 'de') // "15,56 %"
 */
export function formatPercent(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/**
 * Format a compact number (e.g., 1.2K, 1.5M)
 * 
 * @example
 * formatCompactNumber(1234, 'en') // "1.2K"
 * formatCompactNumber(1234567, 'de') // "1,2 Mio."
 */
export function formatCompactNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    ...options,
  }).format(value);
}

/**
 * Calculate time difference units
 */
function getTimeDifference(date: Date): {
  value: number;
  unit: Intl.RelativeTimeFormatUnit;
} {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffWeeks = Math.round(diffDays / 7);
  const diffMonths = Math.round(diffDays / 30);
  const diffYears = Math.round(diffDays / 365);

  if (Math.abs(diffYears) >= 1) {
    return { value: diffYears, unit: 'year' };
  }
  if (Math.abs(diffMonths) >= 1) {
    return { value: diffMonths, unit: 'month' };
  }
  if (Math.abs(diffWeeks) >= 1) {
    return { value: diffWeeks, unit: 'week' };
  }
  if (Math.abs(diffDays) >= 1) {
    return { value: diffDays, unit: 'day' };
  }
  if (Math.abs(diffHours) >= 1) {
    return { value: diffHours, unit: 'hour' };
  }
  if (Math.abs(diffMinutes) >= 1) {
    return { value: diffMinutes, unit: 'minute' };
  }
  return { value: diffSeconds, unit: 'second' };
}

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 * 
 * @example
 * formatRelativeTime(yesterday, 'en') // "yesterday"
 * formatRelativeTime(tomorrow, 'de') // "morgen"
 */
export function formatRelativeTime(
  date: Date | number | string,
  locale: Locale,
  options?: Intl.RelativeTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  const { value, unit } = getTimeDifference(dateObj);

  return new Intl.RelativeTimeFormat(locale, {
    numeric: 'auto',
    ...options,
  }).format(value, unit);
}

/**
 * Format a list of items according to locale conventions
 * 
 * @example
 * formatList(['apples', 'oranges', 'bananas'], 'en') // "apples, oranges, and bananas"
 * formatList(['Äpfel', 'Orangen', 'Bananen'], 'de') // "Äpfel, Orangen und Bananen"
 */
export function formatList(
  items: string[],
  locale: Locale,
  options?: Intl.ListFormatOptions
): string {
  return new Intl.ListFormat(locale, {
    style: 'long',
    type: 'conjunction',
    ...options,
  }).format(items);
}

/**
 * Format a file size in bytes to human-readable format
 * 
 * @example
 * formatFileSize(1024, 'en') // "1 KB"
 * formatFileSize(1048576, 'de') // "1 MB"
 */
export function formatFileSize(
  bytes: number,
  locale: Locale,
  decimals: number = 2
): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${formatNumber(value, locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} ${sizes[i]}`;
}

/**
 * Format a date range according to locale
 * 
 * @example
 * formatDateRange(start, end, 'en') // "Jan 1 – 15, 2024"
 * formatDateRange(start, end, 'de') // "1.–15. Jan. 2024"
 */
export function formatDateRange(
  startDate: Date | number | string,
  endDate: Date | number | string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const startObj = typeof startDate === 'string' || typeof startDate === 'number'
    ? new Date(startDate)
    : startDate;
  
  const endObj = typeof endDate === 'string' || typeof endDate === 'number'
    ? new Date(endDate)
    : endDate;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat(locale, {
    ...defaultOptions,
    ...options,
  }).formatRange(startObj, endObj);
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 * Note: This is primarily for English; other locales may handle differently
 * 
 * @example
 * formatOrdinal(1, 'en') // "1st"
 * formatOrdinal(22, 'en') // "22nd"
 */
export function formatOrdinal(value: number, locale: Locale): string {
  // For locales other than English, just return the number
  // (proper ordinal support varies by language)
  if (locale !== 'en') {
    return value.toString();
  }

  const pr = new Intl.PluralRules('en-US', { type: 'ordinal' });
  const suffixes = new Map([
    ['one', 'st'],
    ['two', 'nd'],
    ['few', 'rd'],
    ['other', 'th'],
  ]);

  const rule = pr.select(value);
  const suffix = suffixes.get(rule) || 'th';

  return `${value}${suffix}`;
}

/**
 * Format a number range
 * 
 * @example
 * formatNumberRange(1, 10, 'en') // "1–10"
 * formatNumberRange(1000, 5000, 'de') // "1.000–5.000"
 */
export function formatNumberRange(
  start: number,
  end: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  const formatter = new Intl.NumberFormat(locale, options);
  
  // @ts-expect-error - formatRange is available but not in all TypeScript definitions
  if (typeof formatter.formatRange === 'function') {
    // @ts-expect-error - formatRange is available but not in all TypeScript definitions
    return formatter.formatRange(start, end);
  }
  
  // Fallback for browsers that don't support formatRange
  return `${formatter.format(start)}–${formatter.format(end)}`;
}

