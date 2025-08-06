import { locales, defaultLocale } from '../i18n';
import { NextRequest } from 'next/server';
import { logLocaleDetection } from './debugLogging';

const LOCALE_COOKIE_NAME = 'preferred-locale';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

/**
 * Detect the user's preferred locale based on the following priority:
 * 1. URL path locale segment (if available)
 * 2. Cookie (if available)
 * 3. Accept-Language header
 * 4. Default locale
 */
export function detectLocale(request: NextRequest): string {
  // 1. Check URL path for locale - Use actual URL to avoid redirect loop issues
  const actualUrl = new URL(request.url);
  const pathname = actualUrl.pathname;
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length > 0 && isValidLocale(segments[0])) {
    logLocaleDetection(segments[0], 'url');
    return segments[0];
  }

  // 2. Check for locale cookie
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    logLocaleDetection(cookieLocale, 'cookie');
    return cookieLocale;
  }

  // 3. Check for Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const headerLocale = getLocaleFromHeader(acceptLanguage);
    if (headerLocale) {
      logLocaleDetection(headerLocale, 'header');
      return headerLocale;
    }
  }

  // 4. Fall back to default locale
  logLocaleDetection(defaultLocale, 'default');
  return defaultLocale;
}

/**
 * Extract locale from Accept-Language header
 * Handles formats like "en-US,en;q=0.9,de;q=0.8"
 */
function getLocaleFromHeader(acceptLanguage: string): string | null {
  try {
    const preferredLocales = acceptLanguage
      .split(',')
      .map(lang => {
        const [locale, priority = 'q=1.0'] = lang.trim().split(';');
        const langCode = locale.split('-')[0]; // Take only language code (e.g., "en" from "en-US")
        const q = priority.startsWith('q=') ? parseFloat(priority.substring(2)) : 1.0;
        return { locale: langCode, priority: q };
      })
      .sort((a, b) => b.priority - a.priority); // Sort by priority (highest first)

    // Find the first supported locale
    for (const { locale } of preferredLocales) {
      if (isValidLocale(locale)) {
        return locale;
      }
    }
  } catch (error) {
    console.error('Failed to parse Accept-Language header:', error);
  }
  
  return null;
}

/**
 * Validate if a locale string is supported by the application
 */
function isValidLocale(locale: string): boolean {
  return locales.includes(locale);
}

/**
 * Set the preferred locale cookie in a response
 */
export function setLocalePreference(locale: string, response: Response): Response {
  if (!isValidLocale(locale)) {
    console.warn(`Attempted to set invalid locale preference: ${locale}`);
    locale = defaultLocale;
  }
  
  // Check for existing cookies header
  const cookies = response.headers.get('Set-Cookie') || '';
  
  // Create a more comprehensive cookie string with attributes that work well in Safari
  const cookieOptions = [
    `${LOCALE_COOKIE_NAME}=${locale}`,
    `Path=/`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    `SameSite=Lax` // Less restrictive than Strict, better for Safari
  ];
  
  // Only set Secure for HTTPS URLs
  if (response.url?.startsWith('https://')) {
    cookieOptions.push('Secure');
  }
  
  const newCookie = cookieOptions.join('; ');
  
  // Append the cookie to existing cookies rather than replacing
  response.headers.append('Set-Cookie', newCookie);
  
  return response;
} 