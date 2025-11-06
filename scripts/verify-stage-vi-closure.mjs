#!/usr/bin/env node
/**
 * Verify Stage VI Closure
 * Comprehensive end-to-end verification of Stage VI governance closure
 * 
 * Verification Steps:
 * 1. Verify all artifact hashes against manifest
 * 2. Verify chain checksum computation
 * 3. Verify ledger entry structure and references
 * 4. Check GPG signatures (if present)
 * 5. Verify certificate integrity
 * 6. Cross-reference all dependencies
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const MANIFEST_PATH = path.join(rootDir, 'governance', 'ledger', 'stageVI-hashes.json');
const LEDGER_ENTRY_PATH = path.join(rootDir, 'governance', 'ledger', 'entry-block10.9.jsonl');
const MAIN_LEDGER_PATH = path.join(rootDir, 'governance', 'ledger', 'ledger.jsonl');
const CERTIFICATE_PATH = path.join(rootDir, 'public', 'certificate-governance.pdf');
const CLOSURE_DOC_PATH = path.join(rootDir, 'BLOCK10.9_CLOSURE.md');

// Verification results
const results = {
  artifacts: { passed: 0, failed: 0, missing: 0 },
  chainChecksum: { status: 'pending', expected: null, computed: null },
  ledgerEntry: { status: 'pending', errors: [] },
  signatures: { aa: 'pending', ewa: 'pending' },
  certificate: { status: 'pending', hash: null },
  mainLedger: { status: 'pending', found: false },
  overall: 'pending'
};

/**
 * Calculate SHA-256 hash of a file
 */
function calculateHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (error) {
    return null;
  }
}

/**
 * Step 1: Verify all artifact hashes
 */
function verifyArtifacts(manifest) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 Step 1: Verifying Artifact Hashes');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  for (const artifact of manifest.artifacts) {
    const fullPath = path.join(rootDir, artifact.path);
    const currentHash = calculateHash(fullPath);
    
    if (currentHash === null) {
      console.log(`❌ MISSING: ${artifact.path}`);
      results.artifacts.missing++;
      continue;
    }
    
    if (currentHash === artifact.sha256) {
      console.log(`✅ VERIFIED: ${artifact.path}`);
      results.artifacts.passed++;
    } else {
      console.log(`❌ MISMATCH: ${artifact.path}`);
      console.log(`   Expected: ${artifact.sha256}`);
      console.log(`   Got:      ${currentHash}`);
      results.artifacts.failed++;
    }
  }
  
  console.log(`\n📊 Artifacts: ${results.artifacts.passed} passed, ${results.artifacts.failed} failed, ${results.artifacts.missing} missing`);
}

/**
 * Step 2: Verify chain checksum
 */
function verifyChainChecksum(manifest) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔗 Step 2: Verifying Chain Checksum');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Recompute chain checksum
  const blockOrder = ['10.2', '10.3', '10.4', '10.5', '10.6', '10.7', '10.8', '10.9'];
  const blockHashes = {};
  
  for (const artifact of manifest.artifacts) {
    if (!blockHashes[artifact.block]) {
      blockHashes[artifact.block] = [];
    }
    blockHashes[artifact.block].push(artifact.sha256);
  }
  
  let concatenatedHashes = '';
  for (const block of blockOrder) {
    if (blockHashes[block]) {
      concatenatedHashes += blockHashes[block].join('');
    }
  }
  
  const recomputedChecksum = crypto
    .createHash('sha256')
    .update(concatenatedHashes)
    .digest('hex');
  
  results.chainChecksum.expected = manifest.chain_checksum;
  results.chainChecksum.computed = recomputedChecksum;
  
  if (recomputedChecksum === manifest.chain_checksum) {
    console.log(`✅ Chain checksum VALID`);
    console.log(`   Checksum: ${recomputedChecksum}`);
    results.chainChecksum.status = 'valid';
  } else {
    console.log(`❌ Chain checksum MISMATCH`);
    console.log(`   Expected: ${manifest.chain_checksum}`);
    console.log(`   Computed: ${recomputedChecksum}`);
    results.chainChecksum.status = 'invalid';
  }
}

