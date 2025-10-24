#!/usr/bin/env node

/**
 * Bundle Budget Enforcement
 *
 * Parses Next.js build manifest and enforces per-route JavaScript bundle budgets.
 * Fails CI if any route exceeds the configured threshold (default: 250 KB).
 *
 * Usage:
 *   node scripts/check-bundle-budget.mjs
 *   BUDGET_KB=200 node scripts/check-bundle-budget.mjs
 */

import fs from 'fs';
import path from 'path';

// Configuration
const BUDGET_KB = parseInt(process.env.BUDGET_KB || '250', 10);
const BUDGET_BYTES = BUDGET_KB * 1024;
const BUILD_DIR = '.next';
const MANIFEST_PATH = path.join(BUILD_DIR, 'build-manifest.json');

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

/**
 * Get file size safely
 */
function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch (err) {
    console.warn(`⚠️  Could not read file: ${filePath}`);
    return 0;
  }
}

/**
 * Main budget check
 */
function checkBundleBudget() {
  // Check if build exists
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ Build manifest not found. Run `npm run build` first.');
    console.error(`   Expected: ${MANIFEST_PATH}`);
    process.exit(1);
  }

  // Parse manifest
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const { pages } = manifest;

  if (!pages || typeof pages !== 'object') {
    console.error('❌ Invalid manifest structure: missing "pages" object.');
    process.exit(1);
  }

  // Filter to route pages (exclude internal Next.js pages)
  const routes = Object.entries(pages).filter(([route]) => {
    return !route.startsWith('/_') && route !== '/404' && route !== '/500';
  });

  if (routes.length === 0) {
    console.warn('⚠️  No routes found in manifest.');
    return;
  }

  console.log('\n📦 Bundle Budget Analysis');
  console.log(`   Budget: ${BUDGET_KB} KB per route\n`);
  console.log('─'.repeat(80));
  console.log(`${'Route'.padEnd(40)} ${'Total JS'.padStart(15)} ${'Status'.padStart(15)}`);
  console.log('─'.repeat(80));

  let failed = false;
  const results = [];

  for (const [route, files] of routes) {
    // Filter to JS files
    const jsFiles = files.filter((f) => f.endsWith('.js'));

    // Calculate total size
    const totalBytes = jsFiles.reduce((sum, file) => {
      const fullPath = path.join(BUILD_DIR, file);
      return sum + getFileSize(fullPath);
    }, 0);

    const exceedsBudget = totalBytes > BUDGET_BYTES;
    if (exceedsBudget) {
      failed = true;
    }

    const status = exceedsBudget ? '❌ OVER' : '✅ OK';
    const formattedSize = formatBytes(totalBytes).padStart(15);
    const routeName = route.length > 38 ? route.slice(0, 35) + '...' : route;

    results.push({
      route: routeName.padEnd(40),
      size: formattedSize,
      status: status.padStart(15),
      bytes: totalBytes,
    });
  }

  // Sort by size descending
  results.sort((a, b) => b.bytes - a.bytes);

  // Print results
  results.forEach(({ route, size, status }) => {
    console.log(`${route} ${size} ${status}`);
  });

  console.log('─'.repeat(80));

  // Summary
  const totalRoutes = results.length;
  const failedRoutes = results.filter((r) => r.status.includes('OVER')).length;
  const passedRoutes = totalRoutes - failedRoutes;

  console.log(`\n📊 Summary: ${passedRoutes}/${totalRoutes} routes within budget\n`);

  if (failed) {
    console.error(`❌ Budget check FAILED: ${failedRoutes} route(s) exceed ${BUDGET_KB} KB`);
    console.error('\n💡 Suggestions:');
    console.error('   • Use dynamic imports (next/dynamic) for heavy components');
    console.error('   • Check for duplicate dependencies in bundle');
    console.error('   • Review third-party library sizes');
    console.error('   • Consider code splitting strategies\n');
    process.exit(1);
  }

  console.log('✅ All routes within budget!\n');
}

// Execute
try {
  checkBundleBudget();
} catch (err) {
  console.error('❌ Bundle budget check failed:', err.message);
  process.exit(1);
}

