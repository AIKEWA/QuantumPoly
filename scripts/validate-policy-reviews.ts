#!/usr/bin/env ts-node
/**
 * Policy Review Validation Script
 *
 * Scans all policy documents for overdue reviews and schema compliance.
 * Outputs JSON for CI integration and automated commenting.
 *
 * Usage:
 *   ts-node scripts/validate-policy-reviews.ts
 *   npm run validate:policy-reviews
 *
 * Output: validation_output.json
 */

import * as fs from 'fs';
import * as path from 'path';

import matter from 'gray-matter';

import {
  policyMetadataSchema,
  POLICY_SLUGS,
  type PolicySlug,
} from '../src/lib/policies/policy-schema';

interface OverdueItem {
  policy: string;
  locale: string;
  slug: PolicySlug;
  owner: string;
  title: string;
  lastReviewed: string;
  nextReviewDue: string;
  daysOverdue: number;
  daysSinceReview: number;
}

interface SchemaError {
  policy: string;
  locale: string;
  slug: PolicySlug;
  errors: string[];
}

interface ValidationOutput {
  overdue: OverdueItem[];
  schemaErrors: SchemaError[];
  timestamp: string;
  totalPolicies: number;
  overdueCount: number;
  errorCount: number;
}

const LOCALES = ['en', 'de', 'tr', 'es', 'fr', 'it'];
const CONTENT_DIR = path.join(process.cwd(), 'content', 'policies');
const OUTPUT_FILE = path.join(process.cwd(), 'validation_output.json');
const OVERDUE_THRESHOLD_DAYS = 180; // Consider overdue if lastReviewed > 180 days ago

/**
 * Calculate days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((utc2 - utc1) / MS_PER_DAY);
}

/**
 * Check if a policy review is overdue
 */
function isOverdue(
  lastReviewed: string,
  nextReviewDue: string,
): { isOverdue: boolean; daysOverdue: number; daysSinceReview: number } {
  const today = new Date();
  const reviewDate = new Date(lastReviewed);
  const dueDate = new Date(nextReviewDue);

  const daysSinceReview = daysBetween(reviewDate, today);
  const daysOverdue = daysBetween(dueDate, today);

  // Overdue if: nextReviewDue < today OR lastReviewed > OVERDUE_THRESHOLD_DAYS ago
  const isDueDatePassed = daysOverdue > 0;
  const isStaleReview = daysSinceReview > OVERDUE_THRESHOLD_DAYS;

  return {
    isOverdue: isDueDatePassed || isStaleReview,
    daysOverdue: Math.max(0, daysOverdue),
    daysSinceReview,
  };
}

/**
 * Validate a single policy file
 */
function validatePolicy(
  slug: PolicySlug,
  locale: string,
): { overdue: OverdueItem | null; error: SchemaError | null } {
  const filePath = path.join(CONTENT_DIR, slug, `${locale}.md`);

  if (!fs.existsSync(filePath)) {
    return {
      overdue: null,
      error: {
        policy: `${slug}/${locale}.md`,
        locale,
        slug,
        errors: ['File does not exist'],
      },
    };
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter } = matter(fileContent);

    // Validate schema
    const result = policyMetadataSchema.safeParse(frontmatter);

    if (!result.success) {
      const errors = result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      );
      return {
        overdue: null,
        error: {
          policy: `${slug}/${locale}.md`,
          locale,
          slug,
          errors,
        },
      };
    }

    // Check for overdue reviews
    const metadata = result.data;
    const {
      isOverdue: overdueFlag,
      daysOverdue,
      daysSinceReview,
    } = isOverdue(metadata.lastReviewed, metadata.nextReviewDue);

    if (overdueFlag) {
      return {
        overdue: {
          policy: `${slug}/${locale}.md`,
          locale,
          slug,
          owner: metadata.owner,
          title: metadata.title,
          lastReviewed: metadata.lastReviewed,
          nextReviewDue: metadata.nextReviewDue,
          daysOverdue,
          daysSinceReview,
        },
        error: null,
      };
    }

    return { overdue: null, error: null };
  } catch (error) {
    return {
      overdue: null,
      error: {
        policy: `${slug}/${locale}.md`,
        locale,
        slug,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
    };
  }
}

/**
 * Main validation function
 */
function main() {
  console.log('🔍 Validating policy reviews...\n');

  const overdueItems: OverdueItem[] = [];
  const schemaErrors: SchemaError[] = [];
  let totalPolicies = 0;

  for (const slug of POLICY_SLUGS) {
    for (const locale of LOCALES) {
      totalPolicies++;
      const { overdue, error } = validatePolicy(slug, locale);

      if (error) {
        schemaErrors.push(error);
        console.error(`❌ Schema error in ${error.policy}:`);
        error.errors.forEach((err) => console.error(`   - ${err}`));
      }

      if (overdue) {
        overdueItems.push(overdue);
        console.warn(`⚠️  Overdue: ${overdue.policy} (${overdue.daysOverdue}d past due)`);
      }
    }
  }

  // Generate output
  const output: ValidationOutput = {
    overdue: overdueItems,
    schemaErrors,
    timestamp: new Date().toISOString(),
    totalPolicies,
    overdueCount: overdueItems.length,
    errorCount: schemaErrors.length,
  };

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

  // Summary
  console.log(`\n📊 Validation Summary:`);
  console.log(`   Total policies: ${totalPolicies}`);
  console.log(`   Overdue reviews: ${overdueItems.length}`);
  console.log(`   Schema errors: ${schemaErrors.length}`);
  console.log(`\n✅ Output written to: ${OUTPUT_FILE}`);

  // Exit with error code if schema errors found
  if (schemaErrors.length > 0) {
    console.error('\n❌ Validation failed due to schema errors.');
    process.exit(1);
  }

  if (overdueItems.length > 0) {
    console.warn('\n⚠️  Warning: Some policies have overdue reviews.');
  }

  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main();
}

export { validatePolicy, isOverdue, daysBetween };
