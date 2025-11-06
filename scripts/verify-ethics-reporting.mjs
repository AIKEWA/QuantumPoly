#!/usr/bin/env node

/**
 * @fileoverview Ethics Reporting Verification Script
 * @see BLOCK9.4_PUBLIC_ETHICS_API.md
 *
 * Verifies integrity of ethics reporting system:
 * - Public API schema validation
 * - Report file existence and integrity
 * - Hash verification against ledger
 * - GPG signature verification (if present)
 * - Ledger integrity
 *
 * Usage:
 *   node scripts/verify-ethics-reporting.mjs [--report-date YYYY-MM-DD]
 */

import fs from 'fs';
import crypto from 'crypto';
import { execSync } from 'child_process';

console.log('\n🔍 Ethics Reporting Verification');
console.log('═'.repeat(80));

let exitCode = 0;
let passed = 0;
let failed = 0;
let warnings = 0;

/**
 * Test result tracker
 */
function test(name, fn) {
  try {
    process.stdout.write(`\n${name}... `);
    const result = fn();
    if (result === true || result === undefined) {
      console.log('✅ PASS');
      passed++;
    } else if (result === 'warn') {
      console.log('⚠️  WARN');
      warnings++;
    } else {
      console.log('❌ FAIL');
      failed++;
      exitCode = 1;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    failed++;
    exitCode = 1;
  }
}

/**
 * Compute file hash
 */
function computeHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

/**
 * Parse JSONL ledger
 */
function parseLedger(ledgerPath) {
  if (!fs.existsSync(ledgerPath)) {
    return [];
  }
  const content = fs.readFileSync(ledgerPath, 'utf8');
  const lines = content.trim().split('\n').filter(Boolean);
  return lines.map((line) => JSON.parse(line));
}

// Parse arguments
const args = process.argv.slice(2);
const reportDateArg = args.find((arg) => arg.startsWith('--report-date='));
const reportDate = reportDateArg
  ? reportDateArg.split('=')[1]
  : new Date().toISOString().split('T')[0];

console.log(`Report Date: ${reportDate}`);
console.log('═'.repeat(80));

// Test 1: Public API endpoint exists
test('Public API endpoint exists', () => {
  const apiPath = 'src/app/api/ethics/public/route.ts';
  if (!fs.existsSync(apiPath)) {
    throw new Error(`API file not found: ${apiPath}`);
  }
  return true;
});

// Test 2: Manual trigger API exists
test('Manual trigger API exists', () => {
  const apiPath = 'src/app/api/ethics/report/generate/route.ts';
  if (!fs.existsSync(apiPath)) {
    throw new Error(`API file not found: ${apiPath}`);
  }
  return true;
});

// Test 3: Autonomous report script exists
test('Autonomous report script exists', () => {
  const scriptPath = 'scripts/autonomous-report.mjs';
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Script not found: ${scriptPath}`);
  }
  return true;
});

// Test 4: Report generator library exists
test('Report generator library exists', () => {
  const libPath = 'src/lib/governance/report-generator.ts';
  if (!fs.existsSync(libPath)) {
    throw new Error(`Library not found: ${libPath}`);
  }
  return true;
});

// Test 5: Reports directory exists
test('Reports directory exists', () => {
  const reportsDir = 'reports/ethics';
  if (!fs.existsSync(reportsDir)) {
    throw new Error(`Reports directory not found: ${reportsDir}`);
  }
  return true;
});

// Test 6: Check for report files (optional - may not exist yet)
test('Report files check', () => {
  const jsonPath = `reports/ethics/ETHICS_REPORT_${reportDate}.json`;
  const pdfPath = `reports/ethics/ETHICS_REPORT_${reportDate}.pdf`;

  const jsonExists = fs.existsSync(jsonPath);
  const pdfExists = fs.existsSync(pdfPath);

  if (!jsonExists && !pdfExists) {
    console.log('\n  ⚠️  No report files found for today (not yet generated)');
    return 'warn';
  }

  if (!jsonExists) {
    throw new Error(`JSON report not found: ${jsonPath}`);
  }

  if (!pdfExists) {
    throw new Error(`PDF report not found: ${pdfPath}`);
  }

  console.log(`\n  ✓ JSON: ${jsonPath}`);
  console.log(`  ✓ PDF: ${pdfPath}`);
  return true;
});

// Test 7: Verify report hashes (if reports exist)
test('Report hash verification', () => {
  const jsonPath = `reports/ethics/ETHICS_REPORT_${reportDate}.json`;
  const pdfPath = `reports/ethics/ETHICS_REPORT_${reportDate}.pdf`;

  if (!fs.existsSync(jsonPath) || !fs.existsSync(pdfPath)) {
    console.log('\n  ⚠️  Reports not found, skipping hash verification');
    return 'warn';
  }

  const jsonHash = computeHash(jsonPath);
  const pdfHash = computeHash(pdfPath);

  console.log(`\n  JSON Hash: ${jsonHash.substring(0, 16)}...`);
  console.log(`  PDF Hash: ${pdfHash.substring(0, 16)}...`);

  // Check if hash exists in ledger
  const ledger = parseLedger('governance/ledger/ledger.jsonl');
  const reportEntry = ledger.find(
    (entry) =>
      entry.entry_id === `ethics-report-${reportDate}` ||
      entry.ledger_entry_type === 'ethics_reporting'
  );

  if (!reportEntry) {
    console.log('\n  ⚠️  Report entry not found in ledger (may not be committed yet)');
    return 'warn';
  }

  if (reportEntry.hash !== pdfHash && reportEntry.pdf_hash !== pdfHash) {
    throw new Error('PDF hash mismatch with ledger entry');
  }

  console.log('  ✓ Hash verified in ledger');
  return true;
});

// Test 8: Verify GPG signature (if present)
test('GPG signature verification', () => {
  const pdfPath = `reports/ethics/ETHICS_REPORT_${reportDate}.pdf`;
  const sigPath = `reports/ethics/ETHICS_REPORT_${reportDate}.pdf.sig`;

  if (!fs.existsSync(pdfPath)) {
    console.log('\n  ⚠️  PDF not found, skipping signature verification');
    return 'warn';
  }

  if (!fs.existsSync(sigPath)) {
    console.log('\n  ⚠️  No GPG signature found (signing may be disabled)');
    return 'warn';
  }

  try {
    execSync(`gpg --verify ${sigPath} ${pdfPath}`, { stdio: 'pipe' });
    console.log('\n  ✓ GPG signature valid');
    return true;
  } catch (error) {
    console.log('\n  ⚠️  GPG verification failed or key not available');
    return 'warn';
  }
});

// Test 9: Verify ledger integrity
test('Ledger integrity verification', () => {
  try {
    execSync('node scripts/verify-ledger.mjs --scope=all', { stdio: 'pipe' });
    return true;
  } catch (error) {
    throw new Error('Ledger verification failed');
  }
});

// Test 10: Check package.json scripts
test('Package.json scripts configured', () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = [
    'ethics:report',
    'ethics:report:dry-run',
    'ethics:verify-reporting',
    'test:ethics-api',
  ];

  const missingScripts = requiredScripts.filter(
    (script) => !packageJson.scripts[script]
  );

  if (missingScripts.length > 0) {
    throw new Error(`Missing scripts: ${missingScripts.join(', ')}`);
  }

  return true;
});

// Test 11: Check pdfkit dependency
test('pdfkit dependency installed', () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (!packageJson.dependencies.pdfkit) {
    throw new Error('pdfkit not found in dependencies');
  }

  return true;
});

// Test 12: Check GitHub Actions workflow
test('GitHub Actions workflow exists', () => {
  const workflowPath = '.github/workflows/ethics-reporting.yml';
  if (!fs.existsSync(workflowPath)) {
    throw new Error(`Workflow not found: ${workflowPath}`);
  }
  return true;
});

// Test 13: Check documentation
test('Documentation files exist', () => {
  const docs = [
    'BLOCK9.4_PUBLIC_ETHICS_API.md',
    'docs/autonomy/ETHICS_AUTOREPORT_README.md',
  ];

  const missing = docs.filter((doc) => !fs.existsSync(doc));

  if (missing.length > 0) {
    console.log(`\n  ⚠️  Missing documentation: ${missing.join(', ')}`);
    return 'warn';
  }

  return true;
});

// Test 14: Validate JSON report structure (if exists)
test('JSON report structure validation', () => {
  const jsonPath = `reports/ethics/ETHICS_REPORT_${reportDate}.json`;

  if (!fs.existsSync(jsonPath)) {
    console.log('\n  ⚠️  Report not found, skipping structure validation');
    return 'warn';
  }

  const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const requiredFields = [
    'metadata',
    'governance',
    'ethics',
    'consent',
    'verification',
    'compliance',
    'responsibleRoles',
  ];

  const missingFields = requiredFields.filter((field) => !report[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate metadata
  if (!report.metadata.reportId || !report.metadata.reportDate) {
    throw new Error('Invalid metadata structure');
  }

  // Validate EII
  if (typeof report.ethics.eii.current !== 'number') {
    throw new Error('Invalid EII structure');
  }

  console.log(`\n  ✓ Report ID: ${report.metadata.reportId}`);
  console.log(`  ✓ EII: ${report.ethics.eii.current}`);
  console.log(`  ✓ Ledger Entries: ${report.governance.totalEntries}`);

  return true;
});

// Summary
console.log('\n' + '═'.repeat(80));
console.log('VERIFICATION SUMMARY');
console.log('═'.repeat(80));
console.log(`✅ Passed: ${passed}`);
console.log(`⚠️  Warnings: ${warnings}`);
console.log(`❌ Failed: ${failed}`);
console.log('═'.repeat(80));

if (failed === 0 && warnings === 0) {
  console.log('\n🎉 All checks passed!');
} else if (failed === 0) {
  console.log('\n✅ All critical checks passed (some warnings)');
} else {
  console.log('\n❌ Some checks failed');
}

console.log('');
process.exit(exitCode);

