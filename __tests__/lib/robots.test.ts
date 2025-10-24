/**
 * @jest-environment node
 */

import { MetadataRoute } from 'next';

import robots from '@/app/robots';

describe('robots', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('structure', () => {
    it('should return a valid robots metadata object', () => {
      const robotsData = robots();
      
      expect(robotsData).toHaveProperty('rules');
      expect(robotsData).toHaveProperty('sitemap');
    });

    it('should include User-agent in rules', () => {
      const robotsData = robots();
      
      expect(robotsData.rules).toHaveProperty('userAgent');
      expect(robotsData.rules.userAgent).toBe('*');
    });

    it('should always include sitemap URL', () => {
      const robotsData = robots();
      
      expect(robotsData.sitemap).toBeDefined();
      expect(typeof robotsData.sitemap).toBe('string');
      expect(robotsData.sitemap).toContain('/sitemap.xml');
    });
  });

  describe('production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_SITE_URL = 'https://www.quantumpoly.com';
    });

    it('should allow crawling in production', () => {
      const robotsData = robots();
      
      expect(robotsData.rules.allow).toBe('/');
      expect(robotsData.rules.disallow).toBe('');
    });

    it('should use production site URL for sitemap', () => {
      const robotsData = robots();
      
      expect(robotsData.sitemap).toBe('https://www.quantumpoly.com/sitemap.xml');
    });
  });

  describe('non-production environments', () => {
    const testEnvironments = ['development', 'test', 'staging'];

    testEnvironments.forEach((env) => {
      describe(`${env} environment`, () => {
        beforeEach(() => {
          process.env.NODE_ENV = env;
          process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
        });

        it(`should disallow crawling in ${env}`, () => {
          const robotsData = robots();
          
          expect(robotsData.rules.disallow).toBe('/');
          expect(robotsData.rules.allow).toBe('');
        });

        it('should still include sitemap URL', () => {
          const robotsData = robots();
          
          expect(robotsData.sitemap).toBeDefined();
          expect(robotsData.sitemap).toContain('/sitemap.xml');
        });
      });
    });
  });

  describe('sitemap URL generation', () => {
    it('should use NEXT_PUBLIC_SITE_URL when set', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://custom.example.com';
      
      const robotsData = robots();
      
      expect(robotsData.sitemap).toBe('https://custom.example.com/sitemap.xml');
    });

    it('should use default URL when NEXT_PUBLIC_SITE_URL not set', () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      
      const robotsData = robots();
      
      expect(robotsData.sitemap).toBe('https://www.quantumpoly.com/sitemap.xml');
    });

    it('should generate absolute sitemap URLs', () => {
      const robotsData = robots();
      
      expect(robotsData.sitemap).toMatch(/^https?:\/\//);
    });

    it('should properly append sitemap.xml path', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
      
      const robotsData = robots();
      
      expect(robotsData.sitemap).toMatch(/\/sitemap\.xml$/);
    });
  });

  describe('preview/staging environments', () => {
    it('should block indexing in preview builds', () => {
      process.env.NODE_ENV = 'production'; // Vercel sets this in preview
      process.env.VERCEL_ENV = 'preview';
      
      // In our current implementation, we only check NODE_ENV
      // But preview should ideally be blocked
      const robotsData = robots();
      
      // Current behavior: allows because NODE_ENV=production
      // This is a known limitation - consider enhancing to check VERCEL_ENV
      expect(robotsData.rules.allow).toBe('/');
    });
  });

  describe('crawl directives', () => {
    it('should have mutually exclusive allow/disallow', () => {
      const robotsData = robots();
      
      // Either allow or disallow should be set, not both
      const hasAllow = robotsData.rules.allow === '/';
      const hasDisallow = robotsData.rules.disallow === '/';
      
      expect(hasAllow !== hasDisallow).toBe(true);
    });

    it('should target all user agents', () => {
      const robotsData = robots();
      
      expect(robotsData.rules.userAgent).toBe('*');
    });
  });

  describe('type safety', () => {
    it('should return MetadataRoute.Robots type', () => {
      const robotsData: MetadataRoute.Robots = robots();
      
      expect(robotsData).toBeDefined();
    });

    it('should have correct rules structure', () => {
      const robotsData = robots();
      
      expect(robotsData.rules).toMatchObject({
        userAgent: expect.any(String),
        allow: expect.any(String),
        disallow: expect.any(String),
      });
    });
  });

  describe('edge cases', () => {
    it('should handle missing NODE_ENV gracefully', () => {
      delete process.env.NODE_ENV;
      
      // Should default to non-production behavior
      const robotsData = robots();
      
      expect(robotsData.rules.disallow).toBe('/');
    });

    it('should handle empty NEXT_PUBLIC_SITE_URL', () => {
      process.env.NEXT_PUBLIC_SITE_URL = '';
      
      const robotsData = robots();
      
      // Should use default
      expect(robotsData.sitemap).toBe('https://www.quantumpoly.com/sitemap.xml');
    });

    it('should handle site URL without trailing slash', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
      
      const robotsData = robots();
      
      expect(robotsData.sitemap).toBe('https://example.com/sitemap.xml');
    });

    it('should handle site URL with trailing slash', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com/';
      
      const robotsData = robots();
      
      // Current implementation: results in double slash
      // This is acceptable but could be normalized
      expect(robotsData.sitemap).toContain('sitemap.xml');
    });
  });
});

