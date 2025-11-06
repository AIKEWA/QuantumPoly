#!/usr/bin/env node

/**
 * @fileoverview Trust Proof Verification Script
 * @see BLOCK9.7_TRUST_PROOF_FRAMEWORK.md
 *
 * Verifies all trust proofs in the governance system:
 * - Loads active proofs from active-proofs.jsonl
 * - Verifies each proof against the ledger
 * - Checks artifact hashes match file contents
 * - Detects expired or revoked proofs
 * - Reports verification status
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

console.log('🔐 Trust Proof Verification Script (Block 9.7)');
console.log('═'.repeat(80));

/**
 * Compute SHA-256 hash of a file
 */
function computeFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (error) {
    console.error(`   ❌ Error computing hash: ${error.message}`);
    return null;
  }
}

/**
 * Load active proofs
 */
function loadActiveProofs() {
  const activeProofsPath = path.join(ROOT, 'governance', 'trust-proofs', 'active-proofs.jsonl');
  
  if (!fs.existsSync(activeProofsPath)) {
    console.log('⚠️  No active proofs found');
    return [];
  }
  
  const content = fs.readFileSync(activeProofsPath, 'utf-8');
  const lines = content.trim().split('\n').filter(line => line.trim());
  
  const proofs = [];
  for (const line of lines) {
    try {
      proofs.push(JSON.parse(line));
    } catch (error) {
      console.error(`   ❌ Error parsing proof: ${error.message}`);
    }
  }
  
  return proofs;
}

/**
 * Load revoked proofs
 */
function loadRevokedProofs() {
  const revokedProofsPath = path.join(ROOT, 'governance', 'trust-proofs', 'revoked-proofs.jsonl');
  
  if (!fs.existsSync(revokedProofsPath)) {
    return [];
  }
  
  const content = fs.readFileSync(revokedProofsPath, 'utf-8');
  const lines = content.trim().split('\n').filter(line => line.trim());
  
  const proofs = [];
  for (const line of lines) {
    try {
      proofs.push(JSON.parse(line));
    } catch (error) {
      console.error(`   ❌ Error parsing revoked proof: ${error.message}`);
    }
  }
  
  return proofs;
}

/**
 * Check if proof is expired
 */
function isExpired(expiresAt) {
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  return now > expiryDate;
}

/**
 * Verify a single proof
 */
function verifyProof(proof, revokedProofs) {
  console.log(`\n🔍 Verifying: ${proof.artifact_id}`);
  
  const results = {
    artifact_id: proof.artifact_id,
    status: 'valid',
    checks: [],
  };
  
  // Check 1: Is it revoked?
  const revocation = revokedProofs.find(r => r.artifact_id === proof.artifact_id);
  if (revocation) {
    results.status = 'revoked';
    results.checks.push({
      name: 'Revocation Check',
      passed: false,
      message: `Revoked: ${revocation.reason}`,
    });
    console.log(`   🚩 REVOKED: ${revocation.reason}`);
    return results;
  }
  
  results.checks.push({
    name: 'Revocation Check',
    passed: true,
    message: 'Not revoked',
  });
  
  // Check 2: Is it expired?
  const expired = isExpired(proof.expires_at);
  if (expired) {
    results.status = 'expired';
    results.checks.push({
      name: 'Expiry Check',
      passed: false,
      message: `Expired on ${proof.expires_at}`,
    });
    console.log(`   ⚠️  EXPIRED: ${proof.expires_at}`);
  } else {
    results.checks.push({
      name: 'Expiry Check',
      passed: true,
      message: `Valid until ${proof.expires_at}`,
    });
    console.log(`   ✅ Not expired (valid until ${proof.expires_at})`);
  }
  
  // Check 3: Does the file exist?
  const filePath = path.join(ROOT, proof.file_path);
  if (!fs.existsSync(filePath)) {
    results.status = 'not_found';
    results.checks.push({
      name: 'File Existence',
      passed: false,
      message: `File not found: ${proof.file_path}`,
    });
    console.log(`   ❌ File not found: ${proof.file_path}`);
    return results;
  }
  
  results.checks.push({
    name: 'File Existence',
    passed: true,
    message: 'File exists',
  });
  console.log(`   ✅ File exists: ${proof.file_path}`);
  
  // Check 4: Does the hash match?
  const actualHash = computeFileHash(filePath);
  if (!actualHash) {
    results.status = 'unverified';
    results.checks.push({
      name: 'Hash Verification',
      passed: false,
      message: 'Could not compute hash',
    });
    return results;
  }
  
  if (actualHash !== proof.artifact_hash) {
    results.status = 'mismatch';
    results.checks.push({
      name: 'Hash Verification',
      passed: false,
      message: `Hash mismatch!\n      Expected: ${proof.artifact_hash}\n      Actual:   ${actualHash}`,
    });
    console.log(`   ❌ HASH MISMATCH!`);
    console.log(`      Expected: ${proof.artifact_hash}`);
    console.log(`      Actual:   ${actualHash}`);
    return results;
  }
  
  results.checks.push({
    name: 'Hash Verification',
    passed: true,
    message: 'Hash matches',
  });
  console.log(`   ✅ Hash matches: ${actualHash.substring(0, 16)}...`);
  
  // Check 5: Ledger reference exists?
  const ledgerPath = path.join(ROOT, 'governance', 'ledger', 'ledger.jsonl');
  if (fs.existsSync(ledgerPath)) {
    const ledgerContent = fs.readFileSync(ledgerPath, 'utf-8');
    const hasReference = ledgerContent.includes(proof.ledger_reference);
    
    if (!hasReference) {
      results.checks.push({
        name: 'Ledger Reference',
        passed: false,
        message: `Ledger reference not found: ${proof.ledger_reference}`,
      });
      console.log(`   ⚠️  Ledger reference not found: ${proof.ledger_reference}`);
    } else {
      results.checks.push({
        name: 'Ledger Reference',
        passed: true,
        message: 'Ledger reference exists',
      });
      console.log(`   ✅ Ledger reference exists: ${proof.ledger_reference}`);
    }
  }
  
  return results;
}

