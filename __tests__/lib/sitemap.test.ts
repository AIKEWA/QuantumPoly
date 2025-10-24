/**
 * @jest-environment node
 */

import { MetadataRoute } from 'next';

import sitemap from '@/app/sitemap';
import { locales } from '@/i18n';
import { PUBLIC_ROUTES } from '@/lib/routes';

describe('sitemap', () => {
  let sitemapEntries: MetadataRoute.Sitemap;

  beforeAll(() => {
    // Set environment variable for consistent testing
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.quantumpoly.com';
    sitemapEntries = sitemap();
  });

  describe('structure', () => {
    it('should return an array of sitemap entries', () => {
      expect(Array.isArray(sitemapEntries)).toBe(true);
      expect(sitemapEntries.length).toBeGreaterThan(0);
    });

    it('should generate correct number of entries (1 per route)', () => {
      // We generate 1 entry per route (not per locale)
      // Each entry contains alternates for all locales
      const expectedCount = PUBLIC_ROUTES.length;
      expect(sitemapEntries).toHaveLength(expectedCount);
    });

    it('should have required fields for each entry', () => {
      sitemapEntries.forEach((entry) => {
        expect(entry).toHaveProperty('url');
        expect(entry).toHaveProperty('lastModified');
        expect(entry).toHaveProperty('changeFrequency');
        expect(entry).toHaveProperty('priority');
        expect(entry).toHaveProperty('alternates');
      });
    });
  });

  describe('URLs', () => {
    it('should generate absolute URLs', () => {
      sitemapEntries.forEach((entry) => {
        expect(entry.url).toMatch(/^https?:\/\//);
      });
    });

    it('should use NEXT_PUBLIC_SITE_URL as base', () => {
      const baseUrl = 'https://www.quantumpoly.com';
      sitemapEntries.forEach((entry) => {
        expect(entry.url).toContain(baseUrl);
      });
    });

    it('should use English as canonical URL', () => {
      sitemapEntries.forEach((entry) => {
        expect(entry.url).toContain('/en');
      });
    });

    it('should properly format route paths', () => {
      const homeEntry = sitemapEntries.find((e) => e.url.endsWith('/en'));
      expect(homeEntry).toBeDefined();

      const policyEntry = sitemapEntries.find((e) => e.url.includes('/privacy'));
      expect(policyEntry).toBeDefined();
      expect(policyEntry?.url).toMatch(/\/en\/privacy$/);
    });
  });

  describe('hreflang alternates', () => {
    it('should include alternates.languages for each entry', () => {
      sitemapEntries.forEach((entry) => {
        expect(entry.alternates).toBeDefined();
        expect(entry.alternates?.languages).toBeDefined();
      });
    });

    it('should include all 6 supported locales', () => {
      sitemapEntries.forEach((entry) => {
        const languages = entry.alternates?.languages as Record<string, string>;
        
        for (const locale of locales) {
          expect(languages).toHaveProperty(locale);
          expect(languages[locale]).toMatch(/^https?:\/\//);
        }
      });
    });

    it('should include x-default fallback', () => {
      sitemapEntries.forEach((entry) => {
        const languages = entry.alternates?.languages as Record<string, string>;
        expect(languages).toHaveProperty('x-default');
        expect(languages['x-default']).toMatch(/^https?:\/\//);
      });
    });

    it('should point x-default to English version', () => {
      sitemapEntries.forEach((entry) => {
        const languages = entry.alternates?.languages as Record<string, string>;
        expect(languages['x-default']).toContain('/en');
      });
    });

    it('should generate correct locale-specific URLs', () => {
      const privacyEntry = sitemapEntries.find((e) => e.url.includes('/privacy'));
      expect(privacyEntry).toBeDefined();

      const languages = privacyEntry!.alternates?.languages as Record<string, string>;
      
      expect(languages.en).toBe('https://www.quantumpoly.com/en/privacy');
      expect(languages.de).toBe('https://www.quantumpoly.com/de/privacy');
      expect(languages.tr).toBe('https://www.quantumpoly.com/tr/privacy');
      expect(languages.es).toBe('https://www.quantumpoly.com/es/privacy');
      expect(languages.fr).toBe('https://www.quantumpoly.com/fr/privacy');
      expect(languages.it).toBe('https://www.quantumpoly.com/it/privacy');
    });

    it('should handle homepage correctly', () => {
      const homeEntry = sitemapEntries.find((e) => e.url === 'https://www.quantumpoly.com/en');
      expect(homeEntry).toBeDefined();

      const languages = homeEntry!.alternates?.languages as Record<string, string>;
      
      expect(languages.en).toBe('https://www.quantumpoly.com/en');
      expect(languages.de).toBe('https://www.quantumpoly.com/de');
      expect(languages['x-default']).toBe('https://www.quantumpoly.com/en');
    });
  });

  describe('metadata', () => {
    it('should set homepage priority to 1.0', () => {
      const homeEntry = sitemapEntries.find((e) => e.url.endsWith('/en'));
      expect(homeEntry?.priority).toBe(1.0);
    });

    it('should set privacy page priority to 0.8', () => {
      const privacyEntry = sitemapEntries.find((e) => e.url.includes('/privacy'));
      expect(privacyEntry?.priority).toBe(0.8);
    });

    it('should set default priority to 0.7 for other pages', () => {
      const ethicsEntry = sitemapEntries.find((e) => e.url.includes('/ethics'));
      expect(ethicsEntry?.priority).toBe(0.7);
    });

    it('should set homepage changeFrequency to weekly', () => {
      const homeEntry = sitemapEntries.find((e) => e.url.endsWith('/en'));
      expect(homeEntry?.changeFrequency).toBe('weekly');
    });

    it('should set policy pages changeFrequency to monthly', () => {
      const policyEntry = sitemapEntries.find((e) => e.url.includes('/privacy'));
      expect(policyEntry?.changeFrequency).toBe('monthly');
    });

    it('should include lastModified as ISO date string', () => {
      sitemapEntries.forEach((entry) => {
        expect(entry.lastModified).toBeDefined();
        expect(typeof entry.lastModified).toBe('string');
        
        // Verify it's a valid ISO date
        const date = new Date(entry.lastModified as string);
        expect(date.toString()).not.toBe('Invalid Date');
      });
    });
  });

  describe('route coverage', () => {
    it('should include all PUBLIC_ROUTES', () => {
      for (const route of PUBLIC_ROUTES) {
        const normalizedRoute = route === '/' ? '' : route;
        const expectedUrl = `https://www.quantumpoly.com/en${normalizedRoute}`;
        
        const entry = sitemapEntries.find((e) => e.url === expectedUrl);
        expect(entry).toBeDefined();
      }
    });

    it('should include homepage', () => {
      const homeEntry = sitemapEntries.find((e) => e.url === 'https://www.quantumpoly.com/en');
      expect(homeEntry).toBeDefined();
    });

    it('should include all policy pages', () => {
      const policyRoutes = ['/ethics', '/privacy', '/imprint', '/gep'];
      
      for (const route of policyRoutes) {
        const expectedUrl = `https://www.quantumpoly.com/en${route}`;
        const entry = sitemapEntries.find((e) => e.url === expectedUrl);
        expect(entry).toBeDefined();
      }
    });
  });

  describe('environment configuration', () => {
    it('should use default URL when NEXT_PUBLIC_SITE_URL not set', () => {
      const originalUrl = process.env.NEXT_PUBLIC_SITE_URL;
      delete process.env.NEXT_PUBLIC_SITE_URL;

      const entries = sitemap();
      expect(entries[0].url).toContain('https://www.quantumpoly.com');

      process.env.NEXT_PUBLIC_SITE_URL = originalUrl;
    });

    it('should use custom URL when NEXT_PUBLIC_SITE_URL is set', () => {
      const originalUrl = process.env.NEXT_PUBLIC_SITE_URL;
      process.env.NEXT_PUBLIC_SITE_URL = 'https://preview.example.com';

      const entries = sitemap();
      expect(entries[0].url).toContain('https://preview.example.com');

      process.env.NEXT_PUBLIC_SITE_URL = originalUrl;
    });
  });
});