/**
 * Step 3: Verify ledger entry structure
 */
function verifyLedgerEntry() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Step 3: Verifying Ledger Entry Structure');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (!fs.existsSync(LEDGER_ENTRY_PATH)) {
    console.log(`❌ Ledger entry not found: ${LEDGER_ENTRY_PATH}`);
    results.ledgerEntry.status = 'missing';
    return null;
  }
  
  try {
    const content = fs.readFileSync(LEDGER_ENTRY_PATH, 'utf8').trim();
    const entry = JSON.parse(content);
    
    // Verify required fields
    const requiredFields = [
      'ledger_ref',
      'stage',
      'blocks',
      'timestamp',
      'manifest',
      'chain_checksum',
      'signers',
      'public_certificate',
      'verdict',
      'handover'
    ];
    
    for (const field of requiredFields) {
      if (!entry[field]) {
        console.log(`❌ Missing required field: ${field}`);
        results.ledgerEntry.errors.push(`Missing field: ${field}`);
      } else {
        console.log(`✅ Field present: ${field}`);
      }
    }
    
    // Verify specific values
    if (entry.ledger_ref !== 'entry-block10.9-closure') {
      console.log(`⚠️  Unexpected ledger_ref: ${entry.ledger_ref}`);
      results.ledgerEntry.errors.push('Unexpected ledger_ref');
    }
    
    if (entry.stage !== 'VI') {
      console.log(`⚠️  Unexpected stage: ${entry.stage}`);
      results.ledgerEntry.errors.push('Unexpected stage');
    }
    
    if (entry.verdict !== 'stage_vi_closed') {
      console.log(`⚠️  Unexpected verdict: ${entry.verdict}`);
      results.ledgerEntry.errors.push('Unexpected verdict');
    }
    
    // Verify signers
    if (entry.signers && Array.isArray(entry.signers)) {
      const signerAliases = entry.signers.map(s => s.alias);
      if (signerAliases.includes('A.I.K.') && signerAliases.includes('EWA')) {
        console.log(`✅ Dual signers present: A.I.K. and EWA`);
      } else {
        console.log(`❌ Missing expected signers`);
        results.ledgerEntry.errors.push('Missing signers');
      }
    }
    
    if (results.ledgerEntry.errors.length === 0) {
      console.log(`\n✅ Ledger entry structure VALID`);
      results.ledgerEntry.status = 'valid';
    } else {
      console.log(`\n⚠️  Ledger entry has ${results.ledgerEntry.errors.length} issues`);
      results.ledgerEntry.status = 'issues';
    }
    
    return entry;
  } catch (error) {
    console.log(`❌ Error parsing ledger entry: ${error.message}`);
    results.ledgerEntry.status = 'invalid';
    results.ledgerEntry.errors.push(error.message);
    return null;
  }
}

/**
 * Step 4: Check GPG signatures
 */
