#!/usr/bin/env node

/**
 * @fileoverview Consent ledger verification script
 * @module scripts/verify-consent-ledger
 * @see BLOCK9.2_CONSENT_MANAGEMENT_FRAMEWORK.md
 *
 * Validates:
 * - JSONL format integrity
 * - Schema compliance
 * - Timestamp ordering
 * - Policy version consistency
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';

// Consent event schema
const ConsentEventSchema = z.object({
  userId: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.enum(['consent_given', 'consent_updated', 'consent_revoked', 'banner_dismissed']),
  preferences: z.object({
    essential: z.literal(true),
    analytics: z.boolean(),
    performance: z.boolean(),
  }),
  policyVersion: z.string().regex(/^v\d+\.\d+\.\d+$/),
  userAgent: z.string().optional(),
  ipAddress: z.string(),
});

/**
 * Verify consent ledger integrity
 */
async function verifyConsentLedger() {
  console.log('🔍 Verifying consent ledger...\n');

  const ledgerPath = join(process.cwd(), 'governance', 'consent', 'ledger.jsonl');

  try {
    const content = await readFile(ledgerPath, 'utf-8');

    // Empty ledger is valid (no consents yet)
    if (!content.trim()) {
      console.log('✅ Ledger is empty (no consent events recorded yet)');
      console.log('   This is expected for a new installation.\n');
      return true;
    }

    const lines = content.trim().split('\n');
    console.log(`📊 Total entries: ${lines.length}\n`);

    let errors = 0;
    let warnings = 0;
    const timestamps = [];
    const policyVersions = new Set();

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const line = lines[i];

      try {
        // Parse JSON
        const entry = JSON.parse(line);

        // Validate schema
        const result = ConsentEventSchema.safeParse(entry);
        if (!result.success) {
          console.error(`❌ Line ${lineNum}: Schema validation failed`);
          console.error(`   ${result.error.message}`);
          errors++;
          continue;
        }

        // Collect timestamps for ordering check
        timestamps.push({ line: lineNum, timestamp: new Date(entry.timestamp) });

        // Collect policy versions
        policyVersions.add(entry.policyVersion);

        // Check IP anonymization (last octet should be 0 for IPv4)
        if (entry.ipAddress.includes('.')) {
          const parts = entry.ipAddress.split('.');
          if (parts[3] !== '0') {
            console.warn(`⚠️  Line ${lineNum}: IP address may not be properly anonymized`);
            warnings++;
          }
        }
      } catch (error) {
        console.error(`❌ Line ${lineNum}: Invalid JSON`);
        console.error(`   ${error.message}`);
        errors++;
      }
    }

    // Check timestamp ordering
    console.log('\n🕐 Checking timestamp ordering...');
    let orderingErrors = 0;
    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i].timestamp < timestamps[i - 1].timestamp) {
        console.warn(
          `⚠️  Timestamps out of order: Line ${timestamps[i - 1].line} → Line ${timestamps[i].line}`,
        );
        orderingErrors++;
      }
    }

    if (orderingErrors === 0) {
      console.log('✅ All timestamps are in chronological order');
    } else {
      console.warn(`⚠️  ${orderingErrors} timestamp ordering issues found`);
      warnings += orderingErrors;
    }

    // Report policy versions
    console.log('\n📋 Policy versions found:');
    policyVersions.forEach((version) => {
      console.log(`   - ${version}`);
    });

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total entries: ${lines.length}`);
    console.log(`Errors: ${errors}`);
    console.log(`Warnings: ${warnings}`);
    console.log(`Policy versions: ${policyVersions.size}`);

    if (errors === 0 && warnings === 0) {
      console.log('\n✅ Consent ledger verification PASSED');
      return true;
    } else if (errors === 0) {
      console.log('\n⚠️  Consent ledger verification PASSED with warnings');
      return true;
    } else {
      console.log('\n❌ Consent ledger verification FAILED');
      return false;
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('✅ Ledger file does not exist yet (will be created on first consent)');
      console.log('   This is expected for a new installation.\n');
      return true;
    }

    console.error('❌ Error reading ledger file:', error.message);
    return false;
  }
}

// Run verification
verifyConsentLedger()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });

