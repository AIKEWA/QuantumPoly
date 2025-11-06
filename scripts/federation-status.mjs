#!/usr/bin/env node

/**
 * @fileoverview Federation Status Display Script
 * @see BLOCK9.6_COLLECTIVE_ETHICS_GRAPH.md
 *
 * Displays current federation trust status from the latest verification.
 *
 * Usage:
 *   node scripts/federation-status.mjs [options]
 *
 * Options:
 *   --json          Output as JSON
 *   --verbose       Show detailed partner information
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Parse command-line arguments
const args = process.argv.slice(2);
const isJson = args.includes('--json');
const isVerbose = args.includes('--verbose');

/**
 * Parse federation ledger
 */
function parseFederationLedger() {
  const ledgerPath = path.join(projectRoot, 'governance', 'federation', 'ledger.jsonl');

  if (!fs.existsSync(ledgerPath)) {
    return [];
  }

  const ledgerData = fs.readFileSync(ledgerPath, 'utf-8');
  const lines = ledgerData.trim().split('\n').filter((line) => line.trim());

  return lines.map((line) => JSON.parse(line));
}

/**
 * Get latest verification entry
 */
function getLatestVerification() {
  const entries = parseFederationLedger();
  const verificationEntries = entries.filter((e) => e.ledger_entry_type === 'federation_verification');

  if (verificationEntries.length === 0) {
    return null;
  }

  return verificationEntries[verificationEntries.length - 1];
}

/**
 * Display status as JSON
 */
function displayJson(verification) {
  if (!verification) {
    console.log(JSON.stringify({ error: 'No verification data found' }, null, 2));
    return;
  }

  const output = {
    timestamp: verification.timestamp,
    status: verification.status,
    summary: verification.summary,
    network_merkle_aggregate: verification.network_merkle_aggregate,
    partners: verification.verification_results || [],
  };

  console.log(JSON.stringify(output, null, 2));
}

/**
 * Display status as human-readable text
 */
function displayText(verification) {
  if (!verification) {
    console.log('\n❌ No verification data found');
    console.log('   Run: npm run federation:verify\n');
    return;
  }

  console.log('\n🌐 Federation Trust Status');
  console.log('='.repeat(80));
  console.log(`Last Verification: ${verification.timestamp}`);
  console.log(`Status: ${verification.status.toUpperCase()}`);
  console.log(`Summary: ${verification.summary}`);
  console.log(`Network Merkle: ${verification.network_merkle_aggregate?.substring(0, 16)}...`);

  const results = verification.verification_results || [];

  if (results.length === 0) {
    console.log('\nNo partners verified.');
    return;
  }

  console.log('\n' + '─'.repeat(80));
  console.log('Partners:');
  console.log('─'.repeat(80));

  results.forEach((result) => {
    let icon = '';
    switch (result.trust_status) {
      case 'valid':
        icon = '✅';
        break;
      case 'stale':
        icon = '⚠️ ';
        break;
      case 'flagged':
        icon = '🚩';
        break;
      case 'error':
        icon = '❌';
        break;
    }

    console.log(`\n${icon} ${result.partner_display_name} (${result.partner_id})`);
    console.log(`   Status: ${result.trust_status.toUpperCase()}`);
    console.log(`   Merkle Root: ${result.last_merkle_root?.substring(0, 16) || 'N/A'}...`);
    console.log(`   Last Verified: ${result.last_verified_at}`);

    if (isVerbose) {
      console.log(`   Endpoint: ${result.governance_endpoint}`);
      console.log(`   Compliance: ${result.compliance_stage || 'Unknown'}`);
      console.log(`   Notes: ${result.notes}`);
    }
  });

  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Main execution
 */
function main() {
  try {
    const verification = getLatestVerification();

    if (isJson) {
      displayJson(verification);
    } else {
      displayText(verification);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to display federation status:', error);
    process.exit(1);
  }
}

main();