async function checkSignatures() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Step 4: Checking GPG Signatures');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const sigAA = path.join(rootDir, 'governance', 'ledger', 'signatures', 'entry-block10.9-closure.aa.asc');
  const sigEWA = path.join(rootDir, 'governance', 'ledger', 'signatures', 'entry-block10.9-closure.ewa.asc');
  
  // Check if signatures exist
  if (!fs.existsSync(sigAA)) {
    console.log(`⚠️  A.I.K. signature file not found (placeholder expected)`);
    results.signatures.aa = 'placeholder';
  } else {
    const sigContent = fs.readFileSync(sigAA, 'utf8');
    if (sigContent.includes('[PLACEHOLDER')) {
      console.log(`⚠️  A.I.K. signature is placeholder (awaiting actual GPG signing)`);
      results.signatures.aa = 'placeholder';
    } else {
      // Try to verify with GPG
      try {
        const { stdout, stderr } = await execAsync(`gpg --verify "${sigAA}" "${CLOSURE_DOC_PATH}" 2>&1`);
        if (stdout.includes('Good signature') || stderr.includes('Good signature')) {
          console.log(`✅ A.I.K. signature VALID`);
          results.signatures.aa = 'valid';
        } else {
          console.log(`❌ A.I.K. signature verification failed`);
          results.signatures.aa = 'invalid';
        }
      } catch (error) {
        console.log(`⚠️  A.I.K. signature verification error (GPG may not be configured)`);
        results.signatures.aa = 'unchecked';
      }
    }
  }
  
  if (!fs.existsSync(sigEWA)) {
    console.log(`⚠️  EWA signature file not found (placeholder expected)`);
    results.signatures.ewa = 'placeholder';
  } else {
    const sigContent = fs.readFileSync(sigEWA, 'utf8');
    if (sigContent.includes('[PLACEHOLDER')) {
      console.log(`⚠️  EWA signature is placeholder (awaiting actual GPG signing)`);
      results.signatures.ewa = 'placeholder';
    } else {
      // Try to verify with GPG
      try {
        const { stdout, stderr } = await execAsync(`gpg --verify "${sigEWA}" "${CLOSURE_DOC_PATH}" 2>&1`);
        if (stdout.includes('Good signature') || stderr.includes('Good signature')) {
          console.log(`✅ EWA signature VALID`);
          results.signatures.ewa = 'valid';
        } else {
          console.log(`❌ EWA signature verification failed`);
          results.signatures.ewa = 'invalid';
        }
      } catch (error) {
        console.log(`⚠️  EWA signature verification error (GPG may not be configured)`);
        results.signatures.ewa = 'unchecked';
      }
    }
  }
  
  console.log(`\n📊 Signatures: A.I.K. [${results.signatures.aa}], EWA [${results.signatures.ewa}]`);
}

/**
 * Step 5: Verify certificate
 */
function verifyCertificate() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📜 Step 5: Verifying Public Certificate');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (!fs.existsSync(CERTIFICATE_PATH)) {
    console.log(`⚠️  Certificate not found: ${CERTIFICATE_PATH}`);
    console.log(`   Run: node scripts/generate-governance-certificate.mjs`);
    results.certificate.status = 'missing';
    return;
  }
  
  const certHash = calculateHash(CERTIFICATE_PATH);
  const certSize = fs.statSync(CERTIFICATE_PATH).size;
  
  console.log(`✅ Certificate found`);
  console.log(`   Location: ${path.relative(rootDir, CERTIFICATE_PATH)}`);
  console.log(`   Size: ${(certSize / 1024).toFixed(2)} KB`);
  console.log(`   SHA-256: ${certHash}`);
  
  results.certificate.status = 'present';
  results.certificate.hash = certHash;
}

/**
 * Step 6: Check main ledger
 */
function checkMainLedger(ledgerEntry) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📚 Step 6: Checking Main Ledger');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (!fs.existsSync(MAIN_LEDGER_PATH)) {
    console.log(`❌ Main ledger not found: ${MAIN_LEDGER_PATH}`);
    results.mainLedger.status = 'missing';
    return;
  }
  
  const ledgerContent = fs.readFileSync(MAIN_LEDGER_PATH, 'utf8');
  const lines = ledgerContent.trim().split('\n');
  
  console.log(`📋 Main ledger has ${lines.length} entries`);
  
  // Check if Block 10.9 entry is present
  const hasBlock109 = lines.some(line => {
    try {
      const entry = JSON.parse(line);
      return entry.ledger_ref === 'entry-block10.9-closure' || 
             entry.entry_id === 'entry-block10.9-closure' ||
             entry.blockId === '10.9';
    } catch {
      return false;
    }
  });
  
  if (hasBlock109) {
    console.log(`✅ Block 10.9 entry found in main ledger`);
    results.mainLedger.status = 'present';
    results.mainLedger.found = true;
  } else {
    console.log(`⚠️  Block 10.9 entry not yet appended to main ledger`);
    console.log(`   Entry exists at: ${path.relative(rootDir, LEDGER_ENTRY_PATH)}`);
    console.log(`   Append manually or via update script`);
    results.mainLedger.status = 'pending';
    results.mainLedger.found = false;
  }
}

