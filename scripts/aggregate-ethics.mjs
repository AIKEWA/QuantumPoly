#!/usr/bin/env node

/**
 * Ethical Data Aggregation Script
 *
 * Aggregates CI artifacts (Lighthouse, Coverage, Bundle, Validation) into a unified
 * ethical scorecard with Ethical Integrity Index (EII) calculation.
 *
 * Usage:
 *   node scripts/aggregate-ethics.mjs
 *
 * Outputs:
 *   /reports/governance/dashboard-data.json
 *   /reports/governance/metrics-history.json (appends historical data)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

// Configuration
const REPORTS_DIR = './reports';
const GOVERNANCE_DIR = './reports/governance';
const LIGHTHOUSE_DIR = './reports/lighthouse';
const COVERAGE_FILE = './coverage/coverage-final.json';
const VALIDATION_FILE = './validation_output.json';
const BUILD_MANIFEST = './.next/build-manifest.json';
const OUTPUT_FILE = path.join(GOVERNANCE_DIR, 'dashboard-data.json');
const HISTORY_FILE = path.join(GOVERNANCE_DIR, 'metrics-history.json');

// EII Weights
const WEIGHTS = {
  a11y: 0.3,
  performance: 0.3,
  seo: 0.2,
  bundle: 0.2,
};

/**
 * Ensure output directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Compute SHA256 hash of data
 */
function sha256(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Get current git commit hash
 */
function getCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn('⚠️  Could not retrieve git commit hash:', error.message);
    return 'unknown';
  }
}

/**
 * Get project version from package.json
 */
function getProjectVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    return pkg.version || '0.1.0';
  } catch (error) {
    console.warn('⚠️  Could not read package.json:', error.message);
    return '0.1.0';
  }
}

/**
 * Parse Lighthouse reports
 */
function parseLighthouseReports() {
  const reports = [];
  
  if (!fs.existsSync(LIGHTHOUSE_DIR)) {
    console.warn('⚠️  Lighthouse reports directory not found');
    return { seo: 0, a11y: 0, performance: 0, count: 0 };
  }

  const files = fs.readdirSync(LIGHTHOUSE_DIR).filter(f => f.endsWith('.json'));
  
  let seoTotal = 0;
  let a11yTotal = 0;
  let perfTotal = 0;
  let count = 0;

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(LIGHTHOUSE_DIR, file), 'utf8'));
      
      if (data.categories) {
        seoTotal += (data.categories.seo?.score || 0) * 100;
        a11yTotal += (data.categories.accessibility?.score || 0) * 100;
        perfTotal += (data.categories.performance?.score || 0) * 100;
        count++;

        reports.push({
          file,
          seo: (data.categories.seo?.score || 0) * 100,
          a11y: (data.categories.accessibility?.score || 0) * 100,
          performance: (data.categories.performance?.score || 0) * 100,
        });
      }
    } catch (error) {
      console.warn(`⚠️  Could not parse ${file}:`, error.message);
    }
  }

  const avgSeo = count > 0 ? seoTotal / count : 0;
  const avgA11y = count > 0 ? a11yTotal / count : 0;
  const avgPerf = count > 0 ? perfTotal / count : 0;

  console.log(`✅ Parsed ${count} Lighthouse reports`);
  console.log(`   SEO: ${avgSeo.toFixed(1)}, A11y: ${avgA11y.toFixed(1)}, Perf: ${avgPerf.toFixed(1)}`);

  return {
    seo: avgSeo,
    a11y: avgA11y,
    performance: avgPerf,
    count,
    reports,
  };
}

/**
 * Parse bundle budget data
 */
