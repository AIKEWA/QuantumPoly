/**
 * Shared i18n Test Helpers for Playwright E2E Tests
 * 
 * Provides common utilities for testing internationalization features
 */

import type { Page } from '@playwright/test';
import { locales, type Locale } from '../../src/i18n';

/**
 * Sample content to verify per locale
 * These are key-value pairs that should be present in each locale
 */
export const expectedContent: Record<Locale, Record<string, string>> = {
  en: {
    heroTitle: 'Welcome to QuantumPoly',
    aboutTitle: 'About Us',
    visionTitle: 'Our Vision',
    newsletterTitle: 'Stay in the Loop',
  },
  de: {
    heroTitle: 'Willkommen bei QuantumPoly',
    aboutTitle: 'Über Uns',
    visionTitle: 'Unsere Vision',
    newsletterTitle: 'Bleiben Sie informiert',
  },
  tr: {
    heroTitle: 'QuantumPoly\'ye Hoş Geldiniz',
    aboutTitle: 'Hakkımızda',
    visionTitle: 'Vizyonumuz',
    newsletterTitle: 'Bizi Takip Edin',
  },
  es: {
    heroTitle: 'Bienvenido a QuantumPoly',
    aboutTitle: 'Sobre Nosotros',
    visionTitle: 'Nuestra Visión',
    newsletterTitle: 'Mantente Informado',
  },
  fr: {
    heroTitle: 'Bienvenue chez QuantumPoly',
    aboutTitle: 'À Propos de Nous',
    visionTitle: 'Notre Vision',
    newsletterTitle: 'Restez Informé',
  },
  it: {
    heroTitle: 'Benvenuto a QuantumPoly',
    aboutTitle: 'Chi Siamo',
    visionTitle: 'La Nostra Visione',
    newsletterTitle: 'Rimani Aggiornato',
  },
};

/**
 * Get all supported locales
 */
export function getSupportedLocales(): readonly Locale[] {
  return locales;
}

/**
 * Navigate to a specific locale path
 */
export async function navigateToLocale(
  page: Page,
  locale: Locale,
  path: string = ''
): Promise<void> {
  const url = `/${locale}${path}`;
  await page.goto(url);
}

/**
 * Check if current page is in the expected locale
 */
export async function verifyLocaleInURL(
  page: Page,
  locale: Locale
): Promise<boolean> {
  const url = page.url();
  return url.includes(`/${locale}`);
}

/**
 * Get the current locale from the HTML lang attribute
 */
export async function getHTMLLang(page: Page): Promise<string> {
  return await page.getAttribute('html', 'lang') || '';
}

/**
 * Get the text direction from the HTML dir attribute
 */
export async function getHTMLDir(page: Page): Promise<string> {
  return await page.getAttribute('html', 'dir') || '';
}

/**
 * Click the language switcher and select a locale
 */
export async function switchLocale(
  page: Page,
  targetLocale: Locale
): Promise<void> {
  // Find and click the language switcher button
  const switcherButton = page.locator('[data-testid="language-switcher"]');
  await switcherButton.click();

  // Click the specific locale option
  const localeOption = page.locator(`[data-locale="${targetLocale}"]`);
  await localeOption.click();

  // Wait for navigation
  await page.waitForURL(`**/${targetLocale}/**`);
}

/**
 * Verify that expected content is present on the page
 */
export async function verifyContentForLocale(
  page: Page,
  locale: Locale
): Promise<boolean> {
  const content = expectedContent[locale];
  
  for (const text of Object.values(content)) {
    const isVisible = await page.getByText(text, { exact: false }).isVisible();
    if (!isVisible) {
      console.error(`Missing text for ${locale}: ${text}`);
      return false;
    }
  }
  
  return true;
}

/**
 * Check if a locale preference cookie is set
 */
export async function getLocaleCookie(page: Page): Promise<string | null> {
  const cookies = await page.context().cookies();
  const localeCookie = cookies.find(c => c.name === 'NEXT_LOCALE');
  return localeCookie?.value || null;
}

/**
 * Verify hreflang meta tags are present
 */
export async function verifyHreflangTags(page: Page): Promise<boolean> {
  const hreflangLinks = await page.locator('link[rel="alternate"][hreflang]').count();
  return hreflangLinks >= locales.length;
}

/**
 * Get all hreflang attributes from the page
 */
export async function getHreflangAttributes(page: Page): Promise<string[]> {
  const links = await page.locator('link[rel="alternate"][hreflang]').all();
  const hreflangs: string[] = [];
  
  for (const link of links) {
    const hreflang = await link.getAttribute('hreflang');
    if (hreflang) {
      hreflangs.push(hreflang);
    }
  }
  
  return hreflangs;
}

/**
 * Wait for locale content to be loaded
 */
export async function waitForLocaleContent(page: Page): Promise<void> {
  // Wait for the main content to be visible
  await page.waitForSelector('main', { state: 'visible' });
  
  // Wait for any locale-dependent content to render
  await page.waitForTimeout(500);
}

/**
 * Test data for form inputs per locale
 */
export const testFormData: Record<Locale, { email: string }> = {
  en: { email: 'test@example.com' },
  de: { email: 'test@beispiel.de' },
  tr: { email: 'test@ornek.tr' },
  es: { email: 'test@ejemplo.es' },
  fr: { email: 'test@exemple.fr' },
  it: { email: 'test@esempio.it' },
};

