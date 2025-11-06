#!/usr/bin/env node

/**
 * Daily & Weekly Report Verification Script
 * 
 * Validates integrity of all daily/weekly reports through hash verification,
 * ledger entry validation, continuity checks, and schema validation.
 * 
 * Block 10.7 — Daily Governance Reports
 * 
 * Usage:
 *   node scripts/verify-daily-reports.mjs [options]
 * 
 * Options:
 *   --type=<daily|weekly|all>  Report type to verify (default: all)
 *   --start-date=<YYYY-MM-DD>  Start date for verification range
 *   --end-date=<YYYY-MM-DD>    End date for verification range
 *   --verbose                  Detailed output
 * 
 * Exit Codes:
 *   0 - All verifications passed
 *   1 - Some verifications failed
 *   2 - Fatal error during verification
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command-line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');

const typeArg = args.find(arg => arg.startsWith('--type='));
const reportType = typeArg ? typeArg.split('=')[1] : 'all';

const startDateArg = args.find(arg => arg.startsWith('--start-date='));
const endDateArg = args.find(arg => arg.startsWith('--end-date='));

/**
 * Log message if verbose mode enabled
 */
function log(message) {
  if (verbose) {
    console.log(message);
  }
}

/**
 * Compute SHA-256 hash
 */
function sha256(data) {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Read JSON file safely
 */
function readJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log(`Warning: Failed to read ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Read JSONL ledger
 */
function readLedger(ledgerPath) {
  if (!fs.existsSync(ledgerPath)) {
    return [];
  }

  const content = fs.readFileSync(ledgerPath, 'utf8');
  const lines = content.trim().split('\n').filter(Boolean);
  
  return lines.map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      console.error(`Invalid JSON at line ${index + 1} in ${ledgerPath}`);
      return null;
    }
  }).filter(Boolean);
}

/**
 * Verify report hash
 */
function verifyHash(report, reportPath) {
  if (!report.hash) {
    return { valid: false, reason: 'No hash field present' };
  }
  
  // Recompute hash (exclude hash field itself)
  const reportForHash = { ...report };
  delete reportForHash.hash;
  const computedHash = sha256(JSON.stringify(reportForHash, Object.keys(reportForHash).sort()));
  
  if (computedHash === report.hash) {
    return { valid: true };
  } else {
    return { 
      valid: false, 
      reason: 'Hash mismatch',
      expected: report.hash,
      computed: computedHash
    };
  }
}

/**
 * Verify report against schema (basic validation)
 */
function verifySchema(report, schemaType) {
  const issues = [];
  
  if (schemaType === 'daily') {
    // Check required fields
    if (!report.report_id || !report.report_id.startsWith('daily-governance-')) {
      issues.push('Invalid or missing report_id');
    }
    if (!report.timestamp) {
      issues.push('Missing timestamp');
    }
    if (!report.report_date || !/^\d{4}-\d{2}-\d{2}$/.test(report.report_date)) {
      issues.push('Invalid or missing report_date');
    }
    if (report.verified === undefined) {
      issues.push('Missing verified field');
    }
    if (!report.system_health) {
      issues.push('Missing system_health');
    }
    if (!report.governance_links) {
      issues.push('Missing governance_links');
    }
    if (!report.hash || !/^[a-f0-9]{64}$/.test(report.hash)) {
      issues.push('Invalid or missing hash');
    }
  } else if (schemaType === 'weekly') {
    // Check required fields
    if (!report.summary_id || !report.summary_id.startsWith('weekly-')) {
      issues.push('Invalid or missing summary_id');
    }
    if (!report.timestamp) {
      issues.push('Missing timestamp');
    }
    if (!report.week || !/^\d{4}-W\d{2}$/.test(report.week)) {
      issues.push('Invalid or missing week');
    }
    if (!report.period || !report.period.start || !report.period.end) {
      issues.push('Invalid or missing period');
    }
    if (report.daily_reports_included === undefined) {
      issues.push('Missing daily_reports_included');
    }
    if (!report.hash || !/^[a-f0-9]{64}$/.test(report.hash)) {
      issues.push('Invalid or missing hash');
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Check if report is referenced in ledger
 */
function verifyLedgerReference(reportId, ledger) {
  const ledgerEntry = ledger.find(entry => 
    entry.entry_id === 'entry-block10.7-daily-reports' ||
    entry.id === 'entry-block10.7-daily-reports'
  );
  
  if (!ledgerEntry) {
    return { valid: false, reason: 'Block 10.7 ledger entry not found' };
  }
  
  return { valid: true, ledgerEntry };
}

/**
 * Verify timestamp ordering
 */
function verifyTimestampOrdering(reports) {
  const issues = [];
  
  for (let i = 1; i < reports.length; i++) {
    const prev = new Date(reports[i - 1].report.timestamp);
    const current = new Date(reports[i].report.timestamp);
    
    if (current < prev) {
      issues.push({
        file1: reports[i - 1].file,
        file2: reports[i].file,
        reason: 'Timestamp ordering violation'
      });
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Check continuity (no missing days)
 */
function verifyContinuity(reports) {
  if (reports.length < 2) {
    return { valid: true, missingDates: [] };
  }
  
  const dates = reports.map(r => r.report.report_date).sort();
  const missingDates = [];
  
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currentDate = new Date(dates[i]);
    const daysDiff = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) {
      // Missing days detected
      for (let j = 1; j < daysDiff; j++) {
        const missingDate = new Date(prevDate);
        missingDate.setDate(prevDate.getDate() + j);
        missingDates.push(missingDate.toISOString().split('T')[0]);
      }
    }
  }
  
  return {
    valid: missingDates.length === 0,
    missingDates
  };
}

/**
 * Verify daily reports
 */
function verifyDailyReports(startDate, endDate) {
  console.log('\n📋 Verifying Daily Reports...\n');
  
  const reportsDir = 'reports';
  if (!fs.existsSync(reportsDir)) {
    console.error('❌ Reports directory not found\n');
    return { passed: 0, failed: 0, issues: [] };
  }
  
  // Find all daily report files
  const files = fs.readdirSync(reportsDir)
    .filter(f => f.startsWith('monitoring-') && f.endsWith('.json'))
    .filter(f => {
      if (!startDate && !endDate) return true;
      const date = f.replace('monitoring-', '').replace('.json', '');
      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;
      return true;
    })
    .sort();
  
  if (files.length === 0) {
    console.log('⚠️  No daily reports found\n');
    return { passed: 0, failed: 0, issues: [] };
  }
  
  console.log(`Found ${files.length} daily report(s)\n`);
  
  const ledger = readLedger('governance/ledger/ledger.jsonl');
  let passed = 0;
  let failed = 0;
  const allIssues = [];
  const reportsList = [];
  
  // Verify each report
  for (const file of files) {
    const filePath = path.join(reportsDir, file);
    const report = readJSON(filePath);
    
    if (!report) {
      console.log(`  ❌ ${file}: Failed to read`);
      failed++;
      allIssues.push({ file, issue: 'Failed to read file' });
      continue;
    }
    
    reportsList.push({ file, report });
    const fileIssues = [];
    
    // Verify hash
    const hashResult = verifyHash(report, filePath);
    if (!hashResult.valid) {
      fileIssues.push(`Hash verification: ${hashResult.reason}`);
    }
    
    // Verify schema
    const schemaResult = verifySchema(report, 'daily');
    if (!schemaResult.valid) {
      fileIssues.push(`Schema validation: ${schemaResult.issues.join(', ')}`);
    }
    
    // Verify ledger reference
    const ledgerResult = verifyLedgerReference(report.report_id, ledger);
    if (!ledgerResult.valid) {
      fileIssues.push(`Ledger reference: ${ledgerResult.reason}`);
    }
    
    if (fileIssues.length === 0) {
      console.log(`  ✅ ${file}`);
      passed++;
    } else {
      console.log(`  ❌ ${file}`);
      fileIssues.forEach(issue => {
        console.log(`     - ${issue}`);
        allIssues.push({ file, issue });
      });
      failed++;
    }
  }
  
  // Verify timestamp ordering
  console.log('');
  log('Verifying timestamp ordering...');
  const orderingResult = verifyTimestampOrdering(reportsList);
  if (!orderingResult.valid) {
    console.log(`  ⚠️  Timestamp ordering issues: ${orderingResult.issues.length}`);
    orderingResult.issues.forEach(issue => {
      console.log(`     - ${issue.file1} > ${issue.file2}`);
      allIssues.push({ file: 'ordering', issue: issue.reason });
    });
  } else {
    log('  ✅ Timestamp ordering valid');
  }
  
  // Verify continuity
  log('Verifying continuity...');
  const continuityResult = verifyContinuity(reportsList);
  if (!continuityResult.valid) {
    console.log(`  ⚠️  Missing dates: ${continuityResult.missingDates.length}`);
    continuityResult.missingDates.forEach(date => {
      console.log(`     - ${date}`);
      allIssues.push({ file: 'continuity', issue: `Missing report for ${date}` });
    });
  } else {
    log('  ✅ Continuity valid');
  }
  
  console.log('');
  
  return { passed, failed, issues: allIssues };
}

/**
 * Verify weekly summaries
 */
function verifyWeeklySummaries() {
  console.log('\n📊 Verifying Weekly Summaries...\n');
  
  const summaryPath = 'reports/governance-summary.json';
  
  if (!fs.existsSync(summaryPath)) {
    console.log('⚠️  Weekly summary not found\n');
    return { passed: 0, failed: 0, issues: [] };
  }
  
  const summary = readJSON(summaryPath);
  if (!summary) {
    console.error('❌ Failed to read weekly summary\n');
    return { passed: 0, failed: 1, issues: [{ file: summaryPath, issue: 'Failed to read file' }] };
  }
  
  const fileIssues = [];
  
  // Verify hash
  const hashResult = verifyHash(summary, summaryPath);
  if (!hashResult.valid) {
    fileIssues.push(`Hash verification: ${hashResult.reason}`);
  }
  
  // Verify schema
  const schemaResult = verifySchema(summary, 'weekly');
  if (!schemaResult.valid) {
    fileIssues.push(`Schema validation: ${schemaResult.issues.join(', ')}`);
  }
  
  // Verify all referenced daily reports exist
  if (summary.daily_report_files) {
    const missingFiles = summary.daily_report_files.filter(f => !fs.existsSync(f));
    if (missingFiles.length > 0) {
      fileIssues.push(`Missing referenced files: ${missingFiles.join(', ')}`);
    }
  }
  
  if (fileIssues.length === 0) {
    console.log(`  ✅ ${summaryPath}`);
    console.log('');
    return { passed: 1, failed: 0, issues: [] };
  } else {
    console.log(`  ❌ ${summaryPath}`);
    fileIssues.forEach(issue => {
      console.log(`     - ${issue}`);
    });
    console.log('');
    return { passed: 0, failed: 1, issues: fileIssues.map(issue => ({ file: summaryPath, issue })) };
  }
}

/**
 * Main verification function
 */
async function main() {
  console.log('\n🔍 Daily & Weekly Report Verification');
  console.log('=======================================\n');
  
  const startDate = startDateArg ? startDateArg.split('=')[1] : null;
  const endDate = endDateArg ? endDateArg.split('=')[1] : null;
  
  console.log(`Report Type: ${reportType}`);
  if (startDate) console.log(`Start Date: ${startDate}`);
  if (endDate) console.log(`End Date: ${endDate}`);
  console.log(`Verbose: ${verbose ? 'Yes' : 'No'}`);
  
  let totalPassed = 0;
  let totalFailed = 0;
  const allIssues = [];
  
  // Verify daily reports
  if (reportType === 'daily' || reportType === 'all') {
    const dailyResults = verifyDailyReports(startDate, endDate);
    totalPassed += dailyResults.passed;
    totalFailed += dailyResults.failed;
    allIssues.push(...dailyResults.issues);
  }
  
  // Verify weekly summaries
  if (reportType === 'weekly' || reportType === 'all') {
    const weeklyResults = verifyWeeklySummaries();
    totalPassed += weeklyResults.passed;
    totalFailed += weeklyResults.failed;
    allIssues.push(...weeklyResults.issues);
  }
  
  // Summary
  console.log('✅ Verification complete\n');
  console.log(`Total Passed: ${totalPassed}`);
  console.log(`Total Failed: ${totalFailed}`);
  console.log(`Total Issues: ${allIssues.length}`);
  console.log('');
  
  // Exit with appropriate code
  if (totalFailed > 0 || allIssues.length > 0) {
    console.log('⚠️  Some verifications failed\n');
    process.exit(1);
  } else {
    console.log('🎉 All verifications passed\n');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(2);
});