/**
 * Main execution
 */
function main() {
  console.log('\n📂 Loading proofs...\n');
  
  const activeProofs = loadActiveProofs();
  const revokedProofs = loadRevokedProofs();
  
  console.log(`   Found ${activeProofs.length} active proof(s)`);
  console.log(`   Found ${revokedProofs.length} revoked proof(s)`);
  
  if (activeProofs.length === 0) {
    console.log('\n⚠️  No active proofs to verify');
    console.log('   This is expected if no reports have been generated yet.');
    console.log('   Run: npm run ethics:report');
    return;
  }
  
  console.log('\n🔐 Verifying proofs...');
  
  const results = [];
  for (const proof of activeProofs) {
    const result = verifyProof(proof, revokedProofs);
    results.push(result);
  }
  
  // Summary
  console.log('\n' + '═'.repeat(80));
  console.log('📊 Verification Summary');
  console.log('═'.repeat(80));
  
  const validCount = results.filter(r => r.status === 'valid').length;
  const expiredCount = results.filter(r => r.status === 'expired').length;
  const revokedCount = results.filter(r => r.status === 'revoked').length;
  const mismatchCount = results.filter(r => r.status === 'mismatch').length;
  const notFoundCount = results.filter(r => r.status === 'not_found').length;
  const unverifiedCount = results.filter(r => r.status === 'unverified').length;
  
  console.log(`Total Proofs:    ${results.length}`);
  console.log(`✅ Valid:         ${validCount}`);
  console.log(`⚠️  Expired:       ${expiredCount}`);
  console.log(`🚩 Revoked:       ${revokedCount}`);
  console.log(`❌ Mismatch:      ${mismatchCount}`);
  console.log(`❌ Not Found:     ${notFoundCount}`);
  console.log(`❌ Unverified:    ${unverifiedCount}`);
  
  // Exit code
  if (mismatchCount > 0 || notFoundCount > 0 || unverifiedCount > 0) {
    console.log('\n❌ VERIFICATION FAILED');
    console.log('   Critical issues detected. Review the results above.');
    process.exit(1);
  } else if (expiredCount > 0) {
    console.log('\n⚠️  VERIFICATION PASSED WITH WARNINGS');
    console.log('   Some proofs have expired. Consider regenerating reports.');
    process.exit(0);
  } else {
    console.log('\n✅ VERIFICATION PASSED');
    console.log('   All proofs are valid and verified.');
    process.exit(0);
  }
}

main();