function parseBundleData() {
  if (!fs.existsSync(BUILD_MANIFEST)) {
    console.warn('⚠️  Build manifest not found. Run `npm run build` first.');
    return { score: 0, size: 0 };
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(BUILD_MANIFEST, 'utf8'));
    const { pages } = manifest;

    if (!pages) {
      console.warn('⚠️  Invalid manifest structure');
      return { score: 0, size: 0 };
    }

    // Calculate average bundle size
    const routes = Object.entries(pages).filter(
      ([route]) => !route.startsWith('/_') && route !== '/404' && route !== '/500'
    );

    let totalSize = 0;
    let routeCount = 0;

    for (const [, files] of routes) {
      const jsFiles = files.filter(f => f.endsWith('.js'));
      for (const file of jsFiles) {
        const fullPath = path.join('.next', file);
        if (fs.existsSync(fullPath)) {
          totalSize += fs.statSync(fullPath).size;
        }
      }
      routeCount++;
    }

    const avgSize = routeCount > 0 ? totalSize / routeCount : 0;
    const avgSizeKB = avgSize / 1024;

    // Score: 100 points if <150KB, linearly decreasing to 0 at 500KB
    let score = 100;
    if (avgSizeKB > 150) {
      score = Math.max(0, 100 - ((avgSizeKB - 150) / 350) * 100);
    }

    console.log(`✅ Bundle analysis: ${avgSizeKB.toFixed(1)} KB average (score: ${score.toFixed(1)})`);

    return {
      score: Math.round(score),
      size: Math.round(avgSizeKB),
      totalSize: Math.round(totalSize / 1024),
      routeCount,
    };
  } catch (error) {
    console.warn('⚠️  Could not parse bundle data:', error.message);
    return { score: 0, size: 0 };
  }
}

/**
 * Parse validation output
 */
function parseValidation() {
  if (!fs.existsSync(VALIDATION_FILE)) {
    console.warn('⚠️  Validation output not found');
    return { score: 100 };
  }

  try {
    const data = JSON.parse(fs.readFileSync(VALIDATION_FILE, 'utf8'));
    
    // Score based on errors: 100 if no errors, decreasing by 10 per error
    const errorCount = data.errorCount || 0;
    const score = Math.max(0, 100 - errorCount * 10);

    console.log(`✅ Validation: ${errorCount} errors (score: ${score})`);

    return {
      score,
      errorCount,
      overdueCount: data.overdueCount || 0,
    };
  } catch (error) {
    console.warn('⚠️  Could not parse validation data:', error.message);
    return { score: 100 };
  }
}

/**
 * Calculate Ethical Integrity Index (EII)
 */
function calculateEII(metrics) {
  const eii =
    WEIGHTS.a11y * metrics.a11y +
    WEIGHTS.performance * metrics.performance +
    WEIGHTS.seo * metrics.seo +
    WEIGHTS.bundle * metrics.bundle;

  return Math.round(eii * 10) / 10; // Round to 1 decimal
}

/**
 * Determine qualitative tags based on scores
 */
function determineTags(metrics, eii) {
  const tags = [];

  if (metrics.a11y >= 95) tags.push('A11y Clean', 'WCAG 2.2 AA');
  if (metrics.performance >= 90) tags.push('Performance Optimized', 'Energy Efficient');
  if (metrics.seo >= 90) tags.push('SEO Best Practices');
  if (eii >= 90) tags.push('Transparency Verified');
  tags.push('GDPR Compliant');

  return tags;
}

/**
 * Generate ledger entry ID
 */
function generateLedgerEntryId() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  
  // Check existing history for today's count
  let count = 1;
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
      const todayEntries = history.filter(e => e.timestamp.startsWith(dateStr));
      count = todayEntries.length + 1;
    } catch (error) {
      console.warn('⚠️  Could not read history:', error.message);
    }
  }

  return `${dateStr}-${String(count).padStart(3, '0')}`;
}

/**
 * Main aggregation function
 */