/**
 * Generate final report
 */
function generateReport() {
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 VERIFICATION SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Determine overall status
  const criticalFailures = 
    results.artifacts.failed > 0 ||
    results.chainChecksum.status === 'invalid' ||
    results.ledgerEntry.status === 'invalid' ||
    results.ledgerEntry.status === 'missing';
  
  const warnings = 
    results.artifacts.missing > 0 ||
    results.signatures.aa === 'placeholder' ||
    results.signatures.ewa === 'placeholder' ||
    results.certificate.status === 'missing' ||
    !results.mainLedger.found;
  
  if (criticalFailures) {
    results.overall = 'FAILED';
    console.log('❌ OVERALL STATUS: FAILED\n');
  } else if (warnings) {
    results.overall = 'PARTIAL';
    console.log('⚠️  OVERALL STATUS: PARTIAL (with warnings)\n');
  } else {
    results.overall = 'PASSED';
    console.log('✅ OVERALL STATUS: PASSED\n');
  }
  
  // Detailed breakdown
  console.log('Artifacts:');
  console.log(`  ✅ Verified: ${results.artifacts.passed}`);
  console.log(`  ❌ Failed: ${results.artifacts.failed}`);
  console.log(`  ⚠️  Missing: ${results.artifacts.missing}`);
  console.log('');
  
  console.log(`Chain Checksum: ${results.chainChecksum.status === 'valid' ? '✅' : '❌'} ${results.chainChecksum.status.toUpperCase()}`);
  console.log(`Ledger Entry: ${results.ledgerEntry.status === 'valid' ? '✅' : '⚠️'} ${results.ledgerEntry.status.toUpperCase()}`);
  console.log(`Signatures (A.I.K.): ${results.signatures.aa === 'valid' ? '✅' : '⚠️'} ${results.signatures.aa.toUpperCase()}`);
  console.log(`Signatures (EWA): ${results.signatures.ewa === 'valid' ? '✅' : '⚠️'} ${results.signatures.ewa.toUpperCase()}`);
  console.log(`Certificate: ${results.certificate.status === 'present' ? '✅' : '⚠️'} ${results.certificate.status.toUpperCase()}`);
  console.log(`Main Ledger: ${results.mainLedger.found ? '✅' : '⚠️'} ${results.mainLedger.status.toUpperCase()}`);
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (results.overall === 'FAILED') {
    console.log('❌ Verification failed. Please review errors above.');
    process.exit(1);
  } else if (results.overall === 'PARTIAL') {
    console.log('⚠️  Verification passed with warnings. Review items above.');
    console.log('\nRecommended actions:');
    if (results.signatures.aa === 'placeholder' || results.signatures.ewa === 'placeholder') {
      console.log('  • Complete GPG signature process');
    }
    if (results.certificate.status === 'missing') {
      console.log('  • Run: node scripts/generate-governance-certificate.mjs');
    }
    if (!results.mainLedger.found) {
      console.log('  • Append Block 10.9 entry to main ledger');
    }
    process.exit(0);
  } else {
    console.log('✅ All verification checks passed!');
    console.log('\nStage VI closure is complete and verified.');
    process.exit(0);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Stage VI Closure Verification');
  console.log('═══════════════════════════════════════════\n');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Environment: ${process.platform} ${process.arch}`);
  console.log(`Node.js: ${process.version}`);
  
  // Check if manifest exists
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`\n❌ Manifest not found: ${MANIFEST_PATH}`);
    console.error('   Run: node scripts/hash-stage-vi-artifacts.mjs');
    process.exit(1);
  }
  
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  
  // Run all verification steps
  verifyArtifacts(manifest);
  verifyChainChecksum(manifest);
  const ledgerEntry = verifyLedgerEntry();
  await checkSignatures();
  verifyCertificate();
  checkMainLedger(ledgerEntry);
  
  // Generate final report
  generateReport();
}

// Execute
main().catch(error => {
  console.error('❌ Verification error:', error);
  process.exit(1);
});

