#!/usr/bin/env node

/**
 * @fileoverview Trust Proof Status Display
 * @see BLOCK9.7_TRUST_PROOF_FRAMEWORK.md
 *
 * Displays current status of all trust proofs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

console.log('📊 Trust Proof Status (Block 9.7)');
console.log('═'.repeat(80));

function loadProofs(filename) {
  const proofsPath = path.join(ROOT, 'governance', 'trust-proofs', filename);
  
  if (!fs.existsSync(proofsPath)) {
    return [];
  }
  
  const content = fs.readFileSync(proofsPath, 'utf-8');
  const lines = content.trim().split('\n').filter(line => line.trim());
  
  return lines.map(line => JSON.parse(line));
}

function main() {
  const activeProofs = loadProofs('active-proofs.jsonl');
  const revokedProofs = loadProofs('revoked-proofs.jsonl');
  
  console.log(`\n📈 Active Proofs: ${activeProofs.length}`);
  
  if (activeProofs.length > 0) {
    activeProofs.forEach((proof, index) => {
      const expiryDate = new Date(proof.expires_at);
      const now = new Date();
      const isExpired = now > expiryDate;
      const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
      
      console.log(`\n${index + 1}. ${proof.artifact_id}`);
      console.log(`   Type: ${proof.artifact_type}`);
      console.log(`   Issued: ${proof.issued_at}`);
      console.log(`   Expires: ${proof.expires_at}`);
      console.log(`   Status: ${isExpired ? '⚠️  EXPIRED' : `✅ Valid (${daysUntilExpiry} days remaining)`}`);
      console.log(`   Hash: ${proof.artifact_hash.substring(0, 32)}...`);
    });
  }
  
  console.log(`\n\n🚩 Revoked Proofs: ${revokedProofs.length}`);
  
  if (revokedProofs.length > 0) {
    revokedProofs.forEach((proof, index) => {
      console.log(`\n${index + 1}. ${proof.artifact_id}`);
      console.log(`   Revoked: ${proof.revoked_at}`);
      console.log(`   Reason: ${proof.reason}`);
      console.log(`   By: ${proof.revoked_by}`);
    });
  }
  
  console.log('\n' + '═'.repeat(80));
}

main();

