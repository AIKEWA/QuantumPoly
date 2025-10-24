#!/usr/bin/env node
/**
 * Lighthouse Accessibility & Performance Audit
 *
 * Purpose: Automated WCAG compliance verification for ethical governance
 *
 * Thresholds (Ethical Parity with SEO Standards):
 * - Accessibility: ≥95 (WCAG 2.2 AA compliance)
 * - Performance: ≥90 (User experience parity)
 *
 * Evidence Chain:
 * - Exports JSON to reports/lighthouse/accessibility.json
 * - Feeds Block 6.5 Public Governance Dashboard
 * - Provides auditable proof of accessibility commitment
 *
 * Usage:
 *   LH_URL=http://localhost:3000 node scripts/lighthouse-a11y.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TARGET_URL = process.env.LH_URL || 'http://localhost:3000/en';
const OUTPUT_DIR = path.join(__dirname, '..', 'reports', 'lighthouse');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'accessibility.json');

// Ethical Thresholds
const ACCESSIBILITY_THRESHOLD = 95;
const PERFORMANCE_THRESHOLD = 90;

/**
 * Main audit execution
 */
async function runAudit() {
  console.log('🔍 Starting Lighthouse Accessibility & Performance Audit...\n');
  console.log(`Target: ${TARGET_URL}`);
  console.log(`Thresholds: A11y ≥${ACCESSIBILITY_THRESHOLD}, Perf ≥${PERFORMANCE_THRESHOLD}\n`);

  let chrome;
  let exitCode = 0;

  try {
    // Launch Chrome
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    });

    // Configure Lighthouse options
    const options = {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['accessibility', 'performance'],
      port: chrome.port,
      // Desktop preset for consistent results
      formFactor: 'desktop',
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false,
      },
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
      },
    };

    // Run Lighthouse
    console.log('🚀 Running Lighthouse audit...\n');
    const runnerResult = await lighthouse(TARGET_URL, options);

    if (!runnerResult) {
      throw new Error('Lighthouse failed to return results');
    }

    const { lhr, report } = runnerResult;

    // Extract scores (0-1 scale converted to 0-100)
    const accessibilityScore = Math.round((lhr.categories.accessibility?.score ?? 0) * 100);
    const performanceScore = Math.round((lhr.categories.performance?.score ?? 0) * 100);

    // Display results
    console.log('📊 Results:');
    console.log(`  Accessibility: ${accessibilityScore}/100 ${accessibilityScore >= ACCESSIBILITY_THRESHOLD ? '✅' : '❌'}`);
    console.log(`  Performance:   ${performanceScore}/100 ${performanceScore >= PERFORMANCE_THRESHOLD ? '✅' : '❌'}`);
    console.log('');

    // Save report
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, report);
    console.log(`💾 Report saved: ${OUTPUT_FILE}\n`);

    // Generate evidence summary
    const evidenceSummary = {
      timestamp: new Date().toISOString(),
      url: TARGET_URL,
      scores: {
        accessibility: accessibilityScore,
        performance: performanceScore,
      },
      thresholds: {
        accessibility: ACCESSIBILITY_THRESHOLD,
        performance: PERFORMANCE_THRESHOLD,
      },
      passed: accessibilityScore >= ACCESSIBILITY_THRESHOLD && performanceScore >= PERFORMANCE_THRESHOLD,
      violations: extractA11yViolations(lhr),
    };

    // Save summary
    const summaryFile = path.join(OUTPUT_DIR, 'summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(evidenceSummary, null, 2));
    console.log(`📋 Summary saved: ${summaryFile}\n`);

    // Enforce thresholds
    const failures = [];

    if (accessibilityScore < ACCESSIBILITY_THRESHOLD) {
      failures.push(`Accessibility score (${accessibilityScore}) below threshold (${ACCESSIBILITY_THRESHOLD})`);
    }

    if (performanceScore < PERFORMANCE_THRESHOLD) {
      failures.push(`Performance score (${performanceScore}) below threshold (${PERFORMANCE_THRESHOLD})`);
    }

    if (failures.length > 0) {
      console.error('❌ AUDIT FAILED:\n');
      failures.forEach((failure) => console.error(`  • ${failure}`));
      console.error('\n');
      console.error('📖 Ethical Commitment:');
      console.error('   Accessibility is not a feature—it\'s a human right.');
      console.error('   Performance affects accessibility for users on slow connections.');
      console.error('   These thresholds ensure inclusive access for all users.\n');
      exitCode = 1;
    } else {
      console.log('✅ AUDIT PASSED - All thresholds met!\n');
      console.log('🌟 Ethical Evidence Generated:');
      console.log('   This audit provides quantifiable proof of accessibility commitment.');
      console.log('   Results feed the Public Governance Dashboard (Block 6.5).\n');
    }
  } catch (error) {
    console.error('❌ Audit failed with error:\n');
    console.error(error);
    exitCode = 1;
  } finally {
    // Cleanup
    if (chrome) {
      await chrome.kill();
    }
  }

  process.exit(exitCode);
}

/**
 * Extract actionable accessibility violations from Lighthouse report
 */
function extractA11yViolations(lhr) {
  const violations = [];
  const a11yAudits = lhr.categories.accessibility?.auditRefs ?? [];

  for (const auditRef of a11yAudits) {
    const audit = lhr.audits[auditRef.id];
    if (audit && audit.score !== null && audit.score < 1) {
      violations.push({
        id: auditRef.id,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        displayValue: audit.displayValue,
        details: audit.details?.items?.length ?? 0,
      });
    }
  }

  return violations.sort((a, b) => a.score - b.score);
}

// Execute
runAudit();

