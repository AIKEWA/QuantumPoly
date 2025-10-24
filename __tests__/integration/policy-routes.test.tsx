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

import { loadPolicy } from '@/lib/policies/load-policy';

describe('Policy Routes Integration', () => {
  const policyTypes = ['ethics', 'gep', 'privacy', 'imprint'] as const;
  const locales = ['en', 'de', 'tr', 'es', 'fr', 'it'] as const;

  describe('Policy Content Availability', () => {
    policyTypes.forEach((policyType) => {
      describe(`${policyType} policy`, () => {
        locales.forEach((locale) => {
          it(`should load or fallback for ${locale}`, async () => {
            const policy = await loadPolicy(policyType, locale);

            // Should successfully load
            expect(policy).toBeDefined();
            expect(policy.metadata).toBeDefined();
            expect(policy.html).toBeTruthy();
            
            // Locale tracking should be correct
            expect(policy.locale).toBe(locale);
            expect(['en', locale]).toContain(policy.resolvedLocale);
          });
        });
      });
    });
  });

  describe('Metadata Validation', () => {
    policyTypes.forEach((policyType) => {
      it(`should have valid metadata for ${policyType} (en)`, async () => {
        const policy = await loadPolicy(policyType, 'en');

        // All required fields present
        expect(policy.metadata.title).toBeTruthy();
        expect(policy.metadata.summary.length).toBeGreaterThanOrEqual(10);
        expect(['draft', 'in-progress', 'published']).toContain(policy.metadata.status);
        expect(policy.metadata.owner).toBeTruthy();
        
        // Dates in correct format
        expect(policy.metadata.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(policy.metadata.nextReviewDue).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        
        // Version in semantic format
        expect(policy.metadata.version).toMatch(/^v\d+\.\d+\.\d+$/);
      });
    });
  });

  describe('Content Generation', () => {
    it('should generate HTML for all policies', async () => {
      for (const policyType of policyTypes) {
        const policy = await loadPolicy(policyType, 'en');

        // HTML should be generated
        expect(policy.html).toContain('<');
        expect(policy.html).toContain('>');
        
        // Should have semantic HTML
        expect(policy.html).toMatch(/<h[2-6]/);
        expect(policy.html).toContain('<p>');
      }
    });

    it('should generate table of contents for policies with headings', async () => {
      for (const policyType of policyTypes) {
        const policy = await loadPolicy(policyType, 'en');

        expect(policy.toc).toBeDefined();
        expect(Array.isArray(policy.toc)).toBe(true);

        // Most policies should have at least some headings
        if (policy.toc.length > 0) {
          policy.toc.forEach((item) => {
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('text');
            expect(item).toHaveProperty('level');
            expect(item.text).toBeTruthy();
            expect(item.id).toBeTruthy();
            expect([2, 3]).toContain(item.level);
          });
        }
      }
    });
  });

  describe('Fallback Behavior', () => {
    it('should set isFallback=true when using English fallback', async () => {
      // Load policies that might fallback (es, fr, it are marked in-progress)
      const potentialFallbacks = ['es', 'fr', 'it'] as const;

      for (const locale of potentialFallbacks) {
        const policy = await loadPolicy('ethics', locale);

        // If it fell back, should be marked
        if (policy.resolvedLocale === 'en' && policy.locale !== 'en') {
          expect(policy.isFallback).toBe(true);
        }

        // If using requested locale, should not be fallback
        if (policy.resolvedLocale === locale) {
          expect(policy.isFallback).toBe(false);
        }
      }
    });

    it('should not set isFallback for primary locales', async () => {
      const primaryLocales = ['en', 'de', 'tr'] as const;

      for (const locale of primaryLocales) {
        const policy = await loadPolicy('privacy', locale);

        // Primary locales should not need fallback (unless content is missing)
        if (policy.resolvedLocale === locale) {
          expect(policy.isFallback).toBe(false);
        }
      }
    });
  });

  describe('SEO Metadata', () => {
    it('should have appropriate status for SEO robots', async () => {
      for (const policyType of policyTypes) {
        const policy = await loadPolicy(policyType, 'en');

        // Status should be appropriate for SEO
        expect(['draft', 'in-progress', 'published']).toContain(policy.metadata.status);

        // Published status means indexable
        // Non-published means noindex (handled in page.tsx)
      }
    });
  });

  describe('Content Structure', () => {
    it('should have consistent metadata structure across locales', async () => {
      const policy = 'ethics';
      
      const enPolicy = await loadPolicy(policy, 'en');
      const dePolicy = await loadPolicy(policy, 'de');

      // Same metadata fields
      expect(Object.keys(enPolicy.metadata).sort()).toEqual(
        Object.keys(dePolicy.metadata).sort()
      );

      // Same structure fields
      expect(Object.keys(enPolicy).sort()).toEqual(Object.keys(dePolicy).sort());
    });

    it('should maintain heading hierarchy in TOC', async () => {
      for (const policyType of policyTypes) {
        const policy = await loadPolicy(policyType, 'en');

        if (policy.toc.length > 0) {
          policy.toc.forEach((item) => {
            // TOC should only include h2 and h3
            expect(item.level).toBeGreaterThanOrEqual(2);
            expect(item.level).toBeLessThanOrEqual(3);
          });
        }
      }
    });

    it('should generate URL-safe TOC IDs', async () => {
      for (const policyType of policyTypes) {
        const policy = await loadPolicy(policyType, 'en');

        policy.toc.forEach((item) => {
          // IDs should be URL-safe
          expect(item.id).toMatch(/^[a-z0-9-]+$/);
          
          // Should not have leading/trailing hyphens
          expect(item.id).not.toMatch(/^-/);
          expect(item.id).not.toMatch(/-$/);
          
          // Should not have multiple consecutive hyphens
          expect(item.id).not.toMatch(/--/);
        });
      }
    });
  });

  describe('Translation Coverage', () => {
    it('should have English content for all policies', async () => {
      for (const policyType of policyTypes) {
        const policy = await loadPolicy(policyType, 'en');

        expect(policy.metadata.title).toBeTruthy();
        expect(policy.metadata.summary).toBeTruthy();
        expect(policy.html).toBeTruthy();
        expect(policy.resolvedLocale).toBe('en');
        expect(policy.isFallback).toBe(false);
      }
    });

    it('should load content for all locale/policy combinations', async () => {
      const results: Array<{
        policy: string;
        locale: string;
        success: boolean;
        isFallback: boolean;
      }> = [];

      for (const policyType of policyTypes) {
        for (const locale of locales) {
          try {
            const policy = await loadPolicy(policyType, locale);
            results.push({
              policy: policyType,
              locale,
              success: true,
              isFallback: policy.isFallback,
            });
          } catch (error) {
            results.push({
              policy: policyType,
              locale,
              success: false,
              isFallback: false,
            });
          }
        }
      }

      // All combinations should successfully load (with fallback if needed)
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });

      // At least English versions should not be fallbacks
      const enResults = results.filter((r) => r.locale === 'en');
      enResults.forEach((result) => {
        expect(result.isFallback).toBe(false);
      });
    });
  });

  describe('Disclaimer Content', () => {
    it('should have disclaimer in privacy and imprint policies', async () => {
      const privacyPolicy = await loadPolicy('privacy', 'en');
      const imprintPolicy = await loadPolicy('imprint', 'en');

      // Check for disclaimer keywords in HTML
      expect(privacyPolicy.html.toLowerCase()).toContain('informational');
      expect(imprintPolicy.html.toLowerCase()).toContain('informational');
      
      // Should mention not being legal advice
      expect(
        privacyPolicy.html.toLowerCase().includes('legal advice') ||
        privacyPolicy.html.toLowerCase().includes('not constitute')
      ).toBe(true);
    });
  });

  describe('Anchor Links', () => {
    it('should generate anchor IDs in HTML for headings', async () => {
      const policy = await loadPolicy('ethics', 'en');

      // Should have id attributes in heading tags
      expect(policy.html).toMatch(/id="[^"]+"/);
      
      // TOC should have entries (IDs are generated consistently by both TOC extractor and HTML renderer)
      expect(policy.toc.length).toBeGreaterThan(0);
      policy.toc.forEach((tocItem) => {
        expect(tocItem.id).toBeTruthy();
        expect(tocItem.id).toMatch(/^[a-z0-9-]+$/);
      });
    });
  });
});

