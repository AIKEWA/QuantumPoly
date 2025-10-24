import { describe, expect, it } from '@jest/globals';

import {
  type PolicyMetadata,
  type PolicyStatus,
  policyMetadataSchema,
  parseFrontmatter,
  isValidPolicySlug,
  POLICY_SLUGS,
} from '@/lib/policies/policy-schema';

describe('policySchema', () => {
  describe('POLICY_SLUGS', () => {
    it('should export correct policy slugs', () => {
      expect(POLICY_SLUGS).toEqual(['ethics', 'gep', 'privacy', 'imprint']);
    });
  });

  describe('isValidPolicySlug', () => {
    it('should return true for valid slugs', () => {
      expect(isValidPolicySlug('ethics')).toBe(true);
      expect(isValidPolicySlug('gep')).toBe(true);
      expect(isValidPolicySlug('privacy')).toBe(true);
      expect(isValidPolicySlug('imprint')).toBe(true);
    });

    it('should return false for invalid slugs', () => {
      expect(isValidPolicySlug('invalid')).toBe(false);
      expect(isValidPolicySlug('terms')).toBe(false);
      expect(isValidPolicySlug('')).toBe(false);
    });
  });

  describe('policyMetadataSchema', () => {
    const validMetadata: PolicyMetadata = {
      title: 'Test Policy',
      summary: 'This is a test policy summary that is long enough',
      status: 'published' as PolicyStatus,
      owner: 'Test Team <test@example.com>',
      lastReviewed: '2025-10-13',
      nextReviewDue: '2026-01-13',
      version: 'v1.0.0',
    };

    it('should validate correct metadata', () => {
      const result = policyMetadataSchema.safeParse(validMetadata);
      expect(result.success).toBe(true);
    });

    it('should accept all valid status values', () => {
      const statuses: PolicyStatus[] = ['draft', 'in-progress', 'published'];
      
      statuses.forEach((status) => {
        const metadata = { ...validMetadata, status };
        const result = policyMetadataSchema.safeParse(metadata);
        expect(result.success).toBe(true);
      });
    });

    it('should reject missing required fields', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { title, ...incomplete } = validMetadata;
      const result = policyMetadataSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it('should reject empty title', () => {
      const metadata = { ...validMetadata, title: '' };
      const result = policyMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(false);
    });

    it('should reject summary that is too short', () => {
      const metadata = { ...validMetadata, summary: 'Short' };
      const result = policyMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(false);
    });

    it('should reject invalid status', () => {
      const metadata = { ...validMetadata, status: 'invalid-status' };
      const result = policyMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const metadata = { ...validMetadata, lastReviewed: '2025/10/13' };
      const result = policyMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(false);
    });

    it('should reject invalid version format', () => {
      const invalidVersions = ['1.0.0', 'v1', 'v1.0', 'version-1.0.0'];
      
      invalidVersions.forEach((version) => {
        const metadata = { ...validMetadata, version };
        const result = policyMetadataSchema.safeParse(metadata);
        expect(result.success).toBe(false);
      });
    });

    it('should accept valid version formats', () => {
      const validVersions = ['v0.0.1', 'v1.0.0', 'v12.34.56'];
      
      validVersions.forEach((version) => {
        const metadata = { ...validMetadata, version };
        const result = policyMetadataSchema.safeParse(metadata);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('parseFrontmatter', () => {
    const validFrontmatter = {
      title: 'Test Policy',
      summary: 'This is a test policy summary that is long enough',
      status: 'published',
      owner: 'Test Team <test@example.com>',
      lastReviewed: '2025-10-13',
      nextReviewDue: '2026-01-13',
      version: 'v1.0.0',
    };

    it('should parse valid frontmatter', () => {
      const result = parseFrontmatter(validFrontmatter, 'ethics', 'en');
      expect(result).toEqual(validFrontmatter);
    });

    it('should throw detailed error for invalid frontmatter', () => {
      const invalidFrontmatter = {
        ...validFrontmatter,
        status: 'invalid-status',
        lastReviewed: 'invalid-date',
      };

      expect(() => {
        parseFrontmatter(invalidFrontmatter, 'privacy', 'de');
      }).toThrow(/Invalid frontmatter in policy "privacy" \(locale: de\)/);
    });

    it('should include field details in error message', () => {
      const invalidFrontmatter = { ...validFrontmatter, version: 'invalid' };

      expect(() => {
        parseFrontmatter(invalidFrontmatter, 'gep', 'tr');
      }).toThrow(/version/);
    });

    it('should handle missing fields', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { title, ...incomplete } = validFrontmatter;

      expect(() => {
        parseFrontmatter(incomplete, 'imprint', 'en');
      }).toThrow(/title/);
    });

    it('should preserve all field values', () => {
      const result = parseFrontmatter(validFrontmatter, 'ethics', 'en');
      expect(result.title).toBe(validFrontmatter.title);
      expect(result.summary).toBe(validFrontmatter.summary);
      expect(result.status).toBe(validFrontmatter.status);
      expect(result.owner).toBe(validFrontmatter.owner);
      expect(result.lastReviewed).toBe(validFrontmatter.lastReviewed);
      expect(result.nextReviewDue).toBe(validFrontmatter.nextReviewDue);
      expect(result.version).toBe(validFrontmatter.version);
    });
  });
});

