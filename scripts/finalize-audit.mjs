#!/usr/bin/env node
/**
 * @fileoverview Finalize Audit Script - Block 9.9
 * @see BLOCK9.9_FINAL_AUDIT_AND_HANDOFF.md
 *
 * Creates final ledger entry after all sign-offs are complete
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// File paths
const SIGNOFFS_FILE = path.join(ROOT_DIR, 'governance/audits/signoffs.jsonl');
const LEDGER_FILE = path.join(ROOT_DIR, 'governance/ledger/ledger.jsonl');

// Required roles
const REQUIRED_ROLES = [
  'Lead Engineer',
  'Governance Officer',
  'Legal Counsel',
  'Accessibility Reviewer',
];

/**
 * Read sign-off records
 */
function readSignOffRecords() {
  if (!fs.existsSync(SIGNOFFS_FILE)) {
    throw new Error('Sign-off file not found. No sign-offs have been recorded.');
  }

  const content = fs.readFileSync(SIGNOFFS_FILE, 'utf-8');
  const lines = content.trim().split('\n').filter(Boolean);

  return lines.map((line) => JSON.parse(line));
}

/**
 * Get current release sign-offs (last 7 days)
 */
function getCurrentReleaseSignOffs(allRecords) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return allRecords.filter((record) => {
    const recordDate = new Date(record.timestamp);
    return recordDate >= sevenDaysAgo;
  });
}

/**
 * Validate all required sign-offs are present
 */
function validateSignOffs(signoffs) {
  const approvedRoles = new Set();

  signoffs.forEach((record) => {
    if (record.decision === 'approved' || record.decision === 'approved_with_exceptions') {
      approvedRoles.add(record.role);
    }
  });

  const missingRoles = REQUIRED_ROLES.filter((role) => !approvedRoles.has(role));

  if (missingRoles.length > 0) {
    throw new Error(
      `Missing required sign-offs from: ${missingRoles.join(', ')}\n` +
        `Current approved roles: ${Array.from(approvedRoles).join(', ')}`
    );
  }

  return Array.from(approvedRoles);
}

/**
 * Fetch integrity status
 */
async function fetchIntegrityStatus() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/integrity/status`);

    if (!response.ok) {
      throw new Error(`Integrity API returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Warning: Could not fetch integrity status:', error.message);
    return null;
  }
}

/**
 * Get release version
 */
function getReleaseVersion() {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8')
    );
    return packageJson.version || 'v1.0.0';
  } catch {
    return 'v1.0.0';
  }
}

/**
 * Get commit hash
 */
function getCommitHash() {
  return process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 12) || 'local-dev';
}

/**
 * Read existing ledger
 */
function readLedger() {
  if (!fs.existsSync(LEDGER_FILE)) {
    return [];
  }

  const content = fs.readFileSync(LEDGER_FILE, 'utf-8');
  const lines = content.trim().split('\n').filter(Boolean);

  return lines.map((line) => JSON.parse(line));
}

/**
 * Compute Merkle root from all ledger entries
 */
function computeMerkleRoot(entries) {
  if (entries.length === 0) {
    return crypto.createHash('sha256').update('').digest('hex');
  }

  const hashes = entries.map((entry) => entry.hash);

  // Simple Merkle root: hash of all hashes concatenated
  const combined = hashes.join('');
  return crypto.createHash('sha256').update(combined).digest('hex');
}

/**
 * Create final audit ledger entry
 */
