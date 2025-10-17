import { z } from 'zod';

/**
 * Policy status indicates the publication state and triggers SEO behavior.
 * - draft: Work in progress, not ready for review
 * - in-progress: Under review or being translated
 * - published: Finalized and publicly available
 */
export type PolicyStatus = 'draft' | 'in-progress' | 'published';

/**
 * Valid policy slugs for the Trust & Policies system.
 */
export const POLICY_SLUGS = ['ethics', 'gep', 'privacy', 'imprint'] as const;
export type PolicySlug = (typeof POLICY_SLUGS)[number];

/**
 * Metadata schema for policy documents.
 * All policies must include this frontmatter for proper rendering and SEO.
 */
export interface PolicyMetadata {
  /** Document title (used in page title and H1) */
  title: string;
  /** Brief summary (used for meta description and page intro) */
  summary: string;
  /** Publication status (affects robots meta tag) */
  status: PolicyStatus;
  /** Content owner (name or team email) */
  owner: string;
  /** ISO date of last review */
  lastReviewed: string;
  /** ISO date when next review is due */
  nextReviewDue: string;
  /** Semantic version (e.g., "v1.0.0") */
  version: string;
}

/**
 * Zod schema for validating policy frontmatter at build time.
 * Ensures all required fields are present and correctly typed.
 */
export const policyMetadataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  status: z.enum(['draft', 'in-progress', 'published'], {
    errorMap: () => ({ message: 'Status must be draft, in-progress, or published' }),
  }),
  owner: z.string().min(1, 'Owner is required'),
  lastReviewed: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'lastReviewed must be ISO date (YYYY-MM-DD)'),
  nextReviewDue: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'nextReviewDue must be ISO date (YYYY-MM-DD)'),
  version: z
    .string()
    .regex(/^v\d+\.\d+\.\d+$/, 'version must follow semantic versioning (e.g., v1.0.0)'),
});

/**
 * Parse and validate frontmatter from a policy document.
 * Throws a detailed error if validation fails, preventing build.
 *
 * @param frontmatter - Raw frontmatter object from gray-matter
 * @param slug - Policy slug (for error messages)
 * @param locale - Locale code (for error messages)
 * @returns Validated PolicyMetadata
 * @throws Error with validation details if frontmatter is invalid
 */
export function parseFrontmatter(
  frontmatter: unknown,
  slug: PolicySlug,
  locale: string,
): PolicyMetadata {
  try {
    const parsed = policyMetadataSchema.parse(frontmatter);
    return parsed as PolicyMetadata;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');
      throw new Error(
        `Invalid frontmatter in policy "${slug}" (locale: ${locale}):\n${issues}\n\n` +
          `Ensure all required fields are present and correctly formatted.`,
      );
    }
    throw error;
  }
}

/**
 * Check if a slug is a valid policy slug.
 */
export function isValidPolicySlug(slug: string): slug is PolicySlug {
  return POLICY_SLUGS.includes(slug as PolicySlug);
}
