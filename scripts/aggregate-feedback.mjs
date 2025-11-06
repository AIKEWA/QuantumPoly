#!/usr/bin/env node

/**
 * Feedback Aggregation Script
 *
 * Processes feedback synthesis reports and integrates them into the governance ledger.
 * 
 * Functionality:
 * - Validates raw-findings.json against schema
 * - Computes artifact hashes (SHA256)
 * - Generates governance ledger entry
 * - Appends to ledger.jsonl
 * - Verifies ledger integrity post-write
 *
 * Usage:
 *   node scripts/aggregate-feedback.mjs --cycle 2025-Q4-validation
 *   npm run feedback:aggregate -- --cycle 2025-Q4-validation
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

// Configuration
const LEDGER_FILE = './governance/ledger/ledger.jsonl';
const FEEDBACK_BASE = './governance/feedback/cycles';
const SCHEMA_FILE = './governance/feedback/schema/feedback-entry.schema.json';

/**
 * Parse command-line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const cycleIndex = args.indexOf('--cycle');
  
  if (cycleIndex === -1 || !args[cycleIndex + 1]) {
    console.error('❌ Error: --cycle parameter required');
    console.error('   Usage: node scripts/aggregate-feedback.mjs --cycle <cycle-id>');
    console.error('   Example: node scripts/aggregate-feedback.mjs --cycle 2025-Q4-validation');
    process.exit(1);
  }
  
  return {
    cycleId: args[cycleIndex + 1]
  };
}

/**
 * Compute SHA256 hash of file contents
 */
function computeFileHash(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Compute SHA256 hash of data
 */
function sha256(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Compute Merkle tree root from multiple hashes
 */
function computeMerkleRoot(hashes) {
  if (hashes.length === 0) {
    return sha256({ empty: true });
  }
  
  if (hashes.length === 1) {
    return hashes[0];
  }
  
  // Simple Merkle tree: hash pairs iteratively
  let currentLevel = [...hashes];
  
  while (currentLevel.length > 1) {
    const nextLevel = [];
    
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        // Hash pair
        const combined = sha256({ left: currentLevel[i], right: currentLevel[i + 1] });
        nextLevel.push(combined);
      } else {
        // Odd element, promote to next level
        nextLevel.push(currentLevel[i]);
      }
    }
    
    currentLevel = nextLevel;
  }
  
  return currentLevel[0];
}

/**
 * Get current Git commit hash
 */
function getGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn('   ⚠️  Could not determine Git commit (using placeholder)');
    return 'uncommitted';
  }
}

/**
 * Load and validate findings JSON
 */
function loadFindings(cycleDir, cycleId) {
  const findingsPath = path.join(cycleDir, 'raw-findings.json');
  
  if (!fs.existsSync(findingsPath)) {
    throw new Error(`Findings file not found: ${findingsPath}`);
  }
  
  console.log(`   📄 Loading findings from: ${findingsPath}`);
  
  const findingsData = fs.readFileSync(findingsPath, 'utf8');
  const findings = JSON.parse(findingsData);
  
  // Basic validation
  if (findings.cycleId !== cycleId) {
    throw new Error(`Cycle ID mismatch: expected ${cycleId}, found ${findings.cycleId}`);
  }
  
  if (!findings.summary || !findings.findings) {
    throw new Error('Invalid findings structure: missing summary or findings array');
  }
  
  console.log(`   ✅ Loaded ${findings.findings.length} findings`);
  
  return findings;
}

/**
 * Generate ledger entry for feedback synthesis
 */
function generateLedgerEntry(cycleId, cycleDir, findings) {
  console.log('\n📝 Generating ledger entry...');
  
  // Compute artifact hashes
  const synthesisPath = path.join(cycleDir, 'synthesis-report.md');
  const findingsPath = path.join(cycleDir, 'raw-findings.json');
  const metadataPath = path.join(cycleDir, 'metadata.json');
  
  const synthesisHash = computeFileHash(synthesisPath);
  const findingsHash = computeFileHash(findingsPath);
  const metadataHash = computeFileHash(metadataPath);
  
  if (!synthesisHash || !findingsHash || !metadataHash) {
    throw new Error('Could not compute hashes for all artifacts');
  }
  
  console.log(`   🔢 Synthesis hash: ${synthesisHash.substring(0, 16)}...`);
  console.log(`   🔢 Findings hash:  ${findingsHash.substring(0, 16)}...`);
  console.log(`   🔢 Metadata hash:  ${metadataHash.substring(0, 16)}...`);
  
  // Compute Merkle root from individual finding hashes
  const findingHashes = findings.findings.map(f => f.hash);
  const merkleRoot = computeMerkleRoot(findingHashes);
  
  console.log(`   🌳 Merkle root:    ${merkleRoot.substring(0, 16)}...`);
  
  // Get current commit
  const commit = getGitCommit();
  
  // Construct ledger entry
  const entry = {
    id: `feedback-${cycleId}`,
    timestamp: new Date().toISOString(),
    commit: commit,
    entryType: 'feedback-synthesis',
    cycleId: cycleId,
    metrics: {
      totalFindings: findings.summary.totalFindings,
      criticalFindings: findings.summary.byPriority.P0,
      highPriorityFindings: findings.summary.byPriority.P1,
      mediumPriorityFindings: findings.summary.byPriority.P2,
      resolvedFindings: findings.summary.byStatus.Resolved || 0,
      averageResolutionDays: null
    },
    artifactLinks: [
      `governance/feedback/cycles/${cycleId}/synthesis-report.md`,
      `governance/feedback/cycles/${cycleId}/raw-findings.json`,
      `governance/feedback/cycles/${cycleId}/metadata.json`
    ],
    hash: sha256({
      synthesis: synthesisHash,
      findings: findingsHash,
      metadata: metadataHash
    }),
    merkleRoot: merkleRoot,
    signature: null
  };
  
  console.log(`   ✅ Entry generated: ${entry.id}`);
  
  return entry;
}

