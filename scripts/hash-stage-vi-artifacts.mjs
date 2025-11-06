#!/usr/bin/env node
/**
 * Hash Stage VI Artifacts
 * Computes SHA-256 hashes for all Block 10.2-10.9 artifacts and generates manifest
 * Usage: node scripts/hash-stage-vi-artifacts.mjs [--verify] [--compare]
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const MANIFEST_PATH = path.join(rootDir, 'governance', 'ledger', 'stageVI-hashes.json');

// Canonical Stage VI chain checksum (governance-verified)
const CANONICAL_CHAIN_CHECKSUM = '983eb29c2a75cb7ac51eb6b8524bde78554a755f45618c2329711b5db2b06b8e';

// Stage VI artifact paths (Blocks 10.2-10.9)
const STAGE_VI_ARTIFACTS = [
  // Block 10.2
  { block: '10.2', path: 'BLOCK10.2_TRANSPARENCY_API_AND_PORTAL.md', type: 'documentation' },
  { block: '10.2', path: 'BLOCK10.2_IMPLEMENTATION_SUMMARY.md', type: 'summary' },
  { block: '10.2', path: 'governance/ledger/entry-block10.2.jsonl', type: 'ledger', optional: true },
  
  // Block 10.3
  { block: '10.3', path: 'BLOCK10.3_COMPLETION_SUMMARY.md', type: 'documentation' },
  { block: '10.3', path: 'BLOCK10.3_ETHICAL_REFLECTION.md', type: 'documentation' },
  { block: '10.3', path: 'BLOCK10.3_IMPLEMENTATION_SUMMARY.md', type: 'summary' },
  
  // Block 10.4
  { block: '10.4', path: 'BLOCK10.4_DASHBOARD_REFINEMENT.md', type: 'documentation' },
  
  // Block 10.5
  { block: '10.5', path: 'BLOCK10.5_LEGAL_AND_ACCESSIBILITY.md', type: 'documentation' },
  { block: '10.5', path: 'governance/ledger/entry-block10.5-legal-accessibility.jsonl', type: 'ledger' },
  
  // Block 10.6
  { block: '10.6', path: 'BLOCK10.6_FEEDBACK_AND_TRUST.md', type: 'documentation' },
  { block: '10.6', path: 'BLOCK10.6.1_BUGFIX_DIVISION_BY_ZERO.md', type: 'bugfix' },
  { block: '10.6', path: 'governance/ledger/entry-block10.6-feedback-system.jsonl', type: 'ledger' },
  
  // Block 10.7
  { block: '10.7', path: 'BLOCK10.7_DAILY_GOVERNANCE_REPORTS.md', type: 'documentation' },
  { block: '10.7', path: 'BLOCK10.7_IMPLEMENTATION_SUMMARY.md', type: 'summary' },
  { block: '10.7', path: 'governance/ledger/entry-block10.7-daily-reports.jsonl', type: 'ledger', optional: true },
  
  // Block 10.8
  { block: '10.8', path: 'BLOCK10.8_ACCESSIBILITY_AUDIT.md', type: 'documentation' },
  { block: '10.8', path: 'reports/accessibility-audit.json', type: 'data' },
  { block: '10.8', path: 'public/certificates/wcag-2.2aa.pdf', type: 'certificate' },
  { block: '10.8', path: 'governance/ledger/entry-block10.8-accessibility-audit.jsonl', type: 'ledger', optional: true },
  
  // Block 10.9 (current)
  { block: '10.9', path: 'BLOCK10.9_CLOSURE.md', type: 'documentation' },
  { block: '10.9', path: 'BLOCK10.9_IMPLEMENTATION_SUMMARY.md', type: 'summary' },
  { block: '10.9', path: 'governance/ledger/entry-block10.9.jsonl', type: 'ledger' },
];

/**
 * Calculate SHA-256 hash of a file
 */
function calculateHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // File not found
    }
    throw error;
  }
}

/**
 * Generate artifact manifest
 */
