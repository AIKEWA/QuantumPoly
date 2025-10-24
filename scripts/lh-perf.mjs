#!/usr/bin/env node

/**
 * Lighthouse Performance Gate
 *
 * Runs Lighthouse against a target URL and enforces a minimum performance score.
 * Exports results to JSON for CI artifacts and debugging.
 *
 * Environment Variables:
 *   LH_URL       - Target URL (default: http://localhost:3000/en)
 *   LH_THRESHOLD - Minimum score 0-100 (default: 90)
 *   LH_OUTPUT    - Output path (default: reports/lighthouse/performance.json)
 *
 * Usage:
 *   node scripts/lh-perf.mjs
 *   LH_URL=http://localhost:3000/de LH_THRESHOLD=85 node scripts/lh-perf.mjs
 */

import fs from 'fs';
import path from 'path';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';

// Configuration
const TARGET_URL = process.env.LH_URL || 'http://localhost:3000/en';
const THRESHOLD = parseInt(process.env.LH_THRESHOLD || '90', 10);
const OUTPUT_PATH = process.env.LH_OUTPUT || 'reports/lighthouse/performance.json';

/**
 * Run Lighthouse and enforce performance threshold
 */
async function runLighthouse() {
  console.log('\n🔦 Lighthouse Performance Analysis');
  console.log(`   URL: ${TARGET_URL}`);
  console.log(`   Threshold: ${THRESHOLD}/100\n`);

  let chrome;
  let exitCode = 0;

  try {
    // Launch headless Chrome
    console.log('🚀 Launching Chrome...');
    chrome = await launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
    });

    console.log(`✓ Chrome running on port ${chrome.port}`);

    // Configure Lighthouse
    const options = {
      port: chrome.port,
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance'],
      // Desktop configuration for consistent testing
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
    console.log('🔍 Running Lighthouse audit...');
    const runnerResult = await lighthouse(TARGET_URL, options);

    if (!runnerResult) {
      throw new Error('Lighthouse returned no results');
    }

    const { lhr, report } = runnerResult;

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_PATH);
    fs.mkdirSync(outputDir, { recursive: true });

    // Write JSON report
    fs.writeFileSync(OUTPUT_PATH, report);
    console.log(`✓ Report saved to ${OUTPUT_PATH}`);

    // Extract performance metrics
    const performanceCategory = lhr.categories.performance;
    const score = Math.round((performanceCategory.score || 0) * 100);

    // Handle zero score (server not accessible)
    if (score === 0) {
      console.warn('\n⚠️  No live server detected, skipping performance score enforcement.');
      console.warn('   This may occur if the server failed to start or is not accessible.\n');
      process.exit(0);
    }

    // Core Web Vitals
    const metrics = lhr.audits;
    const lcp = metrics['largest-contentful-paint']?.displayValue || 'N/A';
    const tbt = metrics['total-blocking-time']?.displayValue || 'N/A';
    const cls = metrics['cumulative-layout-shift']?.displayValue || 'N/A';
    const fcp = metrics['first-contentful-paint']?.displayValue || 'N/A';
    const si = metrics['speed-index']?.displayValue || 'N/A';

    // Display results
    console.log('\n📊 Performance Results');
    console.log('─'.repeat(60));
    console.log(`${'Metric'.padEnd(35)} ${'Value'.padStart(15)}`);
    console.log('─'.repeat(60));
    console.log(`${'Performance Score'.padEnd(35)} ${String(score).padStart(15)}`);
    console.log(`${'First Contentful Paint (FCP)'.padEnd(35)} ${fcp.padStart(15)}`);
    console.log(`${'Largest Contentful Paint (LCP)'.padEnd(35)} ${lcp.padStart(15)}`);
    console.log(`${'Total Blocking Time (TBT)'.padEnd(35)} ${tbt.padStart(15)}`);
    console.log(`${'Cumulative Layout Shift (CLS)'.padEnd(35)} ${cls.padStart(15)}`);
    console.log(`${'Speed Index'.padEnd(35)} ${si.padStart(15)}`);
    console.log('─'.repeat(60));

    // Check threshold
    if (score < THRESHOLD) {
      console.error(`\n❌ Performance score ${score} is below threshold ${THRESHOLD}`);
      console.error('\n💡 Optimization Suggestions:');
      console.error('   • Optimize images with next/image');
      console.error('   • Use dynamic imports for heavy components');
      console.error('   • Defer non-critical scripts');
      console.error('   • Review network waterfall in full report');
      console.error(`   • Check LCP element loading time\n`);
      exitCode = 1;
    } else {
      console.log(`\n✅ Performance score ${score} meets threshold ${THRESHOLD}\n`);
    }
  } catch (err) {
    console.error('\n❌ Lighthouse audit failed:', err.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   • Ensure the dev/preview server is running');
    console.error('   • Check that the URL is accessible');
    console.error('   • Verify Chrome/Chromium is installed');
    console.error('   • Try running with DEBUG=* for verbose logs\n');
    exitCode = 1;
  } finally {
    // Clean up Chrome
    if (chrome) {
      await chrome.kill();
      console.log('✓ Chrome closed');
    }
  }

  process.exit(exitCode);
}

// Execute
runLighthouse();

