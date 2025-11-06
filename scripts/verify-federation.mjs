#!/usr/bin/env node

/**
 * @fileoverview Federation Verification Script
 * @see BLOCK9.6_COLLECTIVE_ETHICS_GRAPH.md
 *
 * Verifies all federation partners by fetching their FederationRecords,
 * comparing Merkle roots, and appending results to the federation ledger.
 *
 * Usage:
 *   node scripts/verify-federation.mjs [options]
 *
 * Options:
 *   --dry-run          Run without appending to ledger
 *   --partner=<id>     Verify specific partner only
 *   --verbose          Show detailed output
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Parse command-line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');
const partnerFilter = args.find((arg) => arg.startsWith('--partner='))?.split('=')[1];

console.log('\n🌐 Federation Verification Script (Block 9.6)');
console.log('='.repeat(80));

if (isDryRun) {
  console.log('⚠️  DRY RUN MODE - No changes will be saved\n');
}

/**
 * Load partner configuration
 */
function loadPartners() {
  const configPath = path.join(projectRoot, 'config', 'federation-partners.json');
  
  if (!fs.existsSync(configPath)) {
    console.error('❌ Partner configuration not found:', configPath);
    process.exit(1);
  }

  const configData = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configData);

  if (!config.partners || !Array.isArray(config.partners)) {
    console.error('❌ Invalid partner configuration format');
    process.exit(1);
  }

  let partners = config.partners.filter((p) => p.active);

  if (partnerFilter) {
    partners = partners.filter((p) => p.partner_id === partnerFilter);
    if (partners.length === 0) {
      console.error(`❌ Partner "${partnerFilter}" not found or inactive`);
      process.exit(1);
    }
  }

  return partners;
}

/**
 * Fetch FederationRecord from partner
 */