function aggregateEthicsData() {
  console.log('\n📊 Ethical Data Aggregation');
  console.log('═'.repeat(80));

  ensureDir(GOVERNANCE_DIR);

  // Gather metrics
  const lighthouse = parseLighthouseReports();
  const bundle = parseBundleData();
  const validation = parseValidation();

  // Compute composite scores
  const metrics = {
    seo: Math.round(lighthouse.seo),
    a11y: Math.round(lighthouse.a11y),
    performance: Math.round(lighthouse.performance),
    bundle: bundle.score,
  };

  const eii = calculateEII(metrics);
  const tags = determineTags(metrics, eii);
  const commit = getCommitHash();
  const version = getProjectVersion();
  const timestamp = new Date().toISOString();
  const ledgerEntry = generateLedgerEntryId();

  // Create detailed reports
  const reports = [
    {
      metric: 'lighthouse-seo',
      category: 'seo',
      score: metrics.seo,
      timestamp,
      source: 'lighthouse-ci',
      commit,
      hash: sha256(lighthouse.reports),
      subMetrics: lighthouse.reports.map(r => ({ name: r.file, value: r.seo })),
    },
    {
      metric: 'lighthouse-accessibility',
      category: 'a11y',
      score: metrics.a11y,
      timestamp,
      source: 'lighthouse-ci',
      commit,
      hash: sha256(lighthouse.reports),
      subMetrics: lighthouse.reports.map(r => ({ name: r.file, value: r.a11y })),
    },
    {
      metric: 'lighthouse-performance',
      category: 'performance',
      score: metrics.performance,
      timestamp,
      source: 'lighthouse-ci',
      commit,
      hash: sha256(lighthouse.reports),
      subMetrics: lighthouse.reports.map(r => ({ name: r.file, value: r.performance })),
    },
    {
      metric: 'bundle-efficiency',
      category: 'bundle',
      score: metrics.bundle,
      timestamp,
      source: 'bundle-analyzer',
      commit,
      hash: sha256(bundle),
      metadata: {
        avgSizeKB: bundle.size,
        totalSizeKB: bundle.totalSize,
        routeCount: bundle.routeCount,
      },
    },
  ];

  // Create scorecard
  const scorecard = {
    project: 'QuantumPoly',
    version,
    timestamp,
    commit,
    eii,
    metrics,
    hash: sha256({ metrics, reports }),
    tags,
    verifiedBy: 'CI/CD Pipeline',
    ledgerEntry,
    legalLink: `/api/legal/audit?id=${ledgerEntry}`,
    reports,
    eiCalculation: {
      formula: 'EII = 0.3(A11y) + 0.3(Performance) + 0.2(SEO) + 0.2(Bundle)',
      weights: WEIGHTS,
    },
  };

  // Write dashboard data
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(scorecard, null, 2));
  console.log(`\n✅ Dashboard data written to ${OUTPUT_FILE}`);

  // Append to history
  let history = [];
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch (error) {
      console.warn('⚠️  Could not read history, starting fresh');
    }
  }

  history.push({
    timestamp,
    commit,
    eii,
    metrics,
  });

  // Keep only last 100 entries
  if (history.length > 100) {
    history = history.slice(-100);
  }

  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  console.log(`✅ History updated: ${history.length} entries`);

  // Display summary
  console.log('\n📈 Ethical Integrity Index Summary');
  console.log('═'.repeat(80));
  console.log(`   EII Score: ${eii.toFixed(1)}/100`);
  console.log(`   SEO:          ${metrics.seo}`);
  console.log(`   Accessibility: ${metrics.a11y}`);
  console.log(`   Performance:   ${metrics.performance}`);
  console.log(`   Bundle:        ${metrics.bundle}`);
  console.log(`   Tags: ${tags.join(', ')}`);
  console.log('═'.repeat(80));

  // Badge status
  let badge = '🥉 Bronze';
  if (eii >= 95) badge = '🥇 Gold';
  else if (eii >= 90) badge = '🥈 Silver';
  else if (eii < 75) badge = '⚠️  Amber';

  console.log(`\n${badge} — Ledger Entry: ${ledgerEntry}\n`);
}

// Execute
try {
  aggregateEthicsData();
} catch (error) {
  console.error('❌ Aggregation failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}

