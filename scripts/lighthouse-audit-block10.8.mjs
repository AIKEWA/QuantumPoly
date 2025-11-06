#!/usr/bin/env node
/**
 * Lighthouse Accessibility Audit for BLOCK 10.8
 * 
 * Comprehensive WCAG 2.2 AA audit across all public pages and governance interfaces
 * Generates individual reports per page and consolidated summary
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES = ['en', 'de', 'es', 'fr', 'it', 'tr'];
const PAGES = [
  '/',
  '/ethics',
  '/privacy',
  '/imprint',
  '/gep',
  '/accessibility',
  '/contact',
  '/governance',
  '/governance/dashboard',
  '/governance/dashboard/timeline',
  '/governance/review',
  '/governance/autonomy',
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'reports', 'lighthouse', 'block10.8');
const ACCESSIBILITY_THRESHOLD = 95;

async function runLighthouseAudit(url, chrome) {
  const options = {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['accessibility', 'performance', 'best-practices', 'seo'],
    port: chrome.port,
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

  try {
    const runnerResult = await lighthouse(url, options);
    if (!runnerResult) {
      throw new Error('Lighthouse failed to return results');
    }
    return runnerResult.lhr;
  } catch (error) {
    console.error(`  ❌ Error auditing ${url}:`, error.message);
    return null;
  }
}

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
        wcagCriteria: audit.details?.items?.[0]?.wcag || [],
      });
    }
  }

  return violations.sort((a, b) => a.score - b.score);
}

async function main() {
  console.log('🔍 BLOCK 10.8 Lighthouse Accessibility Audit\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Threshold: ≥${ACCESSIBILITY_THRESHOLD}/100\n`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let chrome;
  const results = [];
  let totalTests = 0;
  let successfulTests = 0;
  let failedTests = 0;

  try {
    console.log('🚀 Launching Chrome...\n');
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    });

    for (const locale of LOCALES) {
      console.log(`\n📍 Auditing locale: ${locale}`);
      
      for (const page of PAGES) {
        const url = `${BASE_URL}/${locale}${page === '/' ? '' : page}`;
        totalTests++;
        
        console.log(`  Testing: ${url}`);
        
        const lhr = await runLighthouseAudit(url, chrome);
        
        if (!lhr) {
          failedTests++;
          continue;
        }

        const accessibilityScore = Math.round((lhr.categories.accessibility?.score ?? 0) * 100);
        const performanceScore = Math.round((lhr.categories.performance?.score ?? 0) * 100);
        const violations = extractA11yViolations(lhr);

        const result = {
          url,
          locale,
          page,
          timestamp: new Date().toISOString(),
          scores: {
            accessibility: accessibilityScore,
            performance: performanceScore,
            bestPractices: Math.round((lhr.categories['best-practices']?.score ?? 0) * 100),
            seo: Math.round((lhr.categories.seo?.score ?? 0) * 100),
          },
          violations,
          passed: accessibilityScore >= ACCESSIBILITY_THRESHOLD,
        };

        results.push(result);

        // Save individual report
        const filename = `${locale}${page.replace(/\//g, '-') || '-home'}.json`;
        fs.writeFileSync(
          path.join(OUTPUT_DIR, filename),
          JSON.stringify(result, null, 2)
        );

        const status = result.passed ? '✅' : '❌';
        console.log(`    ${status} A11y: ${accessibilityScore}/100 | Violations: ${violations.length}`);
        
        if (result.passed) {
          successfulTests++;
        } else {
          failedTests++;
        }
      }
    }

    // Generate summary
    const summary = {
      timestamp: new Date().toISOString(),
      block: '10.8',
      tooling: {
        lighthouse_version: '11.4.0',
        threshold: ACCESSIBILITY_THRESHOLD,
      },
      totals: {
        tests: totalTests,
        successful: successfulTests,
        failed: failedTests,
        successRate: ((successfulTests / totalTests) * 100).toFixed(1) + '%',
      },
      averageScores: {
        accessibility: (results.reduce((sum, r) => sum + r.scores.accessibility, 0) / results.length).toFixed(1),
        performance: (results.reduce((sum, r) => sum + r.scores.performance, 0) / results.length).toFixed(1),
      },
      results,
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'lighthouse-summary.json'),
      JSON.stringify(summary, null, 2)
    );

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Lighthouse Audit Complete');
    console.log(`  Total tests: ${totalTests}`);
    console.log(`  ✅ Passed: ${successfulTests}`);
    console.log(`  ❌ Failed: ${failedTests}`);
    console.log(`  Average A11y Score: ${summary.averageScores.accessibility}/100`);
    console.log(`  Average Perf Score: ${summary.averageScores.performance}/100`);
    console.log(`\n📁 Reports saved to: ${OUTPUT_DIR}\n`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }

  process.exit(failedTests > 0 ? 1 : 0);
}

main();

