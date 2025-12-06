#!/usr/bin/env ts-node
"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePolicy = validatePolicy;
exports.isOverdue = isOverdue;
exports.daysBetween = daysBetween;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const policy_schema_1 = require("../src/lib/policies/policy-schema");
const LOCALES = ['en', 'de', 'tr', 'es', 'fr', 'it'];
const CONTENT_DIR = path.join(process.cwd(), 'content', 'policies');
const OUTPUT_FILE = path.join(process.cwd(), 'validation_output.json');
const OVERDUE_THRESHOLD_DAYS = 180; // Consider overdue if lastReviewed > 180 days ago
/**
 * Calculate days between two dates
 */
function daysBetween(date1, date2) {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.floor((utc2 - utc1) / MS_PER_DAY);
}
/**
 * Check if a policy review is overdue
 */
function isOverdue(lastReviewed, nextReviewDue) {
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
function validatePolicy(slug, locale) {
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
        const { data: frontmatter } = (0, gray_matter_1.default)(fileContent);
        // Validate schema
        const result = policy_schema_1.policyMetadataSchema.safeParse(frontmatter);
        if (!result.success) {
            const errors = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
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
        const { isOverdue: overdueFlag, daysOverdue, daysSinceReview, } = isOverdue(metadata.lastReviewed, metadata.nextReviewDue);
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
    }
    catch (error) {
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
    const overdueItems = [];
    const schemaErrors = [];
    let totalPolicies = 0;
    for (const slug of policy_schema_1.POLICY_SLUGS) {
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
    const output = {
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
