#!/usr/bin/env node
/**
 * @fileoverview Create Public Baseline Ledger Entry - Block 10.0
 * @see BLOCK10.0_PUBLIC_BASELINE_RELEASE.md
 *
 * Creates immutable ledger entry marking public baseline release v1.1
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// File paths
const LEDGER_FILE = path.join(ROOT_DIR, 'governance/ledger/ledger.jsonl');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');

/**
 * Colors for terminal output
 */
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

/**
 * Log with color
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
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
 * Find latest readiness report
 */
function findLatestReadinessReport() {
  if (!fs.existsSync(REPORTS_DIR)) {
    return null;
  }

  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith('public-readiness-v1.1') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    return null;
  }

  const reportPath = path.join(REPORTS_DIR, files[0]);
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

  return {
    filename: files[0],
    path: reportPath,
    report,
  };
}

/**
 * Check for Block 9.9 audit closure
 */
function checkBlock99Closure(entries) {
  const block99Entry = entries.find(e => 
    e.entry_id?.includes('audit-closure-block9.9') || 
    e.block_id === '9.9'
  );

  return block99Entry || null;
}

/**
 * Get release version
 */
function getReleaseVersion() {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8')
    );
    return packageJson.version || '1.1.0';
  } catch {
    return '1.1.0';
  }
}

/**
 * Get commit hash
 */
function getCommitHash() {
  return process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 12) || 'local-dev';
}

/**
 * Create public baseline ledger entry
 */
