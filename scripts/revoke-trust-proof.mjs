#!/usr/bin/env node

/**
 * @fileoverview Trust Proof Revocation Script
 * @see BLOCK9.7_TRUST_PROOF_FRAMEWORK.md
 *
 * Revokes a trust proof and records the revocation
 * 
 * Usage:
 *   node scripts/revoke-trust-proof.mjs --artifact-id=ETHICS_REPORT_2025-11-05 --reason="Methodology error"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const artifactId = args.find(arg => arg.startsWith('--artifact-id='))?.split('=')[1];
const reason = args.find(arg => arg.startsWith('--reason='))?.split('=')[1];
const revokedBy = args.find(arg => arg.startsWith('--revoked-by='))?.split('=')[1] || 'Governance Officer';

console.log('🚩 Trust Proof Revocation Script (Block 9.7)');
console.log('═'.repeat(80));

if (!artifactId || !reason) {
  console.error('\n❌ Missing required arguments');
  console.error('\nUsage:');
  console.error('  node scripts/revoke-trust-proof.mjs \\');
  console.error('    --artifact-id=ETHICS_REPORT_2025-11-05 \\');
  console.error('    --reason="Methodology error" \\');
  console.error('    --revoked-by="Governance Officer" (optional)');
  process.exit(1);
}

function main() {
  console.log(`\n📋 Revoking proof for: ${artifactId}`);
  console.log(`   Reason: ${reason}`);
  console.log(`   Revoked by: ${revokedBy}`);
  
  // Load active proofs
  const activeProofsPath = path.join(ROOT, 'governance', 'trust-proofs', 'active-proofs.jsonl');
  
  if (!fs.existsSync(activeProofsPath)) {
    console.error('\n❌ No active proofs found');
    process.exit(1);
  }
  
  const content = fs.readFileSync(activeProofsPath, 'utf-8');
  const lines = content.trim().split('\n').filter(line => line.trim());
  const proofs = lines.map(line => JSON.parse(line));
  
  // Find the proof
  const proof = proofs.find(p => p.artifact_id === artifactId);
  
  if (!proof) {
    console.error(`\n❌ Proof not found: ${artifactId}`);
    console.error('   Available proofs:');
    proofs.forEach(p => console.error(`     - ${p.artifact_id}`));
    process.exit(1);
  }
  
  console.log(`\n✅ Found proof`);
  console.log(`   Token: ${proof.token.substring(0, 32)}...`);
  console.log(`   Hash: ${proof.artifact_hash.substring(0, 32)}...`);
  
  // Create revocation record
  const revocationRecord = {
    artifact_id: artifactId,
    original_token: proof.token,
    revoked_at: new Date().toISOString(),
    reason: reason,
    revoked_by: revokedBy,
    ledger_reference: `revocation-${artifactId}`,
  };
  
  // Append to revoked proofs
  const revokedProofsPath = path.join(ROOT, 'governance', 'trust-proofs', 'revoked-proofs.jsonl');
  fs.appendFileSync(revokedProofsPath, JSON.stringify(revocationRecord) + '\n', 'utf-8');
  
  console.log(`\n✅ Revocation recorded`);
  console.log(`   Timestamp: ${revocationRecord.revoked_at}`);
  console.log(`   Ledger reference: ${revocationRecord.ledger_reference}`);
  
  console.log('\n⚠️  NOTE: The proof remains in active-proofs.jsonl for audit trail.');
  console.log('   Verification API will return "revoked" status.');
  
  console.log('\n' + '═'.repeat(80));
  console.log('✅ Revocation complete');
  console.log('\nNext steps:');
  console.log('  1. Update governance ledger with revocation entry');
  console.log('  2. Notify stakeholders of the revocation');
  console.log('  3. Generate replacement artifact if needed');
}

main();