async function createFinalAuditEntry(signoffs, integritySnapshot) {
  const timestamp = new Date().toISOString();
  const uuid = crypto.randomBytes(8).toString('hex');
  const entry_id = `audit-closure-block9.9-${timestamp}-${uuid}`;

  // Determine overall status
  const hasExceptions = signoffs.some(
    (s) => s.decision === 'approved_with_exceptions' && s.exceptions?.length > 0
  );
  const hasRejections = signoffs.some((s) => s.decision === 'rejected');

  let status;
  if (hasRejections) {
    status = 'rejected';
  } else if (hasExceptions) {
    status = 'approved_with_conditions';
  } else {
    status = 'approved_for_release';
  }

  // Extract unresolved risks from exceptions
  const unresolved_risks = [];
  signoffs.forEach((signoff) => {
    if (signoff.exceptions) {
      signoff.exceptions.forEach((exception) => {
        unresolved_risks.push({
          description: exception.issue_description,
          mitigation_plan_owner: exception.mitigation_owner,
          deadline: exception.deadline || undefined,
        });
      });
    }
  });

  // Create sign-off summaries
  const signoff_summaries = signoffs.map((s) => ({
    role: s.role,
    name: s.reviewer_name,
    timestamp: s.timestamp,
    scope: s.review_scope.join('; '),
    decision: s.decision,
  }));

  const entryWithoutHash = {
    entry_id,
    ledger_entry_type: 'final_audit_signoff',
    block_id: '9.9',
    title: 'Human Final Audit & Release Authorization',
    status,
    approved_at: timestamp,
    release_version: getReleaseVersion(),
    commit_hash: getCommitHash(),
    integrity_reference: integritySnapshot
      ? `continuous-integrity-block9.8-${integritySnapshot.timestamp}`
      : 'continuous-integrity-block9.8',
    signoffs: signoff_summaries,
    unresolved_risks,
    escalation_path_after_release: 'governance@quantumpoly.ai',
    notes: hasExceptions
      ? 'Release approved with documented exceptions. See unresolved_risks for details.'
      : 'All sign-offs complete. System ready for production release.',
    timestamp,
  };

  // Compute hash
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(entryWithoutHash))
    .digest('hex');

  // Read existing ledger to compute Merkle root
  const existingEntries = readLedger();
  const allEntries = [...existingEntries, { ...entryWithoutHash, hash }];
  const merkleRoot = computeMerkleRoot(allEntries);

  return {
    ...entryWithoutHash,
    hash,
    merkleRoot,
    signature: null,
  };
}

/**
 * Append entry to ledger
 */
function appendToLedger(entry) {
  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(LEDGER_FILE, line, 'utf-8');
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Block 9.9 — Finalizing Audit\n');
  console.log('================================================================================\n');

  try {
    // Read all sign-offs
    console.log('📂 Reading sign-off records...');
    const allRecords = readSignOffRecords();
    console.log(`   Found ${allRecords.length} total sign-off(s)\n`);

    // Get current release sign-offs
    console.log('📅 Filtering current release sign-offs (last 7 days)...');
    const currentSignoffs = getCurrentReleaseSignOffs(allRecords);
    console.log(`   Found ${currentSignoffs.length} current sign-off(s)\n`);

    if (currentSignoffs.length === 0) {
      throw new Error('No sign-offs found for current release window (last 7 days)');
    }

    // Validate all required sign-offs
    console.log('✅ Validating required sign-offs...');
    const approvedRoles = validateSignOffs(currentSignoffs);
    console.log(`   All required roles approved: ${approvedRoles.join(', ')}\n`);

    // Fetch integrity status
    console.log('🔐 Fetching final integrity snapshot...');
    const integritySnapshot = await fetchIntegrityStatus();
    if (integritySnapshot) {
      console.log(`   System state: ${integritySnapshot.system_state}`);
      console.log(`   Last verification: ${integritySnapshot.last_verification}\n`);
    } else {
      console.log('   Warning: Could not fetch integrity snapshot\n');
    }

    // Create final audit entry
    console.log('📝 Creating final audit ledger entry...');
    const finalEntry = await createFinalAuditEntry(currentSignoffs, integritySnapshot);
    console.log(`   Entry ID: ${finalEntry.entry_id}`);
    console.log(`   Status: ${finalEntry.status}`);
    console.log(`   Release Version: ${finalEntry.release_version}`);
    console.log(`   Commit Hash: ${finalEntry.commit_hash}\n`);

    // Show unresolved risks
    if (finalEntry.unresolved_risks.length > 0) {
      console.log('⚠️  Unresolved Risks:');
      finalEntry.unresolved_risks.forEach((risk, index) => {
        console.log(`   ${index + 1}. ${risk.description}`);
        console.log(`      Owner: ${risk.mitigation_plan_owner}`);
        if (risk.deadline) {
          console.log(`      Deadline: ${risk.deadline}`);
        }
      });
      console.log('');
    }

    // Append to ledger
    console.log('💾 Appending to governance ledger...');
    appendToLedger(finalEntry);
    console.log(`   Written to: ${LEDGER_FILE}\n`);

    console.log('================================================================================');
    console.log('✅ Audit finalization complete!\n');
    console.log('Next steps:');
    console.log('1. Review the final ledger entry');
    console.log('2. Verify integrity: npm run ethics:verify-ledger');
    console.log('3. Commit changes to version control');
    console.log('4. Proceed to Release & Operations Phase\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nAudit finalization failed. Please address the issues and try again.\n');
    process.exit(1);
  }
}

main();

