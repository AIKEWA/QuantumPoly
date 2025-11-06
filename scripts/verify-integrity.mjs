#!/usr/bin/env node

/**
 * Continuous Integrity Verification Script
 * 
 * Autonomous monitor that checks governance integrity and attempts conservative repairs.
 * 
 * Block 9.8 — Continuous Integrity & Self-Healing
 * 
 * Usage:
 *   node scripts/verify-integrity.mjs [options]
 * 
 * Options:
 *   --dry-run           Run without creating repair entries
 *   --scope=<scope>     Verification scope: governance|consent|federation|trust|all (default: all)
 *   --report=<path>     Save report to file (default: governance/integrity/reports/YYYY-MM-DD.json)
 *   --notify            Send notifications even in dry-run mode
 *   --verbose           Detailed output
 * 
 * Environment Variables:
 *   GOVERNANCE_OFFICER_EMAIL  - Email for critical notifications
 *   INTEGRITY_WEBHOOK_URL     - Optional webhook endpoint
 *   INTEGRITY_WEBHOOK_SECRET  - HMAC secret for webhook signatures
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
const dryRun = args.includes('--dry-run');
const notify = args.includes('--notify');
const verbose = args.includes('--verbose');

const scopeArg = args.find(arg => arg.startsWith('--scope='));
const scope = scopeArg ? scopeArg.split('=')[1].split(',') : ['all'];

const reportArg = args.find(arg => arg.startsWith('--report='));
const reportPath = reportArg 
  ? reportArg.split('=')[1]
  : `governance/integrity/reports/${new Date().toISOString().split('T')[0]}.json`;

// Environment configuration
const config = {
  governanceOfficerEmail: process.env.GOVERNANCE_OFFICER_EMAIL,
  webhookUrl: process.env.INTEGRITY_WEBHOOK_URL,
  webhookSecret: process.env.INTEGRITY_WEBHOOK_SECRET,
};

/**
 * Compute SHA-256 hash
 */
