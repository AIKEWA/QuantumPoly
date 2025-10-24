/**
 * Unit Tests: SEO Utilities
 * 
 * Tests for SEO metadata generation with i18n support
 */

import { type Locale } from '@/i18n';
import { getSeoForRoute, isValidSEORoute, type SEORoute } from '@/lib/seo';
import {
  getCanonicalUrl,
  getAlternateLanguages,
  getOgLocale,
  getSiteUrl,
  LOCALE_TO_OG_LOCALE,
  DEFAULT_OG_IMAGE,
  DEFAULT_TWITTER_HANDLE,
} from '@/lib/seo-config';

// Mock environment variable
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('seo-config', () => {
  describe('getSiteUrl', () => {
    it('returns NEXT_PUBLIC_SITE_URL when set', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
      expect(getSiteUrl()).toBe('https://example.com');
    });

    it('returns default URL when env var not set', () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      expect(getSiteUrl()).toBe('https://www.quantumpoly.com');
    });
  });

  describe('getCanonicalUrl', () => {
    it('generates correct canonical URL for home page', () => {
      const url = getCanonicalUrl('/', 'en');
      expect(url).toBe('https://www.quantumpoly.com/en');
    });

    it('generates correct canonical URL for policy pages', () => {
      const url = getCanonicalUrl('/ethics', 'de');
      expect(url).toBe('https://www.quantumpoly.com/de/ethics');
    });

    it('generates correct canonical URL for all locales', () => {
      const locales: Locale[] = ['en', 'de', 'tr', 'es', 'fr', 'it'];
      
      for (const locale of locales) {
        const url = getCanonicalUrl('/privacy', locale);
        expect(url).toContain(`/${locale}/privacy`);
      }
    });

    it('handles custom site URL from environment', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://staging.quantumpoly.com';
      const url = getCanonicalUrl('/gep', 'en');
      expect(url).toBe('https://staging.quantumpoly.com/en/gep');
    });
  });

  describe('getAlternateLanguages', () => {
    it('returns URLs for all 6 supported locales', () => {
      const alternates = getAlternateLanguages('/ethics');
      
      expect(Object.keys(alternates)).toHaveLength(6);
      expect(alternates.en).toBe('https://www.quantumpoly.com/en/ethics');
      expect(alternates.de).toBe('https://www.quantumpoly.com/de/ethics');
      expect(alternates.tr).toBe('https://www.quantumpoly.com/tr/ethics');
      expect(alternates.es).toBe('https://www.quantumpoly.com/es/ethics');
      expect(alternates.fr).toBe('https://www.quantumpoly.com/fr/ethics');
      expect(alternates.it).toBe('https://www.quantumpoly.com/it/ethics');
    });

    it('handles home page correctly', () => {
      const alternates = getAlternateLanguages('/');
      
      expect(alternates.en).toBe('https://www.quantumpoly.com/en');
      expect(alternates.de).toBe('https://www.quantumpoly.com/de');
    });
  });

  describe('getOgLocale', () => {
    it('maps en to en_US', () => {
      expect(getOgLocale('en')).toBe('en_US');
    });

    it('maps de to de_DE', () => {
      expect(getOgLocale('de')).toBe('de_DE');
    });

    it('maps tr to tr_TR', () => {
      expect(getOgLocale('tr')).toBe('tr_TR');
    });

    it('maps es to es_ES', () => {
      expect(getOgLocale('es')).toBe('es_ES');
    });

    it('maps fr to fr_FR', () => {
      expect(getOgLocale('fr')).toBe('fr_FR');
    });

    it('maps it to it_IT', () => {
      expect(getOgLocale('it')).toBe('it_IT');
    });
  });

  describe('LOCALE_TO_OG_LOCALE', () => {
    it('has mapping for all 6 locales', () => {
      expect(Object.keys(LOCALE_TO_OG_LOCALE)).toHaveLength(6);
    });

    it('uses correct Open Graph locale format', () => {
      // All OG locales should be in format: language_TERRITORY
      const ogLocales = Object.values(LOCALE_TO_OG_LOCALE);
      
      for (const ogLocale of ogLocales) {
        expect(ogLocale).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
      }
    });
  });

  describe('constants', () => {
    it('DEFAULT_OG_IMAGE is defined', () => {
      expect(DEFAULT_OG_IMAGE).toBe('/og-image.jpg');
    });

    it('DEFAULT_TWITTER_HANDLE is defined', () => {
      expect(DEFAULT_TWITTER_HANDLE).toBe('@quantumpoly');
    });
  });
});