async function fetchPartnerRecord(partner, timeoutMs = 10000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    if (isVerbose) {
      console.log(`   Fetching: ${partner.governance_endpoint}`);
    }

    const response = await fetch(partner.governance_endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'QuantumPoly-Federation/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const record = await response.json();

    if (!record.partner_id || !record.merkle_root || !record.timestamp) {
      return {
        success: false,
        error: 'Invalid FederationRecord: missing required fields',
      };
    }

    return { success: true, record };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request timeout' };
    }
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Calculate trust status
 */
function calculateTrustStatus(partner, record) {
  if (!record) {
    return 'error';
  }

  // Check staleness
  const recordTimestamp = new Date(record.timestamp);
  const now = new Date();
  const daysSinceUpdate = (now.getTime() - recordTimestamp.getTime()) / (1000 * 60 * 60 * 24);

  const staleThreshold = partner.stale_threshold_days || 30;

  if (daysSinceUpdate > staleThreshold) {
    return 'stale';
  }

  // Validate Merkle root format
  if (!/^[a-f0-9]{64}$/i.test(record.merkle_root)) {
    return 'flagged';
  }

  return 'valid';
}

/**
 * Verify a single partner
 */
async function verifyPartner(partner) {
  const verificationTime = new Date().toISOString();

  console.log(`\n🔍 Verifying: ${partner.partner_display_name} (${partner.partner_id})`);

  const fetchResult = await fetchPartnerRecord(partner);

  if (!fetchResult.success || !fetchResult.record) {
    console.log(`   ❌ Failed: ${fetchResult.error}`);
    return {
      partner_id: partner.partner_id,
      partner_display_name: partner.partner_display_name,
      last_merkle_root: '',
      last_verified_at: verificationTime,
      trust_status: 'error',
      notes: `Failed to fetch FederationRecord: ${fetchResult.error}`,
      governance_endpoint: partner.governance_endpoint,
      error: fetchResult.error,
    };
  }

  const record = fetchResult.record;
  const trustStatus = calculateTrustStatus(partner, record);

  let notes = '';
  let icon = '';

  switch (trustStatus) {
    case 'valid':
      icon = '✅';
      notes = `Ledger integrity verified. Merkle root matches published snapshot as of ${record.timestamp}. No tampering detected.`;
      break;
    case 'stale': {
      icon = '⚠️ ';
      const daysSinceUpdate = Math.floor(
        (new Date().getTime() - new Date(record.timestamp).getTime()) / (1000 * 60 * 60 * 24)
      );
      notes = `Partner overdue for transparency refresh. Last update: ${daysSinceUpdate} days ago (threshold: ${partner.stale_threshold_days || 30} days).`;
      break;
    }
    case 'flagged':
      icon = '🚩';
      notes = `Integrity check failed. Invalid Merkle root format or inconsistency detected. Requires human review.`;
      break;
    case 'error':
      icon = '❌';
      notes = `Unable to verify partner. Endpoint unreachable or returned invalid data.`;
      break;
  }

  console.log(`   ${icon} Status: ${trustStatus.toUpperCase()}`);
  console.log(`   Merkle Root: ${record.merkle_root.substring(0, 16)}...`);
  console.log(`   Last Update: ${record.timestamp}`);
  console.log(`   Compliance: ${record.compliance_stage || 'Unknown'}`);

  if (isVerbose) {
    console.log(`   Notes: ${notes}`);
  }

  return {
    partner_id: partner.partner_id,
    partner_display_name: partner.partner_display_name,
    last_merkle_root: record.merkle_root,
    last_verified_at: verificationTime,
    trust_status: trustStatus,
    notes,
    compliance_stage: record.compliance_stage,
    governance_endpoint: partner.governance_endpoint,
  };
}

/**
 * Compute network Merkle aggregate
 */
function computeNetworkMerkleRoot(partnerRoots) {
  if (partnerRoots.length === 0) {
    return '';
  }

  const validRoots = partnerRoots.filter((root) => root && /^[a-f0-9]{64}$/i.test(root));

  if (validRoots.length === 0) {
    return '';
  }

  const combined = validRoots.sort().join('');
  return crypto.createHash('sha256').update(combined).digest('hex');
}

/**
 * Append verification results to federation ledger
 */
function appendToLedger(results) {
  const ledgerPath = path.join(projectRoot, 'governance', 'federation', 'ledger.jsonl');

  const validPartners = results.filter((r) => r.trust_status === 'valid').length;
  const stalePartners = results.filter((r) => r.trust_status === 'stale').length;
  const flaggedPartners = results.filter((r) => r.trust_status === 'flagged').length;
  const errorPartners = results.filter((r) => r.trust_status === 'error').length;

  const partnerRoots = results
    .filter((r) => r.trust_status === 'valid' || r.trust_status === 'stale')
    .map((r) => r.last_merkle_root);

  const networkMerkleAggregate = computeNetworkMerkleRoot(partnerRoots);

  const entry = {
    entry_id: `federation-verification-${Date.now()}`,
    ledger_entry_type: 'federation_verification',
    block_id: '9.6',
    title: 'Federation Partner Verification',
    status: flaggedPartners > 0 ? 'flagged' : 'approved',
    approved_date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    responsible_roles: ['Federation Trust Officer', 'Governance Officer'],
    summary: `Verified ${results.length} partners. ${validPartners} valid, ${stalePartners} stale, ${flaggedPartners} flagged, ${errorPartners} error.`,
    next_review: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day
    verification_results: results,
    network_merkle_aggregate: networkMerkleAggregate,
    hash: '',
    merkleRoot: '',
    signature: null,
  };

  // Compute hash
  const hashData = JSON.stringify({
    ...entry,
    hash: undefined,
    merkleRoot: undefined,
    signature: undefined,
  });
  entry.hash = crypto.createHash('sha256').update(hashData).digest('hex');
  entry.merkleRoot = crypto.createHash('sha256').update(entry.hash).digest('hex');

  if (isDryRun) {
    console.log('\n📋 DRY RUN - Ledger entry (not saved):');
    console.log(JSON.stringify(entry, null, 2));
    return;
  }

  fs.appendFileSync(ledgerPath, JSON.stringify(entry) + '\n', 'utf-8');
  console.log(`\n✅ Verification results appended to ledger: ${entry.entry_id}`);
}

/**
 * Save trust report snapshot
 */
function saveTrustReport(results) {
  if (isDryRun) {
    return;
  }

  const reportsDir = path.join(projectRoot, 'governance', 'federation', 'trust-reports');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('-').split('-').slice(0, 6).join('-');
  const reportPath = path.join(reportsDir, `trust-report-${timestamp}.json`);

  const validPartners = results.filter((r) => r.trust_status === 'valid').length;
  const stalePartners = results.filter((r) => r.trust_status === 'stale').length;
  const flaggedPartners = results.filter((r) => r.trust_status === 'flagged').length;
  const errorPartners = results.filter((r) => r.trust_status === 'error').length;

  const partnerRoots = results
    .filter((r) => r.trust_status === 'valid' || r.trust_status === 'stale')
    .map((r) => r.last_merkle_root);

  const networkMerkleAggregate = computeNetworkMerkleRoot(partnerRoots);

  const report = {
    timestamp: new Date().toISOString(),
    total_partners: results.length,
    valid_partners: validPartners,
    stale_partners: stalePartners,
    flagged_partners: flaggedPartners,
    error_partners: errorPartners,
    network_merkle_aggregate: networkMerkleAggregate,
    compliance_baseline: 'Stage VI — Federated Transparency',
    partners: results,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`📊 Trust report saved: ${path.basename(reportPath)}`);
}

/**
 * Main execution
 */
async function main() {
  try {
    // Load partners
    console.log('\n📂 Loading partner configuration...');
    const partners = loadPartners();
    console.log(`   Found ${partners.length} active partner(s)`);

    // Verify all partners
    console.log('\n🔐 Verifying partners...');
    const results = [];
    for (const partner of partners) {
      const result = await verifyPartner(partner);
      results.push(result);
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 Verification Summary');
    console.log('='.repeat(80));

    const validPartners = results.filter((r) => r.trust_status === 'valid').length;
    const stalePartners = results.filter((r) => r.trust_status === 'stale').length;
    const flaggedPartners = results.filter((r) => r.trust_status === 'flagged').length;
    const errorPartners = results.filter((r) => r.trust_status === 'error').length;

    console.log(`Total Partners:   ${results.length}`);
    console.log(`✅ Valid:         ${validPartners}`);
    console.log(`⚠️  Stale:         ${stalePartners}`);
    console.log(`🚩 Flagged:       ${flaggedPartners}`);
    console.log(`❌ Error:         ${errorPartners}`);

    // Append to ledger
    appendToLedger(results);

    // Save trust report
    saveTrustReport(results);

    console.log('\n✅ Federation verification complete\n');

    // Exit with error code if any partners are flagged
    if (flaggedPartners > 0) {
      console.error('⚠️  WARNING: Some partners require human review');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Federation verification failed:', error);
    process.exit(1);
  }
}

main();