function sha256(data) {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
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
 * Append entry to JSONL ledger
 */
function appendToLedger(ledgerPath, entry) {
  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(ledgerPath, line, 'utf8');
}

/**
 * Check if date is in the past
 */
function isDateInPast(dateString) {
  try {
    const date = new Date(dateString);
    return date < new Date();
  } catch {
    return false;
  }
}

/**
 * Check if date is in the future
 */
function isDateInFuture(dateString) {
  try {
    const date = new Date(dateString);
    return date > new Date();
  } catch {
    return false;
  }
}

/**
 * Verify governance ledger
 */
function verifyGovernanceLedger(issues) {
  const ledgerPath = 'governance/ledger/ledger.jsonl';
  const entries = readLedger(ledgerPath);

  if (entries.length === 0) {
    issues.push({
      issue_id: `gov-empty-${Date.now()}`,
      classification: 'integrity_break',
      severity: 'critical',
      affected_ledger: 'governance',
      description: 'Governance ledger is empty or unreadable',
      details: 'The governance ledger file exists but contains no valid entries',
      auto_repairable: false,
      detected_at: new Date().toISOString(),
    });
    return 'critical';
  }

  let criticalIssues = 0;
  let degradedIssues = 0;

  entries.forEach((entry, index) => {
    // Check required fields
    const requiredFields = ['id', 'timestamp', 'hash', 'merkleRoot'];
    const missingFields = requiredFields.filter(field => !entry[field]);
    
    if (missingFields.length > 0) {
      issues.push({
        issue_id: `gov-missing-fields-${index}`,
        classification: 'integrity_break',
        severity: 'high',
        affected_ledger: 'governance',
        entry_id: entry.id || `entry-${index}`,
        description: `Missing required fields: ${missingFields.join(', ')}`,
        details: `Entry at index ${index} is missing critical fields`,
        auto_repairable: false,
        detected_at: new Date().toISOString(),
      });
      criticalIssues++;
    }

    // Check for stale next_review dates
    if (entry.next_review && isDateInPast(entry.next_review)) {
      const daysPast = Math.floor(
        (Date.now() - new Date(entry.next_review).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      issues.push({
        issue_id: `gov-stale-review-${entry.id}`,
        classification: 'stale_date',
        severity: daysPast > 90 ? 'high' : 'medium',
        affected_ledger: 'governance',
        entry_id: entry.id,
        description: `Review date is ${daysPast} days overdue`,
        details: `Entry "${entry.title || entry.id}" has next_review: ${entry.next_review}`,
        auto_repairable: true,
        original_state: { next_review: entry.next_review },
        proposed_state: { next_review: 'ATTENTION_REQUIRED' },
        rationale: `Automated escalation: next_review date exceeded by ${daysPast} days`,
        detected_at: new Date().toISOString(),
      });
      degradedIssues++;
    }

    // Check for future approved_date
    if (entry.approved_date && isDateInFuture(entry.approved_date)) {
      issues.push({
        issue_id: `gov-future-approval-${entry.id}`,
        classification: 'integrity_break',
        severity: 'critical',
        affected_ledger: 'governance',
        entry_id: entry.id,
        description: 'Approval date is in the future',
        details: `Entry has approved_date: ${entry.approved_date} which is in the future`,
        auto_repairable: false,
        detected_at: new Date().toISOString(),
      });
      criticalIssues++;
    }

    // Check document references
    if (entry.documents && Array.isArray(entry.documents)) {
      entry.documents.forEach((doc) => {
        if (!fs.existsSync(doc)) {
          issues.push({
            issue_id: `gov-missing-doc-${entry.id}-${sha256(doc).slice(0, 8)}`,
            classification: 'missing_reference',
            severity: 'high',
            affected_ledger: 'governance',
            entry_id: entry.id,
            description: `Referenced document not found: ${doc}`,
            details: `Entry references document that does not exist at expected path`,
            auto_repairable: false,
            detected_at: new Date().toISOString(),
          });
          criticalIssues++;
        }
      });
    }
  });

  if (criticalIssues > 0) return 'critical';
  if (degradedIssues > 0) return 'degraded';
  return 'valid';
}

/**
 * Verify consent ledger
 */
function verifyConsentLedger(issues) {
  const ledgerPath = 'governance/consent/ledger.jsonl';
  
  if (!fs.existsSync(ledgerPath)) {
    return 'valid';
  }

  const entries = readLedger(ledgerPath);
  if (entries.length === 0) {
    return 'valid';
  }

  let degradedIssues = 0;

  entries.forEach((entry, index) => {
    if (!entry.timestamp || !entry.event_type) {
      issues.push({
        issue_id: `consent-invalid-${index}`,
        classification: 'minor_inconsistency',
        severity: 'low',
        affected_ledger: 'consent',
        description: 'Consent entry missing required fields',
        details: `Entry at index ${index} is missing timestamp or event_type`,
        auto_repairable: false,
        detected_at: new Date().toISOString(),
      });
      degradedIssues++;
    }
  });

  return degradedIssues > 0 ? 'degraded' : 'valid';
}

/**
 * Verify federation ledger
 */
function verifyFederationLedger(issues) {
  const ledgerPath = 'governance/federation/ledger.jsonl';
  
  if (!fs.existsSync(ledgerPath)) {
    return 'valid';
  }

  const entries = readLedger(ledgerPath);
  if (entries.length === 0) {
    return 'valid';
  }

  let degradedIssues = 0;

  const recentVerifications = entries.filter(
    e => e.ledger_entry_type === 'federation_verification'
  );

  if (recentVerifications.length > 0) {
    const latestVerification = recentVerifications[recentVerifications.length - 1];
    const verificationDate = new Date(latestVerification.timestamp);
    const daysSinceVerification = Math.floor(
      (Date.now() - verificationDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceVerification > 2) {
      issues.push({
        issue_id: `federation-stale-${Date.now()}`,
        classification: 'federation_stale',
        severity: daysSinceVerification > 7 ? 'high' : 'medium',
        affected_ledger: 'federation',
        description: `Federation verification is ${daysSinceVerification} days old`,
        details: `Last verification: ${latestVerification.timestamp}`,
        auto_repairable: false,
        detected_at: new Date().toISOString(),
      });
      degradedIssues++;
    }
  }

  return degradedIssues > 0 ? 'degraded' : 'valid';
}

/**
 * Verify trust proofs
 */
function verifyTrustProofs(issues) {
  const activeProofsPath = 'governance/trust-proofs/active-proofs.jsonl';
  
  if (!fs.existsSync(activeProofsPath)) {
    return 'valid';
  }

  const proofs = readLedger(activeProofsPath);
  if (proofs.length === 0) {
    return 'valid';
  }

  let degradedIssues = 0;
  let criticalIssues = 0;

  proofs.forEach((proof, index) => {
    if (proof.expires_at) {
      const expiryDate = new Date(proof.expires_at);
      if (expiryDate < new Date()) {
        issues.push({
          issue_id: `trust-expired-${proof.artifact_id || index}`,
          classification: 'attestation_expired',
          severity: 'medium',
          affected_ledger: 'trust_proofs',
          description: `Trust proof expired: ${proof.artifact_id}`,
          details: `Proof expired at ${proof.expires_at}`,
          auto_repairable: false,
          detected_at: new Date().toISOString(),
        });
        degradedIssues++;
      }
    }

    if (proof.file_path && !fs.existsSync(proof.file_path)) {
      issues.push({
        issue_id: `trust-missing-file-${proof.artifact_id || index}`,
        classification: 'missing_reference',
        severity: 'high',
        affected_ledger: 'trust_proofs',
        description: `Trust proof references missing file: ${proof.file_path}`,
        details: `Artifact ${proof.artifact_id} references non-existent file`,
        auto_repairable: false,
        detected_at: new Date().toISOString(),
      });
      criticalIssues++;
    }
  });

  if (criticalIssues > 0) return 'critical';
  if (degradedIssues > 0) return 'degraded';
  return 'valid';
}

/**
 * Compute global Merkle root
 */
function computeGlobalMerkleRoot(ledgers) {
  const combined = ledgers.map(l => l.merkleRoot).join('');
  return sha256(combined);
}

/**
 * Attempt repair for stale review date
 */
function repairStaleReviewDate(issue) {
  if (!issue.entry_id || !issue.original_state?.next_review) {
    return { success: false, error: 'Missing entry_id or original_state' };
  }

  const timestamp = new Date().toISOString();
  const repairEntryId = `autonomous_repair-${timestamp}-${crypto.randomUUID().slice(0, 8)}`;

  const repairEntry = {
    entry_id: repairEntryId,
    ledger_entry_type: 'autonomous_repair',
    block_id: '9.8',
    title: `Automated Review Date Escalation: ${issue.entry_id}`,
    status: 'applied',
    applied_at: timestamp,
    responsible_roles: ['Integrity Monitor Engine', 'Governance Officer'],
    issue_classification: issue.classification,
    original_state: issue.original_state,
    new_state: issue.proposed_state || { next_review: 'ATTENTION_REQUIRED' },
    rationale: issue.rationale || 'Automated escalation: review date exceeded threshold',
    hash: '',
    merkleRoot: '',
    signature: null,
  };

  // Compute hash
  const entryForHash = { ...repairEntry };
  delete entryForHash.hash;
  delete entryForHash.merkleRoot;
  delete entryForHash.signature;
  
  repairEntry.hash = sha256(entryForHash);
  repairEntry.merkleRoot = sha256([
    repairEntry.entry_id,
    repairEntry.applied_at,
    repairEntry.issue_classification,
    JSON.stringify(repairEntry.original_state),
    JSON.stringify(repairEntry.new_state),
  ].join(''));

  if (!dryRun) {
    // Note: In production, would update the original entry's next_review field
    // For now, just log the repair entry
    appendToLedger('governance/ledger/ledger.jsonl', repairEntry);
  }

  return { success: true, repair_entry: repairEntry };
}

/**
 * Create escalation entry
 */
function createEscalationEntry(issue) {
  const timestamp = new Date().toISOString();
  const repairEntryId = `autonomous_repair-${timestamp}-${crypto.randomUUID().slice(0, 8)}`;

  const followupDays = issue.severity === 'critical' ? 1 : issue.severity === 'high' ? 2 : issue.severity === 'medium' ? 5 : 7;

  const repairEntry = {
    entry_id: repairEntryId,
    ledger_entry_type: 'autonomous_repair',
    block_id: '9.8',
    title: `Integrity Issue Requires Review: ${issue.classification}`,
    status: 'pending_human_review',
    applied_at: timestamp,
    responsible_roles: ['Integrity Monitor Engine', 'Governance Officer'],
    issue_classification: issue.classification,
    original_state: issue.original_state || { issue_description: issue.description },
    new_state: {},
    rationale: `${issue.description}. ${issue.details}`,
    requires_followup_by: new Date(Date.now() + followupDays * 24 * 60 * 60 * 1000).toISOString(),
    followup_owner: 'Governance Officer',
    hash: '',
    merkleRoot: '',
    signature: null,
  };

  const entryForHash = { ...repairEntry };
  delete entryForHash.hash;
  delete entryForHash.merkleRoot;
  delete entryForHash.signature;
  
  repairEntry.hash = sha256(entryForHash);
  repairEntry.merkleRoot = sha256([
    repairEntry.entry_id,
    repairEntry.applied_at,
    repairEntry.issue_classification,
    JSON.stringify(repairEntry.original_state),
  ].join(''));

  if (!dryRun) {
    appendToLedger('governance/ledger/ledger.jsonl', repairEntry);
  }

  return { success: true, repair_entry: repairEntry };
}

/**
 * Process issues and attempt repairs
 */
function processIssues(issues) {
  const repaired = [];
  const escalated = [];
  const failed = [];

  issues.forEach((issue) => {
    if (issue.auto_repairable && issue.classification === 'stale_date') {
      const result = repairStaleReviewDate(issue);
      if (result.success) {
        repaired.push(result);
      } else {
        failed.push(result);
      }
    } else {
      const result = createEscalationEntry(issue);
      if (result.success) {
        escalated.push(result);
      } else {
        failed.push(result);
      }
    }
  });

  return { repaired, escalated, failed };
}

/**
 * Send notification
 */
async function sendNotification(issue, repairEntryId) {
  if (!config.governanceOfficerEmail && !config.webhookUrl) {
    return;
  }

  console.log('\n📧 Notification:');
  console.log(`  Issue: ${issue.classification}`);
  console.log(`  Severity: ${issue.severity}`);
  console.log(`  Description: ${issue.description}`);
  console.log(`  Repair Entry: ${repairEntryId}`);
  
  if (config.governanceOfficerEmail) {
    console.log(`  Email: ${config.governanceOfficerEmail}`);
  }
  
  if (config.webhookUrl) {
    console.log(`  Webhook: ${config.webhookUrl}`);
  }
  
  console.log('');
}

/**
 * Main verification function
 */
async function main() {
  console.log('\n🔍 Continuous Integrity Verification');
  console.log('=====================================\n');
  
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'PRODUCTION'}`);
  console.log(`Scope: ${scope.join(', ')}`);
  console.log(`Notify: ${notify ? 'Yes' : 'No'}`);
  console.log(`Verbose: ${verbose ? 'Yes' : 'No'}`);
  console.log('');

  const issues = [];
  const timestamp = new Date().toISOString();

  // Determine what to verify
  const verifyAll = scope.includes('all');
  const verifyGov = verifyAll || scope.includes('governance');
  const verifyConsent = verifyAll || scope.includes('consent');
  const verifyFed = verifyAll || scope.includes('federation');
  const verifyTrust = verifyAll || scope.includes('trust');

  // Run verifications
  console.log('📋 Running verifications...\n');
  
  const governanceHealth = verifyGov ? verifyGovernanceLedger(issues) : 'valid';
  console.log(`  Governance: ${governanceHealth}`);
  
  const consentHealth = verifyConsent ? verifyConsentLedger(issues) : 'valid';
  console.log(`  Consent: ${consentHealth}`);
  
  const federationHealth = verifyFed ? verifyFederationLedger(issues) : 'valid';
  console.log(`  Federation: ${federationHealth}`);
  
  const trustProofsHealth = verifyTrust ? verifyTrustProofs(issues) : 'valid';
  console.log(`  Trust Proofs: ${trustProofsHealth}`);
  
  console.log('');

  // Process issues
  console.log(`📊 Found ${issues.length} issue(s)\n`);
  
  if (issues.length > 0) {
    const { repaired, escalated, failed } = processIssues(issues);
    
    console.log(`  Auto-repaired: ${repaired.length}`);
    console.log(`  Escalated: ${escalated.length}`);
    console.log(`  Failed: ${failed.length}`);
    console.log('');

    // Send notifications for escalated issues
    if (notify || !dryRun) {
      for (const result of escalated) {
        if (result.repair_entry) {
          await sendNotification(
            issues.find(i => i.classification === result.repair_entry.issue_classification),
            result.repair_entry.entry_id
          );
        }
      }
    }
  }

  // Compute global Merkle root
  const ledgers = [];
  if (verifyGov) {
    const govEntries = readLedger('governance/ledger/ledger.jsonl');
    const lastEntry = govEntries[govEntries.length - 1];
    if (lastEntry?.merkleRoot) {
      ledgers.push({ name: 'governance', merkleRoot: lastEntry.merkleRoot });
    }
  }

  const globalMerkleRoot = ledgers.length > 0 ? computeGlobalMerkleRoot(ledgers) : '';

  // Build report
  const report = {
    timestamp,
    verification_scope: scope,
    total_issues: issues.length,
    auto_repaired: issues.filter(i => i.auto_repairable && i.classification === 'stale_date').length,
    requires_human_review: issues.filter(i => !i.auto_repairable || i.classification !== 'stale_date').length,
    issues,
    ledger_status: {
      governance: governanceHealth,
      consent: consentHealth,
      federation: federationHealth,
      trust_proofs: trustProofsHealth,
    },
    global_merkle_root: globalMerkleRoot,
    system_state: issues.length === 0 ? 'healthy' : issues.some(i => i.severity === 'critical') ? 'attention_required' : 'degraded',
  };

  // Save report
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`📄 Report saved: ${reportPath}\n`);

  // Summary
  console.log('✅ Verification complete\n');
  console.log(`System State: ${report.system_state.toUpperCase()}`);
  console.log(`Global Merkle Root: ${globalMerkleRoot.slice(0, 16)}...`);
  console.log('');

  process.exit(issues.some(i => i.severity === 'critical') ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