function generateManifest() {
  console.log('🔐 Hashing Stage VI Artifacts (Blocks 10.2-10.9)\n');
  
  const artifacts = [];
  const blockHashes = {}; // For chain checksum computation
  let totalFiles = 0;
  let hashedFiles = 0;
  let missingFiles = 0;
  
  for (const artifact of STAGE_VI_ARTIFACTS) {
    const fullPath = path.join(rootDir, artifact.path);
    const hash = calculateHash(fullPath);
    
    totalFiles++;
    
    if (hash === null) {
      if (artifact.optional) {
        console.log(`⚠️  Optional: ${artifact.path} (not found, skipping)`);
      } else {
        console.log(`❌ Missing: ${artifact.path}`);
        missingFiles++;
      }
      continue;
    }
    
    hashedFiles++;
    console.log(`✅ ${artifact.block}: ${artifact.path}`);
    console.log(`   ${hash}\n`);
    
    artifacts.push({
      block: artifact.block,
      path: artifact.path,
      type: artifact.type,
      sha256: hash,
      size: fs.statSync(fullPath).size,
    });
    
    // Collect hashes by block for chain checksum
    if (!blockHashes[artifact.block]) {
      blockHashes[artifact.block] = [];
    }
    blockHashes[artifact.block].push(hash);
  }
  
  // Compute CHAIN_CHECKSUM
  // Concatenate all hashes in block order (10.2 -> 10.9)
  const blockOrder = ['10.2', '10.3', '10.4', '10.5', '10.6', '10.7', '10.8', '10.9'];
  let concatenatedHashes = '';
  
  for (const block of blockOrder) {
    if (blockHashes[block]) {
      concatenatedHashes += blockHashes[block].join('');
    }
  }
  
  const chainChecksum = crypto
    .createHash('sha256')
    .update(concatenatedHashes)
    .digest('hex');
  
  // Get environment details
  let gitCommit = 'unknown';
  try {
    gitCommit = execSync('git rev-parse HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
  } catch (error) {
    // Git not available or not a git repo
  }
  
  // Generate manifest
  const manifest = {
    stage: 'VI',
    blocks: blockOrder,
    timestamp: new Date().toISOString(),
    environment: {
      os: process.platform,
      node_version: process.version,
      crypto_algorithm: 'SHA-256',
      git_commit: gitCommit,
    },
    summary: {
      total_artifacts: hashedFiles,
      total_blocks: blockOrder.length,
      missing_artifacts: missingFiles,
      chain_checksum_source: `Concatenation of ${hashedFiles} hashes in block order`,
    },
    artifacts,
    chain_checksum: chainChecksum,
    canonical_checksum: CANONICAL_CHAIN_CHECKSUM,
    notes: 'Stage VI closure manifest covering Blocks 10.2-10.9',
  };
  
  // Ensure output directory exists
  const manifestDir = path.dirname(MANIFEST_PATH);
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }
  
  // Write manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 Manifest Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total Artifacts:   ${hashedFiles}/${totalFiles}`);
  console.log(`Missing:           ${missingFiles}`);
  console.log(`Chain Checksum:    ${chainChecksum}`);
  console.log(`Canonical:         ${CANONICAL_CHAIN_CHECKSUM}`);
  console.log(`Match:             ${chainChecksum === CANONICAL_CHAIN_CHECKSUM ? '✅ YES' : '❌ NO'}`);
  console.log(`Manifest Location: ${path.relative(rootDir, MANIFEST_PATH)}`);
  console.log(`Git Commit:        ${gitCommit}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (missingFiles > 0) {
    console.log('⚠️  Warning: Some artifacts are missing. Complete Block 10.9 artifacts before finalizing.');
    process.exit(1);
  }
  
  console.log('✅ Manifest generated successfully!\n');
  return manifest;
}

/**
 * Verify existing manifest
 */
function verifyManifest() {
  console.log('🔍 Verifying Stage VI Artifacts\n');
  
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ Manifest not found. Run without --verify to generate.');
    process.exit(1);
  }
  
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  let passed = 0;
  let failed = 0;
  
  console.log(`📋 Manifest Date: ${manifest.timestamp}`);
  console.log(`📋 Chain Checksum: ${manifest.chain_checksum}\n`);
  
  for (const artifact of manifest.artifacts) {
    const fullPath = path.join(rootDir, artifact.path);
    const currentHash = calculateHash(fullPath);
    
    if (currentHash === null) {
      console.log(`❌ MISSING: ${artifact.path}`);
      failed++;
      continue;
    }
    
    if (currentHash === artifact.sha256) {
      console.log(`✅ VERIFIED: ${artifact.path}`);
      passed++;
    } else {
      console.log(`❌ MISMATCH: ${artifact.path}`);
      console.log(`   Expected: ${artifact.sha256}`);
      console.log(`   Got:      ${currentHash}`);
      failed++;
    }
  }
  
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
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Verification Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Verified:          ${passed}/${manifest.artifacts.length}`);
  console.log(`Failed:            ${failed}`);
  console.log(`Chain Checksum:    ${recomputedChecksum === manifest.chain_checksum ? '✅ VALID' : '❌ INVALID'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (failed > 0 || recomputedChecksum !== manifest.chain_checksum) {
    console.error('❌ Verification failed!');
    process.exit(1);
  }
  
  console.log('✅ All artifacts verified successfully!\n');
}

/**
 * Compare checksum against canonical value
 */
function compareChecksum() {
  console.log('🔍 Comparing Chain Checksum Against Canonical Value\n');
  
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ Manifest not found. Run without --compare to generate first.');
    process.exit(1);
  }
  
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const computed = manifest.chain_checksum;
  
  console.log(`Computed:  ${computed}`);
  console.log(`Canonical: ${CANONICAL_CHAIN_CHECKSUM}\n`);
  
  if (computed === CANONICAL_CHAIN_CHECKSUM) {
    console.log('✅ PASS: Chain checksum matches canonical value');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Environment Details');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Node:      ${manifest.environment.node_version}`);
    console.log(`OS:        ${manifest.environment.os}`);
    console.log(`Git:       ${manifest.environment.git_commit || 'unknown'}`);
    console.log(`Timestamp: ${manifest.timestamp}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('✅ Integrity verification PASSED\n');
    process.exit(0);
  } else {
    console.log('❌ FAIL: Chain checksum does NOT match canonical value\n');
    console.log('⚠️  This indicates:');
    console.log('   - Local modifications to Stage VI artifacts');
    console.log('   - Missing or extra files in the artifact set');
    console.log('   - Different formatting or line endings');
    console.log('   - Dependency version mismatch\n');
    console.log('🔧 Remediation steps:');
    console.log('   1. Run: npm run format:write');
    console.log('   2. Verify clean git status');
    console.log('   3. Reinstall dependencies: npm ci');
    console.log('   4. Re-run: npm run integrity:check\n');
    console.log('❌ Integrity verification FAILED\n');
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);
const isVerify = args.includes('--verify');
const isCompare = args.includes('--compare');

try {
  if (isCompare) {
    compareChecksum();
  } else if (isVerify) {
    verifyManifest();
  } else {
    generateManifest();
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