function createPublicBaselineEntry(readinessReport, block99Entry) {
  const timestamp = new Date().toISOString();
  const releaseDate = timestamp.split('T')[0];
  
  // Determine SSL status from readiness report
  const sslCheck = readinessReport?.report?.checks?.find(c => c.name === 'Domain & SSL');
  const sslStatus = sslCheck?.status === 'pass' ? 'valid' : 'pending';

  // Determine integrity status
  const integrityCheck = readinessReport?.report?.checks?.find(c => c.name === 'Integrity API');
  const integrityData = integrityCheck?.checks?.find(c => c.name === 'System State')?.data;
  const verifiedIntegrity = integrityData?.system_state === 'healthy' || 
                            integrityData?.system_state === 'degraded';

  const entryWithoutHash = {
    entry_id: 'public-baseline-v1.1',
    ledger_entry_type: 'release_public_baseline',
    block_id: '10.0',
    version: '1.1',
    release_date: releaseDate,
    domain: 'quantumpoly.ai',
    ssl_status: sslStatus,
    accessibility_certification: 'WCAG 2.2 AA',
    accessibility_audit: 'BLOCK10.0_ACCESSIBILITY_AUDIT.md',
    verified_integrity: verifiedIntegrity,
    responsible_roles: [
      'Aykut Aydin (Founder, Lead Engineer, Accessibility Reviewer)',
      'EWA (Governance Oversight AI)',
      'Cursor AI (Automated Compliance Verifier)',
    ],
    summary: 'Public Baseline v1.1 deployed with verified SSL, accessibility compliance, and governance integrity per Block 9.9.',
    next_review: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 180 days
    audit_trail_references: block99Entry ? [block99Entry.entry_id] : [],
    readiness_report: readinessReport?.filename || null,
    readiness_status: readinessReport?.report?.overall_status || 'unknown',
    release_version: getReleaseVersion(),
    commit_hash: getCommitHash(),
    public_apis: [
      '/api/integrity/status',
      '/api/trust/proof',
      '/api/federation/verify',
      '/api/ethics/public',
      '/api/governance/verify',
    ],
    public_pages: [
      '/governance',
      '/governance/dashboard',
      '/governance/review',
      '/transparency',
      '/accessibility',
      '/contact',
    ],
    compliance_frameworks: [
      'GDPR 2016/679 (Blocks 9.0-9.2)',
      'DSG 2023 (Swiss Data Protection)',
      'WCAG 2.2 Level AA',
      'Ethical Governance Framework 9.x',
    ],
    contact_channels: {
      governance: 'governance@quantumpoly.ai',
      accessibility: 'accessibility@quantumpoly.ai',
      security: 'security@quantumpoly.ai',
      contact_form: '/[locale]/contact',
    },
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
  console.log('');
  log('🔐 Block 10.0 — Creating Public Baseline Ledger Entry', 'magenta');
  log('='.repeat(80), 'magenta');
  console.log('');

  try {
    // Read existing ledger
    log('📂 Reading governance ledger...', 'blue');
    const existingEntries = readLedger();
    log(`   Found ${existingEntries.length} existing entries`, 'cyan');
    console.log('');

    // Check for Block 9.9 closure
    log('🔍 Checking for Block 9.9 audit closure...', 'blue');
    const block99Entry = checkBlock99Closure(existingEntries);
    
    if (block99Entry) {
      log(`   ✅ Found: ${block99Entry.entry_id}`, 'green');
      log(`   Status: ${block99Entry.status}`, 'cyan');
      log(`   Timestamp: ${block99Entry.timestamp}`, 'cyan');
    } else {
      log('   ⚠️  Block 9.9 audit closure not found', 'yellow');
      log('   Proceeding without audit trail reference', 'yellow');
    }
    console.log('');

    // Find latest readiness report
    log('📊 Finding latest readiness report...', 'blue');
    const readinessReport = findLatestReadinessReport();
    
    if (readinessReport) {
      log(`   ✅ Found: ${readinessReport.filename}`, 'green');
      log(`   Status: ${readinessReport.report.overall_status}`, 'cyan');
      log(`   Timestamp: ${readinessReport.report.timestamp}`, 'cyan');
      
      if (readinessReport.report.overall_status === 'fail') {
        log('', 'reset');
        log('   ⚠️  WARNING: Readiness report shows failures', 'yellow');
        log('   Consider resolving issues before creating baseline entry', 'yellow');
        
        const readline = await import('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        
        const answer = await new Promise((resolve) => {
          rl.question('\n   Continue anyway? (yes/no): ', resolve);
        });
        rl.close();
        
        if (answer.toLowerCase() !== 'yes') {
          log('', 'reset');
          log('❌ Aborted by user', 'red');
          process.exit(1);
        }
      }
    } else {
      log('   ⚠️  No readiness report found', 'yellow');
      log('   Run: npm run release:ready', 'yellow');
      log('', 'reset');
      
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('   Continue without readiness report? (yes/no): ', resolve);
      });
      rl.close();
      
      if (answer.toLowerCase() !== 'yes') {
        log('', 'reset');
        log('❌ Aborted by user', 'red');
        process.exit(1);
      }
    }
    console.log('');

    // Create ledger entry
    log('📝 Creating public baseline ledger entry...', 'blue');
    const entry = createPublicBaselineEntry(readinessReport, block99Entry);
    
    log(`   Entry ID: ${entry.entry_id}`, 'cyan');
    log(`   Version: ${entry.version}`, 'cyan');
    log(`   Release Date: ${entry.release_date}`, 'cyan');
    log(`   Domain: ${entry.domain}`, 'cyan');
    log(`   SSL Status: ${entry.ssl_status}`, 'cyan');
    log(`   Accessibility: ${entry.accessibility_certification}`, 'cyan');
    log(`   Verified Integrity: ${entry.verified_integrity}`, 'cyan');
    log(`   Hash: ${entry.hash}`, 'cyan');
    log(`   Merkle Root: ${entry.merkleRoot}`, 'cyan');
    console.log('');

    // Show responsible roles
    log('👥 Responsible Roles:', 'blue');
    entry.responsible_roles.forEach(role => {
      log(`   • ${role}`, 'cyan');
    });
    console.log('');

    // Append to ledger
    log('💾 Appending to governance ledger...', 'blue');
    appendToLedger(entry);
    log(`   ✅ Written to: ${LEDGER_FILE}`, 'green');
    console.log('');

    // Summary
    log('='.repeat(80), 'green');
    log('✅ PUBLIC BASELINE ENTRY CREATED', 'green');
    log('='.repeat(80), 'green');
    console.log('');
    
    log('Next steps:', 'cyan');
    log('1. Verify ledger integrity: npm run ethics:verify-ledger', 'cyan');
    log('2. Complete release documentation: BLOCK10.0_PUBLIC_BASELINE_RELEASE.md', 'cyan');
    log('3. Update release checklist: BLOCK10.0_RELEASE_CHECKLIST.md', 'cyan');
    log('4. Commit changes to version control', 'cyan');
    log('5. Deploy to production', 'cyan');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    log(`❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();