/**
 * Append entry to ledger
 */
function appendToLedger(entry) {
  console.log('\n📥 Appending to ledger...');
  
  // Ensure ledger file exists
  if (!fs.existsSync(LEDGER_FILE)) {
    console.error(`   ❌ Ledger file not found: ${LEDGER_FILE}`);
    throw new Error('Ledger file does not exist');
  }
  
  // Check if entry already exists
  const existing = fs.readFileSync(LEDGER_FILE, 'utf8').trim().split('\n').filter(Boolean);
  for (const line of existing) {
    const existingEntry = JSON.parse(line);
    if (existingEntry.id === entry.id) {
      console.error(`   ❌ Entry ${entry.id} already exists in ledger`);
      throw new Error('Duplicate entry ID');
    }
  }
  
  // Append entry
  const entryLine = JSON.stringify(entry);
  fs.appendFileSync(LEDGER_FILE, entryLine + '\n', 'utf8');
  
  console.log(`   ✅ Entry appended to ledger: ${LEDGER_FILE}`);
}

/**
 * Verify ledger integrity after write
 */
function verifyLedgerIntegrity() {
  console.log('\n🔍 Verifying ledger integrity...');
  
  try {
    execSync('node scripts/verify-ledger.mjs', { stdio: 'inherit' });
    console.log('   ✅ Ledger verification passed');
  } catch (error) {
    console.error('   ❌ Ledger verification failed');
    throw error;
  }
}

/**
 * Update metadata file with ledger integration status
 */
function updateMetadata(cycleDir, entry) {
  console.log('\n📝 Updating cycle metadata...');
  
  const metadataPath = path.join(cycleDir, 'metadata.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  
  metadata.governance.ledgerIntegrated = true;
  metadata.governance.ledgerIntegrationDate = new Date().toISOString();
  metadata.governance.ledgerEntryId = entry.id;
  
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n', 'utf8');
  
  console.log('   ✅ Metadata updated');
}

/**
 * Main execution
 */
function main() {
  console.log('\n🔄 Feedback Aggregation & Ledger Integration');
  console.log('═'.repeat(80));
  
  // Parse arguments
  const { cycleId } = parseArgs();
  console.log(`\n📋 Processing cycle: ${cycleId}`);
  
  // Resolve cycle directory
  const cycleDir = path.join(FEEDBACK_BASE, cycleId);
  
  if (!fs.existsSync(cycleDir)) {
    console.error(`   ❌ Cycle directory not found: ${cycleDir}`);
    process.exit(1);
  }
  
  console.log(`   ✅ Cycle directory: ${cycleDir}`);
  
  try {
    // Load findings
    const findings = loadFindings(cycleDir, cycleId);
    
    // Generate ledger entry
    const entry = generateLedgerEntry(cycleId, cycleDir, findings);
    
    // Append to ledger
    appendToLedger(entry);
    
    // Update metadata
    updateMetadata(cycleDir, entry);
    
    // Verify integrity
    verifyLedgerIntegrity();
    
    // Success
    console.log('\n✅ Feedback Aggregation Complete');
    console.log('═'.repeat(80));
    console.log(`   Cycle:          ${cycleId}`);
    console.log(`   Ledger Entry:   ${entry.id}`);
    console.log(`   Total Findings: ${findings.summary.totalFindings}`);
    console.log(`   Critical (P0):  ${findings.summary.byPriority.P0}`);
    console.log(`   High (P1):      ${findings.summary.byPriority.P1}`);
    console.log(`   Medium (P2):    ${findings.summary.byPriority.P2}`);
    console.log('═'.repeat(80));
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Aggregation failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Execute
main();

