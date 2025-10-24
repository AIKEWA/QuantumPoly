#!/usr/bin/env node

/**
 * Transparency Ledger Update Script
 *
 * Computes Merkle tree of metric hashes, signs with GPG, and appends to ledger.
 * Ensures immutability through cryptographic verification.
 *
 * Usage:
 *   node scripts/ledger-update.mjs
 *
 * Environment:
 *   GPG_KEY_ID - GPG key ID for signing (optional, uses default if not set)
 *   CI - Set to 'true' in CI environments to use GPG_PRIVATE_KEY from secrets
 */

import fs from 'fs';
import crypto from 'crypto';
import { execSync } from 'child_process';

// Configuration
const DASHBOARD_DATA = './reports/governance/dashboard-data.json';
const LEDGER_FILE = './governance/ledger/ledger.jsonl';
const LEDGER_DIR = './governance/ledger';

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Compute SHA256 hash
 */
function sha256(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Build Merkle tree from hashes
 */
function buildMerkleTree(hashes) {
  if (hashes.length === 0) {
    return { root: sha256(''), tree: [] };
  }

  if (hashes.length === 1) {
    return { root: hashes[0], tree: [hashes] };
  }

  const tree = [hashes];
  let currentLevel = hashes;

  while (currentLevel.length > 1) {
    const nextLevel = [];
    
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        // Hash pair
        const combined = currentLevel[i] + currentLevel[i + 1];
        nextLevel.push(sha256(combined));
      } else {
        // Odd number: promote single hash
        nextLevel.push(currentLevel[i]);
      }
    }

    tree.push(nextLevel);
    currentLevel = nextLevel;
  }

  return { root: currentLevel[0], tree };
}

/**
 * Sign data with GPG
 */
function signWithGPG(data) {
  const isCI = process.env.CI === 'true';
  
  if (isCI) {
    console.log('   🔐 CI environment detected, using GPG_PRIVATE_KEY from secrets');
    
    // In CI: import private key from environment
    const privateKey = process.env.GPG_PRIVATE_KEY;
    if (!privateKey) {
      console.warn('   ⚠️  GPG_PRIVATE_KEY not set in CI, skipping signature');
      return null;
    }

    try {
      // Import key
      execSync('echo "$GPG_PRIVATE_KEY" | gpg --batch --import', {
        encoding: 'utf8',
        env: { ...process.env, GPG_PRIVATE_KEY: privateKey },
      });

      // Sign data
      const signature = execSync('gpg --batch --armor --detach-sign', {
        input: data,
        encoding: 'utf8',
      });

      return signature.trim();
    } catch (error) {
      console.warn('   ⚠️  GPG signing failed in CI:', error.message);
      return null;
    }
  } else {
    console.log('   🔐 Local environment, attempting GPG signature');
    
    try {
      // Check if GPG is available
      execSync('gpg --version', { stdio: 'ignore' });

      // Sign data with default key
      const keyId = process.env.GPG_KEY_ID || '';
      const keyArg = keyId ? `--local-user ${keyId}` : '';
      
      const signature = execSync(`gpg --batch --armor --detach-sign ${keyArg}`, {
        input: data,
        encoding: 'utf8',
      });

      return signature.trim();
    } catch (error) {
      console.warn('   ⚠️  GPG not available or signing failed:', error.message);
      console.warn('   💡 Install GPG and configure a key to enable signing');
      return null;
    }
  }
}

/**
 * Read existing ledger
 */
function readLedger() {
  if (!fs.existsSync(LEDGER_FILE)) {
    return [];
  }

  const lines = fs.readFileSync(LEDGER_FILE, 'utf8').trim().split('\n').filter(Boolean);
  return lines.map(line => JSON.parse(line));
}

/**
 * Append to ledger
 */
function appendToLedger(entry) {
  ensureDir(LEDGER_DIR);
  
  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(LEDGER_FILE, line, 'utf8');
}

/**
 * Main ledger update function
 */
function updateLedger() {
  console.log('\n🔒 Transparency Ledger Update');
  console.log('═'.repeat(80));

  // Load dashboard data
  console.log('📊 Loading dashboard data...');
  if (!fs.existsSync(DASHBOARD_DATA)) {
    console.error('   ❌ Dashboard data not found');
    console.error('   Run `npm run ethics:aggregate` first');
    process.exit(1);
  }

  const dashboardData = JSON.parse(fs.readFileSync(DASHBOARD_DATA, 'utf8'));
  console.log('   ✅ Dashboard data loaded');

  // Extract metrics and compute hashes
  console.log('🔢 Computing Merkle tree...');
  const metricHashes = (dashboardData.reports || []).map(report => report.hash);
  const { root: merkleRoot, tree } = buildMerkleTree(metricHashes);
  
  console.log(`   ✅ Merkle root: ${merkleRoot.substring(0, 16)}...`);
  console.log(`   Tree depth: ${tree.length}, Leaf nodes: ${metricHashes.length}`);

  // Create ledger entry
  const entry = {
    id: dashboardData.ledgerEntry,
    timestamp: dashboardData.timestamp,
    commit: dashboardData.commit,
    eii: dashboardData.eii,
    metrics: dashboardData.metrics,
    hash: dashboardData.hash,
    merkleRoot,
    signature: null, // Will be filled if GPG available
  };

  // Sign the entry
  console.log('✍️  Signing ledger entry...');
  const dataToSign = JSON.stringify({
    id: entry.id,
    timestamp: entry.timestamp,
    commit: entry.commit,
    merkleRoot: entry.merkleRoot,
  });

  const signature = signWithGPG(dataToSign);
  if (signature) {
    entry.signature = signature;
    console.log('   ✅ Entry signed with GPG');
  } else {
    console.log('   ⚠️  Entry not signed (GPG unavailable)');
  }

  // Check for duplicate entry
  const existingLedger = readLedger();
  const duplicate = existingLedger.find(e => e.id === entry.id);
  
  if (duplicate) {
    console.warn(`   ⚠️  Entry ${entry.id} already exists in ledger`);
    console.warn('   Skipping append to prevent duplication');
    console.log('═'.repeat(80));
    console.log('');
    return;
  }

  // Append to ledger
  console.log('📝 Appending to ledger...');
  appendToLedger(entry);
  console.log('   ✅ Ledger updated');

  // Summary
  const totalEntries = existingLedger.length + 1;
  console.log('\n✅ Ledger Update Complete');
  console.log('═'.repeat(80));
  console.log(`   Entry ID:     ${entry.id}`);
  console.log(`   EII Score:    ${entry.eii}`);
  console.log(`   Merkle Root:  ${merkleRoot.substring(0, 32)}...`);
  console.log(`   Signed:       ${entry.signature ? 'Yes' : 'No'}`);
  console.log(`   Total Entries: ${totalEntries}`);
  console.log('═'.repeat(80));
  console.log('');
}

// Execute
try {
  updateLedger();
} catch (error) {
  console.error('❌ Ledger update failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}

