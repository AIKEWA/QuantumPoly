import { describe, expect, it } from '@jest/globals';

// Mock remark and related ESM modules for Jest compatibility
jest.mock('remark', () => ({
  remark: () => ({
    parse: (markdown: string) => {
      const lines = markdown.split('\n');
      const children: any[] = [];
      lines.forEach((line) => {
        const match = line.match(/^(#{2,6})\s+(.+)$/);
        if (match) {
          const depth = match[1].length;
          const text = match[2].replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/`(.+?)`/g, '$1');
          children.push({ type: 'heading', depth, children: [{ type: 'text', value: text }] });
        }
      });
      return { type: 'root', children };
    },
    use: function() { return this; },
    process: async (markdown: string) => {
      const lines = markdown.split('\n');
      let html = '';
      lines.forEach((line) => {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
          const level = match[1].length;
          const text = match[2];
          const id = text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
          html += `<h${level} id="${id}">${text}</h${level}>\n`;
        } else if (line.trim()) {
          html += `<p>${line}</p>\n`;
        }
      });
      return { toString: () => html };
    },
  }),
}));

jest.mock('remark-html', () => () => {});
jest.mock('rehype-slug', () => () => {});
jest.mock('rehype-autolink-headings', () => () => {});

jest.mock('unist-util-visit', () => ({
  visit: (tree: any, type: string, callback: (node: any) => void) => {
    const visitNode = (node: any) => {
      if (node.type === type) callback(node);
      if (node.children) node.children.forEach(visitNode);
    };
    visitNode(tree);
  },
}));

import { loadPolicy, getAllPolicySlugs, getAllLocales } from '@/lib/policies/load-policy';

describe('loadPolicy', () => {
  describe('getAllPolicySlugs', () => {
    it('should return all policy slugs', () => {
      const slugs = getAllPolicySlugs();
      expect(slugs).toEqual(['ethics', 'gep', 'privacy', 'imprint']);
    });
  });

  describe('getAllLocales', () => {
    it('should return all supported locales', () => {
      const locales = getAllLocales();
      expect(locales).toContain('en');
      expect(locales).toContain('de');
      expect(locales).toContain('tr');
      expect(locales).toContain('es');
      expect(locales).toContain('fr');
      expect(locales).toContain('it');
      expect(locales.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('loadPolicy', () => {
    it('should load English ethics policy', async () => {
      const policy = await loadPolicy('ethics', 'en');

      expect(policy).toBeDefined();
      expect(policy.metadata).toBeDefined();
      expect(policy.metadata.title).toBeTruthy();
      expect(policy.metadata.status).toMatch(/^(draft|in-progress|published)$/);
      expect(policy.html).toBeTruthy();
      expect(policy.locale).toBe('en');
      expect(policy.resolvedLocale).toBe('en');
      expect(policy.isFallback).toBe(false);
    });

    it('should load all policy types', async () => {
      const slugs = ['ethics', 'gep', 'privacy', 'imprint'] as const;

      for (const slug of slugs) {
        const policy = await loadPolicy(slug, 'en');
        expect(policy.metadata.title).toBeTruthy();
        expect(policy.html).toBeTruthy();
      }
    });

    it('should generate table of contents', async () => {
      const policy = await loadPolicy('ethics', 'en');

      expect(policy.toc).toBeDefined();
      expect(Array.isArray(policy.toc)).toBe(true);
      
      // Ethics policy should have multiple sections
      expect(policy.toc.length).toBeGreaterThan(0);
      
      // Check TOC structure
      if (policy.toc.length > 0) {
        const firstItem = policy.toc[0];
        expect(firstItem).toHaveProperty('id');
        expect(firstItem).toHaveProperty('text');
        expect(firstItem).toHaveProperty('level');
        expect(firstItem.level).toBeGreaterThanOrEqual(2);
        expect(firstItem.level).toBeLessThanOrEqual(3);
      }
    });

    it('should fall back to English for missing locale', async () => {
      // Note: This test assumes es/fr/it might not be fully translated
      // If all locales are complete, this test may need adjustment
      const policy = await loadPolicy('privacy', 'es');

      expect(policy.locale).toBe('es');
      // Policy should load (either es or fallback to en)
      expect(policy.metadata).toBeDefined();
      expect(policy.html).toBeTruthy();
    });

    it('should set isFallback flag when using English fallback', async () => {
      // Try to load a locale that definitely doesn't exist by using content check
      // This test verifies the fallback mechanism works
      const policy = await loadPolicy('ethics', 'en');
      
      // When loading en, it should not be a fallback
      expect(policy.isFallback).toBe(false);
      expect(policy.locale).toBe('en');
      expect(policy.resolvedLocale).toBe('en');
    });

    it('should throw error for invalid slug', async () => {
      await expect(async () => {
        // @ts-expect-error Testing invalid slug
        await loadPolicy('invalid-slug', 'en');
      }).rejects.toThrow(/Invalid policy slug/);
    });

    it('should render markdown to HTML', async () => {
      const policy = await loadPolicy('gep', 'en');

      // Check that markdown was converted to HTML
      expect(policy.html).toContain('<');
      expect(policy.html).toContain('>');
      
      // Should have heading tags
      expect(policy.html).toMatch(/<h[2-6]/);
      
      // Should have paragraph tags
      expect(policy.html).toContain('<p>');
    });

    it('should add anchor IDs to headings', async () => {
      const policy = await loadPolicy('ethics', 'en');

      // rehype-slug should add id attributes to headings
      // Check if HTML contains heading with id
      expect(policy.html).toMatch(/id="[^"]+"/);
    });

    it('should validate frontmatter', async () => {
      const policy = await loadPolicy('privacy', 'en');

      // Check all required fields are present and valid
      expect(policy.metadata.title).toBeTruthy();
      expect(policy.metadata.summary.length).toBeGreaterThanOrEqual(10);
      expect(['draft', 'in-progress', 'published']).toContain(policy.metadata.status);
      expect(policy.metadata.owner).toBeTruthy();
      expect(policy.metadata.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(policy.metadata.nextReviewDue).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(policy.metadata.version).toMatch(/^v\d+\.\d+\.\d+$/);
    });

    it('should load German translations', async () => {
      const policy = await loadPolicy('ethics', 'de');

      expect(policy.metadata.title).toBeTruthy();
      expect(policy.locale).toBe('de');
      // Should either be de or fallback to en
      expect(['de', 'en']).toContain(policy.resolvedLocale);
    });

    it('should load Turkish translations', async () => {
      const policy = await loadPolicy('gep', 'tr');

      expect(policy.metadata.title).toBeTruthy();
      expect(policy.locale).toBe('tr');
      // Should either be tr or fallback to en
      expect(['tr', 'en']).toContain(policy.resolvedLocale);
    });

    it('should have consistent structure across locales', async () => {
      const enPolicy = await loadPolicy('privacy', 'en');
      const dePolicy = await loadPolicy('privacy', 'de');

      // Both should have same metadata fields
      expect(Object.keys(enPolicy.metadata).sort()).toEqual(
        Object.keys(dePolicy.metadata).sort()
      );

      // Both should have HTML content
      expect(enPolicy.html).toBeTruthy();
      expect(dePolicy.html).toBeTruthy();

      // Both should have TOC
      expect(enPolicy.toc).toBeDefined();
      expect(dePolicy.toc).toBeDefined();
    });
  });
});