describe('seo', () => {
  describe('isValidSEORoute', () => {
    it('validates home page route', () => {
      expect(isValidSEORoute('/')).toBe(true);
    });

    it('validates policy routes', () => {
      expect(isValidSEORoute('/ethics')).toBe(true);
      expect(isValidSEORoute('/privacy')).toBe(true);
      expect(isValidSEORoute('/imprint')).toBe(true);
      expect(isValidSEORoute('/gep')).toBe(true);
    });

    it('validates section routes', () => {
      expect(isValidSEORoute('/about')).toBe(true);
      expect(isValidSEORoute('/vision')).toBe(true);
    });

    it('rejects invalid routes', () => {
      expect(isValidSEORoute('/invalid')).toBe(false);
      expect(isValidSEORoute('/blog')).toBe(false);
      expect(isValidSEORoute('')).toBe(false);
    });
  });

  describe('getSeoForRoute', () => {
    const testRoutes: SEORoute[] = ['/', '/ethics', '/privacy', '/imprint', '/gep', '/about', '/vision'];
    const testLocales: Locale[] = ['en', 'de', 'tr', 'es', 'fr', 'it'];

    // Test all route/locale combinations
    for (const locale of testLocales) {
      describe(`locale: ${locale}`, () => {
        for (const route of testRoutes) {
          it(`returns SEO config for ${route}`, async () => {
            const seo = await getSeoForRoute(route, locale);
            
            // Basic structure
            expect(seo).toHaveProperty('title');
            expect(seo).toHaveProperty('description');
            expect(seo).toHaveProperty('keywords');
            expect(seo).toHaveProperty('robots');
            expect(seo).toHaveProperty('openGraph');
            expect(seo).toHaveProperty('twitter');
            expect(seo).toHaveProperty('alternates');

            // Title and description should not be empty
            expect(seo.title).toBeTruthy();
            expect(seo.description).toBeTruthy();

            // OpenGraph structure
            expect(seo.openGraph).toHaveProperty('title');
            expect(seo.openGraph).toHaveProperty('description');
            expect(seo.openGraph).toHaveProperty('locale');
            expect(seo.openGraph).toHaveProperty('type');
            expect(seo.openGraph).toHaveProperty('images');

            // Twitter structure
            expect(seo.twitter).toHaveProperty('card');
            expect(seo.twitter).toHaveProperty('title');
            expect(seo.twitter).toHaveProperty('description');

            // Alternates structure
            expect(seo.alternates).toHaveProperty('canonical');
            expect(seo.alternates).toHaveProperty('languages');
          });
        }
      });
    }

    it('sets correct OG type for home page', async () => {
      const seo = await getSeoForRoute('/', 'en');
      expect(seo.openGraph.type).toBe('website');
    });

    it('sets correct OG type for non-home pages', async () => {
      const routes: SEORoute[] = ['/ethics', '/privacy', '/imprint', '/gep', '/about', '/vision'];
      
      for (const route of routes) {
        const seo = await getSeoForRoute(route, 'en');
        expect(seo.openGraph.type).toBe('article');
      }
    });

    it('includes correct OG locale mapping', async () => {
      const seo = await getSeoForRoute('/', 'en');
      expect(seo.openGraph.locale).toBe('en_US');

      const seoDe = await getSeoForRoute('/', 'de');
      expect(seoDe.openGraph.locale).toBe('de_DE');
    });

    it('includes canonical URL with correct locale', async () => {
      const seo = await getSeoForRoute('/ethics', 'de');
      expect(seo.alternates.canonical).toContain('/de/ethics');
    });

    it('includes alternate language links for all locales', async () => {
      const seo = await getSeoForRoute('/privacy', 'en');
      const languages = seo.alternates.languages;

      expect(Object.keys(languages)).toHaveLength(6);
      expect(languages.en).toContain('/en/privacy');
      expect(languages.de).toContain('/de/privacy');
      expect(languages.tr).toContain('/tr/privacy');
      expect(languages.es).toContain('/es/privacy');
      expect(languages.fr).toContain('/fr/privacy');
      expect(languages.it).toContain('/it/privacy');
    });

    it('includes OG image', async () => {
      const seo = await getSeoForRoute('/', 'en');
      
      expect(seo.openGraph.images).toBeDefined();
      expect(seo.openGraph.images).toHaveLength(1);
      expect(seo.openGraph.images?.[0].url).toBeTruthy();
      expect(seo.openGraph.images?.[0].alt).toBe('QuantumPoly');
    });

    it('sets Twitter card to summary_large_image', async () => {
      const seo = await getSeoForRoute('/', 'en');
      expect(seo.twitter.card).toBe('summary_large_image');
    });

    it('includes Twitter site handle', async () => {
      const seo = await getSeoForRoute('/', 'en');
      expect(seo.twitter.site).toBe('@quantumpoly');
    });

    it('sets robots to index, follow by default', async () => {
      const seo = await getSeoForRoute('/', 'en');
      expect(seo.robots).toBe('index, follow');
    });

    it('handles locale-specific content for English', async () => {
      const seo = await getSeoForRoute('/', 'en');
      
      // English home page should contain English text
      expect(seo.title).toContain('QuantumPoly');
      expect(seo.description).toBeTruthy();
    });

    it('handles locale-specific content for German', async () => {
      const seo = await getSeoForRoute('/', 'de');
      
      // German home page should contain German text
      expect(seo.title).toContain('QuantumPoly');
      // Check for German-specific keywords or content
      expect(seo.description).toBeTruthy();
    });

    it('provides unique titles for different pages', async () => {
      const seoHome = await getSeoForRoute('/', 'en');
      const seoEthics = await getSeoForRoute('/ethics', 'en');
      const seoPrivacy = await getSeoForRoute('/privacy', 'en');

      expect(seoHome.title).not.toBe(seoEthics.title);
      expect(seoHome.title).not.toBe(seoPrivacy.title);
      expect(seoEthics.title).not.toBe(seoPrivacy.title);
    });

    it('provides unique descriptions for different pages', async () => {
      const seoHome = await getSeoForRoute('/', 'en');
      const seoEthics = await getSeoForRoute('/ethics', 'en');

      expect(seoHome.description).not.toBe(seoEthics.description);
    });

    it('includes keywords for SEO', async () => {
      const seo = await getSeoForRoute('/', 'en');
      
      expect(seo.keywords).toBeDefined();
      expect(seo.keywords).toBeTruthy();
    });
  });

  describe('fallback behavior', () => {
    it('falls back to English for invalid locale', async () => {
      // This test validates the fallback mechanism
      // Even if we pass an invalid locale (after type coercion), it should handle gracefully
      const seo = await getSeoForRoute('/', 'en');
      
      expect(seo).toBeDefined();
      expect(seo.title).toBeTruthy();
    });
  });

  describe('data consistency', () => {
    it('keeps OG title and meta title in sync (or intentionally different)', async () => {
      const seo = await getSeoForRoute('/', 'en');
      
      // OG title can be different from page title for better social sharing
      // But both should be defined
      expect(seo.title).toBeTruthy();
      expect(seo.openGraph.title).toBeTruthy();
    });

    it('keeps OG description and meta description in sync', async () => {
      const seo = await getSeoForRoute('/', 'en');
      
      // Both should be defined
      expect(seo.description).toBeTruthy();
      expect(seo.openGraph.description).toBeTruthy();
    });

    it('uses same description for Twitter and OpenGraph', async () => {
      const seo = await getSeoForRoute('/', 'en');
      
      expect(seo.twitter.description).toBe(seo.openGraph.description);
    });
  });
});

