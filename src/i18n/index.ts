/**
 * Canonical i18n module for QuantumPoly
 *
 * Provides a minimal, framework-agnostic API for translations with
 * SSR safety and a clear missing-keys policy.
 */

// Preload known locale dictionaries statically for bundlers and SSR
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import enJson from '../../messages/en.json';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import deJson from '../../messages/de.json';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import trJson from '../../messages/tr.json';

export const locales = ['en', 'de', 'tr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  tr: 'Türkçe',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  de: '🇩🇪',
  tr: '🇹🇷',
};

export type Dict = Record<string, string | Record<string, unknown>>;

/**
 * Check if the provided locale is supported by the application.
 */
export function isValidLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale);
}

/**
 * Get text direction for the provided locale. Prepared for RTL support.
 */
export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  const rtlLocales: Locale[] = [];
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}

type Dictionaries = Partial<Record<Locale, Dict>> & Record<string, Dict | undefined>;

const dictionaries: Dictionaries = {
  en: enJson as unknown as Dict,
  de: deJson as unknown as Dict,
  tr: trJson as unknown as Dict,
};

let currentLocale: Locale = defaultLocale;

function getValueAtPath(obj: unknown, path: string): unknown {
  const segments = path.split('.');
  let cursor: any = obj as any;
  for (const segment of segments) {
    if (cursor == null || typeof cursor !== 'object') return undefined;
    cursor = cursor[segment];
  }
  return cursor;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_m, key) => (key in params ? String(params[key]) : `{${key}}`));
}

function handleMissingKey(key: string): never | void {
  const message = `i18n: Missing translation key "${key}" for locale "${currentLocale}"`;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(message);
  }
  // Development: warn with callsite if available
  // eslint-disable-next-line no-console
  console.warn(message, new Error().stack);
}

export interface I18n {
  /** Translate a dotted key with optional params and optional forced locale */
  t: (key: string, params?: Record<string, string | number>, locale?: Locale) => string;
  /** Check if a translation key exists for the active (or provided) locale */
  hasKey: (key: string, locale?: Locale) => boolean;
  /** Set the active locale */
  setLocale: (locale: Locale) => void;
  /** Get the active locale */
  getLocale: () => Locale;
  /** Load or override a dictionary for a given locale */
  loadLocale: (locale: Locale, dict: Dict) => void;
}

/**
 * Singleton i18n instance implementing the minimal API.
 */
export const i18n: I18n = {
  t: (key, params, forcedLocale) => {
    const effectiveLocale = forcedLocale ?? currentLocale;
    const dict = dictionaries[effectiveLocale];
    const value = getValueAtPath(dict, key);
    if (typeof value === 'string') return interpolate(value, params);
    if (value == null) return (handleMissingKey(key) as unknown) as string;
    // If non-string object encountered, treat as missing leaf
    return (handleMissingKey(key) as unknown) as string;
  },
  hasKey: (key, forcedLocale) => {
    const effectiveLocale = forcedLocale ?? currentLocale;
    const dict = dictionaries[effectiveLocale];
    const value = getValueAtPath(dict, key);
    return typeof value === 'string';
  },
  setLocale: (locale: Locale) => {
    if (!isValidLocale(locale)) {
      // Allow setting unknown locales only if they were explicitly loaded
      if (!dictionaries[locale]) {
        throw new Error(`Unsupported locale: ${locale}`);
      }
    }
    currentLocale = locale;
  },
  getLocale: () => currentLocale,
  loadLocale: (locale: Locale, dict: Dict) => {
    dictionaries[locale] = dict;
  },
};

// Optional alias when keeping request.ts as a thin re-export
export { i18n as requestI18n };


