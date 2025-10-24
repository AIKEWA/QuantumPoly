#!/usr/bin/env node

/**
 * Ethics Badge Generator
 *
 * Generates SVG badge showing current Ethical Integrity Index (EII) score.
 *
 * Usage:
 *   node scripts/generate-ethics-badge.mjs
 *
 * Output:
 *   /public/ethics-badge.svg
 */

import fs from 'fs';

// Configuration
const DASHBOARD_DATA = './reports/governance/dashboard-data.json';
const OUTPUT_FILE = './public/ethics-badge.svg';

/**
 * Get badge color based on EII score
 */
function getBadgeColor(eii) {
  if (eii >= 95) return '#44cc11'; // Gold/Green
  if (eii >= 90) return '#97ca00'; // Silver/Light Green
  if (eii >= 75) return '#dfb317'; // Bronze/Yellow
  return '#fe7d37'; // Amber/Orange
}

/**
 * Generate SVG badge
 */
function generateBadge(eii) {
  const color = getBadgeColor(eii);
  const label = 'EII';
  const value = eii.toFixed(1);

  // SVG badge template (shields.io style)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="88" height="20" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="88" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="31" height="20" fill="#555"/>
    <rect x="31" width="57" height="20" fill="${color}"/>
    <rect width="88" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text aria-hidden="true" x="165" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="210">${label}</text>
    <text x="165" y="140" transform="scale(.1)" fill="#fff" textLength="210">${label}</text>
    <text aria-hidden="true" x="585" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="470">${value}</text>
    <text x="585" y="140" transform="scale(.1)" fill="#fff" textLength="470">${value}</text>
  </g>
</svg>`;

  return svg;
}

/**
 * Main badge generation function
 */
function generateEthicsBadge() {
  console.log('\n🎖️  Ethical Integrity Index Badge Generator');
  console.log('═'.repeat(80));

  // Load dashboard data
  if (!fs.existsSync(DASHBOARD_DATA)) {
    console.error('❌ Dashboard data not found');
    console.error('   Run `npm run ethics:aggregate` first');
    process.exit(1);
  }

  const dashboardData = JSON.parse(fs.readFileSync(DASHBOARD_DATA, 'utf8'));
  const { eii } = dashboardData;

  console.log(`📊 Current EII Score: ${eii}`);

  // Generate badge
  const badge = generateBadge(eii);

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, badge, 'utf8');
  console.log(`✅ Badge generated: ${OUTPUT_FILE}`);

  // Display badge info
  const color = getBadgeColor(eii);
  let tier = '🥉 Bronze';
  if (eii >= 95) tier = '🥇 Gold';
  else if (eii >= 90) tier = '🥈 Silver';
  else if (eii < 75) tier = '⚠️  Amber';

  console.log(`   Tier:  ${tier}`);
  console.log(`   Color: ${color}`);

  console.log('\n💡 Usage in README.md:');
  console.log('   ![Ethical Integrity Index](./public/ethics-badge.svg)');
  console.log('═'.repeat(80));
  console.log('');
}

// Execute
try {
  generateEthicsBadge();
} catch (error) {
  console.error('❌ Badge generation failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}

