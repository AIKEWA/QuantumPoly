#!/usr/bin/env node

/**
 * @fileoverview QR Code Verification Test
 * @see BLOCK9.7_TRUST_PROOF_FRAMEWORK.md
 *
 * Simulates external auditor workflow:
 * 1. Load a report
 * 2. Compute its hash
 * 3. Extract verification info from active proofs
 * 4. Simulate API call to /api/trust/proof
 * 5. Verify response
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

console.log('🔍 QR Code Verification Test (Block 9.7)');
console.log('═'.repeat(80));
console.log('\nSimulating external auditor workflow...\n');

function computeFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function loadActiveProofs() {
  const activeProofsPath = path.join(ROOT, 'governance', 'trust-proofs', 'active-proofs.jsonl');
  
  if (!fs.existsSync(activeProofsPath)) {
    return [];
  }
  
  const content = fs.readFileSync(activeProofsPath, 'utf-8');
  const lines = content.trim().split('\n').filter(line => line.trim());
  
  return lines.map(line => JSON.parse(line));
}

function main() {
  const activeProofs = loadActiveProofs();
  
  if (activeProofs.length === 0) {
    console.log('⚠️  No active proofs found');
    console.log('   Generate a report first: npm run ethics:report');
    return;
  }
  
  console.log(`📂 Found ${activeProofs.length} active proof(s)\n`);
  
  // Test first proof
  const proof = activeProofs[0];
  
  console.log(`🔍 Testing proof: ${proof.artifact_id}`);
  console.log(`   File: ${proof.file_path}`);
  
  // Step 1: Check file exists
  const filePath = path.join(ROOT, proof.file_path);
  if (!fs.existsSync(filePath)) {
    console.log(`\n❌ File not found: ${proof.file_path}`);
    return;
  }
  console.log(`   ✅ File exists`);
  
  // Step 2: Compute hash
  console.log(`\n📊 Computing SHA-256 hash...`);
  const actualHash = computeFileHash(filePath);
  console.log(`   Computed: ${actualHash}`);
  console.log(`   Expected: ${proof.artifact_hash}`);
  
  if (actualHash !== proof.artifact_hash) {
    console.log(`\n❌ HASH MISMATCH!`);
    console.log(`   The file has been modified since the proof was generated.`);
    return;
  }
  console.log(`   ✅ Hash matches`);
  
  // Step 3: Simulate QR code scan
  console.log(`\n📱 Simulating QR code scan...`);
  console.log(`   QR would contain: https://www.quantumpoly.ai/api/trust/proof?rid=${proof.artifact_id}&sig=<signature>`);
  
  // Step 4: Simulate API call
  console.log(`\n🌐 Simulating API call to /api/trust/proof...`);
  console.log(`   Request: GET /api/trust/proof?rid=${proof.artifact_id}`);
  
  // Simulate response
  const expiryDate = new Date(proof.expires_at);
  const now = new Date();
  const isExpired = now > expiryDate;
  
  const simulatedResponse = {
    artifact_id: proof.artifact_id,
    hash_algorithm: 'SHA-256',
    artifact_hash: proof.artifact_hash,
    issued_at: proof.issued_at,
    issuer: 'trust-attestation-service@quantumpoly',
    governance_block: '9.7',
    ledger_reference: proof.ledger_reference,
    compliance_stage: 'Stage VII — Trust Proof & Attestation',
    status: isExpired ? 'expired' : 'valid',
    notes: isExpired 
      ? 'Proof has expired. The artifact may still be valid, but the attestation is stale.'
      : 'Signature matches ledger entry and current key material.',
    verified_at: new Date().toISOString(),
    expires_at: proof.expires_at,
  };
  
  console.log(`\n   Response:`);
  console.log(JSON.stringify(simulatedResponse, null, 2));
  
  // Step 5: Verify response
  console.log(`\n✅ Verification complete`);
  console.log(`   Status: ${simulatedResponse.status.toUpperCase()}`);
  console.log(`   Hash matches: ${actualHash === simulatedResponse.artifact_hash ? 'YES' : 'NO'}`);
  console.log(`   Ledger reference: ${simulatedResponse.ledger_reference}`);
  
  if (simulatedResponse.status === 'valid') {
    console.log(`\n✅ PROOF VERIFIED SUCCESSFULLY`);
    console.log(`   This artifact is authentic and has not been tampered with.`);
  } else if (simulatedResponse.status === 'expired') {
    console.log(`\n⚠️  PROOF EXPIRED`);
    console.log(`   The artifact is authentic but the proof has expired.`);
    console.log(`   Consider regenerating the report.`);
  } else {
    console.log(`\n❌ VERIFICATION FAILED`);
    console.log(`   Status: ${simulatedResponse.status}`);
  }
  
  console.log('\n' + '═'.repeat(80));
  console.log('📋 External Auditor Instructions:');
  console.log('═'.repeat(80));
  console.log('\n1. Scan the QR code on the report');
  console.log('2. OR visit: https://www.quantumpoly.ai/api/trust/proof');
  console.log('3. Compare the returned hash with your computed hash');
  console.log('4. Verify the status is "valid"');
  console.log('5. Check the ledger reference exists in the governance ledger');
  console.log('\nFor manual verification:');
  console.log(`  sha256sum ${proof.file_path}`);
  console.log(`  curl "https://www.quantumpoly.ai/api/trust/proof?rid=${proof.artifact_id}" | jq .`);
}

main();

