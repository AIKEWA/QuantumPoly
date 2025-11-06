#!/usr/bin/env node

/**
 * @fileoverview Consent compliance verification script
 * @module scripts/verify-consent-compliance
 * @see BLOCK9.2_CONSENT_MANAGEMENT_FRAMEWORK.md
 *
 * Verifies:
 * - Banner component exists
 * - Modal component exists
 * - API endpoint exists
 * - Privacy Policy updated
 * - Translations present
 * - Governance ledger entry
 */

import { access, readFile } from 'fs/promises';
import { join } from 'path';

const checks = [];

/**
 * Check if file exists
 */
async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if file contains text
 */
async function fileContains(path, text) {
  try {
    const content = await readFile(path, 'utf-8');
    return content.includes(text);
  } catch {
    return false;
  }
}

/**
 * Run compliance checks
 */
async function verifyCompliance() {
  console.log('🔍 Verifying Block 9.2 Consent Management Compliance\n');
  console.log('='.repeat(60) + '\n');

  const root = process.cwd();

  // 1. Core Components
  console.log('📦 Core Components');
  checks.push({
    name: 'ConsentBanner component',
    result: await fileExists(join(root, 'src/components/consent/ConsentBanner.tsx')),
  });
  checks.push({
    name: 'ConsentModal component',
    result: await fileExists(join(root, 'src/components/consent/ConsentModal.tsx')),
  });
  checks.push({
    name: 'ConsentManager component',
    result: await fileExists(join(root, 'src/components/consent/ConsentManager.tsx')),
  });
  checks.push({
    name: 'VercelAnalytics component',
    result: await fileExists(join(root, 'src/components/analytics/VercelAnalytics.tsx')),
  });
  checks.push({
    name: 'useConsent hook',
    result: await fileExists(join(root, 'src/hooks/useConsent.ts')),
  });
  checks.push({
    name: 'Consent types',
    result: await fileExists(join(root, 'src/types/consent.ts')),
  });

  // 2. API Endpoint
  console.log('\n🔌 API Endpoint');
  checks.push({
    name: 'Consent API route',
    result: await fileExists(join(root, 'src/app/api/consent/route.ts')),
  });

  // 3. Settings Page
  console.log('\n⚙️  Settings Page');
  checks.push({
    name: 'Consent settings page',
    result: await fileExists(join(root, 'src/app/[locale]/settings/consent/page.tsx')),
  });
  checks.push({
    name: 'Consent settings client',
    result: await fileExists(join(root, 'src/app/[locale]/settings/consent/ConsentSettingsClient.tsx')),
  });

  // 4. Translations
  console.log('\n🌍 Translations');
  const locales = ['en', 'de', 'tr', 'es', 'fr', 'it'];
  for (const locale of locales) {
    checks.push({
      name: `Consent translations (${locale})`,
      result: await fileExists(join(root, `src/locales/${locale}/consent.json`)),
    });
  }

  // 5. Privacy Policy Updates
  console.log('\n📜 Privacy Policy');
  checks.push({
    name: 'Privacy Policy EN updated (Vercel Analytics)',
    result: await fileContains(
      join(root, 'content/policies/privacy/en.md'),
      'Vercel Analytics',
    ),
  });
  checks.push({
    name: 'Privacy Policy DE updated (Vercel Analytics)',
    result: await fileContains(
      join(root, 'content/policies/privacy/de.md'),
      'Vercel Analytics',
    ),
  });
  checks.push({
    name: 'Privacy Policy EN links to consent settings',
    result: await fileContains(
      join(root, 'content/policies/privacy/en.md'),
      '/en/settings/consent',
    ),
  });
  checks.push({
    name: 'Privacy Policy DE links to consent settings',
    result: await fileContains(
      join(root, 'content/policies/privacy/de.md'),
      '/de/settings/consent',
    ),
  });

  // 6. Governance
  console.log('\n📋 Governance');
  checks.push({
    name: 'Consent ledger directory',
    result: await fileExists(join(root, 'governance/consent')),
  });
  checks.push({
    name: 'Consent ledger README',
    result: await fileExists(join(root, 'governance/consent/README.md')),
  });
  checks.push({
    name: 'Consent ledger file',
    result: await fileExists(join(root, 'governance/consent/ledger.jsonl')),
  });
  checks.push({
    name: 'Block 9.2 documentation',
    result: await fileExists(join(root, 'BLOCK9.2_CONSENT_MANAGEMENT_FRAMEWORK.md')),
  });

  // 7. Integration
  console.log('\n🔗 Integration');
  checks.push({
    name: 'ConsentManager in root layout',
    result: await fileContains(
      join(root, 'src/app/[locale]/layout.tsx'),
      'ConsentManager',
    ),
  });
  checks.push({
    name: 'VercelAnalytics in root layout',
    result: await fileContains(
      join(root, 'src/app/[locale]/layout.tsx'),
      'VercelAnalytics',
    ),
  });

  // 8. Package Dependencies
  console.log('\n📦 Dependencies');
  checks.push({
    name: '@vercel/analytics package',
    result: await fileContains(
      join(root, 'package.json'),
      '@vercel/analytics',
    ),
  });

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPLIANCE CHECK RESULTS');
  console.log('='.repeat(60) + '\n');

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    const status = check.result ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
    if (check.result) {
      passed++;
    } else {
      failed++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total checks: ${checks.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success rate: ${((passed / checks.length) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n✅ All compliance checks PASSED');
    console.log('   Block 9.2 implementation is complete and compliant.\n');
    return true;
  } else {
    console.log('\n❌ Some compliance checks FAILED');
    console.log('   Please review the failed checks above.\n');
    return false;
  }
}

// Run verification
verifyCompliance()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });

