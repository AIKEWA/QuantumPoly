"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.policyMetadataSchema = exports.POLICY_SLUGS = void 0;
exports.parseFrontmatter = parseFrontmatter;
exports.isValidPolicySlug = isValidPolicySlug;
const zod_1 = require("zod");
/**
 * Valid policy slugs for the Trust & Policies system.
 */
exports.POLICY_SLUGS = ['ethics', 'gep', 'privacy', 'imprint'];
/**
 * Zod schema for validating policy frontmatter at build time.
 * Ensures all required fields are present and correctly typed.
 */
exports.policyMetadataSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    summary: zod_1.z.string().min(10, 'Summary must be at least 10 characters'),
    status: zod_1.z.enum(['draft', 'in-progress', 'published'], {
        errorMap: () => ({ message: 'Status must be draft, in-progress, or published' }),
    }),
    owner: zod_1.z.string().min(1, 'Owner is required'),
    lastReviewed: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'lastReviewed must be ISO date (YYYY-MM-DD)'),
    nextReviewDue: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'nextReviewDue must be ISO date (YYYY-MM-DD)'),
    version: zod_1.z
        .string()
        .regex(/^v\d+\.\d+\.\d+$/, 'version must follow semantic versioning (e.g., v1.0.0)'),
    license: zod_1.z.string().optional(),
    responsibleParty: zod_1.z.string().optional(),
    versionHash: zod_1.z.string().optional(),
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
function parseFrontmatter(frontmatter, slug, locale) {
    try {
        const parsed = exports.policyMetadataSchema.parse(frontmatter);
        return parsed;
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const issues = error.issues
                .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
                .join('\n');
            throw new Error(`Invalid frontmatter in policy "${slug}" (locale: ${locale}):\n${issues}\n\n` +
                `Ensure all required fields are present and correctly formatted.`);
        }
        throw error;
    }
}
/**
 * Check if a slug is a valid policy slug.
 */
function isValidPolicySlug(slug) {
    return exports.POLICY_SLUGS.includes(slug);
}
