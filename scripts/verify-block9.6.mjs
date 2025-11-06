#!/usr/bin/env node

/**
 * @fileoverview Block 9.6 Verification Script
 * @see BLOCK9.6_COLLECTIVE_ETHICS_GRAPH.md
 *
 * Validates that all Block 9.6 components are properly implemented.
 *
 * Usage:
 *   node scripts/verify-block9.6.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('\n🔍 Block 9.6 — Collective Ethics Graph Verification');
console.log('='.repeat(80));

let errors = [];
let warnings = [];
let successes = [];

/**
 * Check if file exists
 */
function checkFile(filePath, description) {
  const fullPath = path.join(projectRoot, filePath);
  if (fs.existsSync(fullPath)) {
    successes.push(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    errors.push(`❌ ${description} not found: ${filePath}`);
    return false;
  }
}

/**
 * Check if directory exists
 */
function checkDirectory(dirPath, description) {
  const fullPath = path.join(projectRoot, dirPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    successes.push(`✅ ${description}: ${dirPath}`);
    return true;
  } else {
    errors.push(`❌ ${description} not found: ${dirPath}`);
    return false;
  }
}

/**
 * Check if JSON file is valid
 */
function checkJsonFile(filePath, description) {
  const fullPath = path.join(projectRoot, filePath);
  if (!fs.existsSync(fullPath)) {
    errors.push(`❌ ${description} not found: ${filePath}`);
    return false;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    JSON.parse(content);
    successes.push(`✅ ${description} is valid JSON: ${filePath}`);
    return true;
  } catch (error) {
    errors.push(`❌ ${description} is invalid JSON: ${filePath} - ${error.message}`);
    return false;
  }
}

/**
 * Check if JSONL file is valid
 */
function checkJsonlFile(filePath, description) {
  const fullPath = path.join(projectRoot, filePath);
  if (!fs.existsSync(fullPath)) {
    errors.push(`❌ ${description} not found: ${filePath}`);
    return false;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.trim().split('\n').filter((line) => line.trim());

    if (lines.length === 0) {
      warnings.push(`⚠️  ${description} is empty: ${filePath}`);
      return true;
    }

    lines.forEach((line, index) => {
      try {
        JSON.parse(line);
      } catch (error) {
        throw new Error(`Line ${index + 1}: ${error.message}`);
      }
    });

    successes.push(`✅ ${description} is valid JSONL (${lines.length} entries): ${filePath}`);
    return true;
  } catch (error) {
    errors.push(`❌ ${description} is invalid JSONL: ${filePath} - ${error.message}`);
    return false;
  }
}

/**
 * Check if package.json has required scripts
 */
function checkPackageScripts() {
  const packagePath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(packagePath)) {
    errors.push('❌ package.json not found');
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    const requiredScripts = [
      'federation:verify',
      'federation:verify:dry-run',
      'federation:status',
    ];

    let allFound = true;
    requiredScripts.forEach((script) => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        successes.push(`✅ NPM script exists: ${script}`);
      } else {
        errors.push(`❌ NPM script missing: ${script}`);
        allFound = false;
      }
    });

    return allFound;
  } catch (error) {
    errors.push(`❌ Failed to parse package.json: ${error.message}`);
    return false;
  }
}

/**
 * Check if governance ledger has Block 9.6 entry
 */
function checkGovernanceLedger() {
  const ledgerPath = path.join(projectRoot, 'governance', 'ledger', 'ledger.jsonl');
  if (!fs.existsSync(ledgerPath)) {
    errors.push('❌ Governance ledger not found');
    return false;
  }

  try {
    const content = fs.readFileSync(ledgerPath, 'utf-8');
    const lines = content.trim().split('\n').filter((line) => line.trim());

    const block96Entry = lines.find((line) => {
      try {
        const entry = JSON.parse(line);
        return entry.id === 'collective-ethics-graph-block9.6' || entry.blockId === '9.6';
      } catch {
        return false;
      }
    });

    if (block96Entry) {
      successes.push('✅ Block 9.6 entry found in governance ledger');
      return true;
    } else {
      errors.push('❌ Block 9.6 entry not found in governance ledger');
      return false;
    }
  } catch (error) {
    errors.push(`❌ Failed to check governance ledger: ${error.message}`);
    return false;
  }
}

/**
 * Check if federation partners config is valid
 */
function checkFederationPartners() {
  const configPath = path.join(projectRoot, 'config', 'federation-partners.json');
  if (!fs.existsSync(configPath)) {
    errors.push('❌ Federation partners config not found');
    return false;
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    if (!config.partners || !Array.isArray(config.partners)) {
      errors.push('❌ Federation partners config missing "partners" array');
      return false;
    }

    if (config.partners.length === 0) {
      warnings.push('⚠️  No partners configured');
      return true;
    }

    // Check each partner
    config.partners.forEach((partner, index) => {
      const requiredFields = [
        'partner_id',
        'partner_display_name',
        'governance_endpoint',
        'active',
        'added_at',
      ];

      requiredFields.forEach((field) => {
        if (!partner[field] && partner[field] !== false) {
          errors.push(`❌ Partner ${index + 1} missing required field: ${field}`);
        }
      });
    });

    successes.push(`✅ Federation partners config valid (${config.partners.length} partners)`);
    return true;
  } catch (error) {
    errors.push(`❌ Failed to parse federation partners config: ${error.message}`);
    return false;
  }
}

/**
 * Main verification
 */
function main() {
  console.log('\n📂 Checking Core Infrastructure...\n');

  // Type definitions and schemas
  checkFile('src/lib/federation/types.ts', 'Federation types');
  checkFile('src/lib/federation/partner-manager.ts', 'Partner manager');
  checkFile('src/lib/federation/verification.ts', 'Verification engine');
  checkFile('src/lib/federation/trust-calculator.ts', 'Trust calculator');
  checkJsonFile('schemas/federation-record.schema.json', 'FederationRecord schema');

  console.log('\n🌐 Checking Federation APIs...\n');

  // API endpoints
  checkFile('src/app/api/federation/verify/route.ts', 'Verification API');
  checkFile('src/app/api/federation/trust/route.ts', 'Trust API');
  checkFile('src/app/api/federation/record/route.ts', 'Record API');
  checkFile('src/app/api/federation/register/route.ts', 'Registration API');
  checkFile('src/app/api/federation/notify/route.ts', 'Webhook API');

  console.log('\n💾 Checking Storage & Ledger...\n');

  // Storage directories
  checkDirectory('governance/federation', 'Federation directory');
  checkDirectory('governance/federation/trust-reports', 'Trust reports directory');
  checkJsonlFile('governance/federation/ledger.jsonl', 'Federation ledger');
  checkFile('governance/federation/README.md', 'Federation README');

  // Partner configuration
  checkJsonFile('config/federation-partners.json', 'Partner configuration');
  checkFederationPartners();

  // Governance ledger
  checkGovernanceLedger();

  console.log('\n🤖 Checking Automation...\n');

  // Scripts
  checkFile('scripts/verify-federation.mjs', 'Verification script');
  checkFile('scripts/federation-status.mjs', 'Status script');
  checkFile('.github/workflows/federation-verification.yml', 'GitHub Actions workflow');

  // Package scripts
  checkPackageScripts();

  console.log('\n📚 Checking Documentation...\n');

  // Documentation
  checkFile('BLOCK9.6_COLLECTIVE_ETHICS_GRAPH.md', 'Main documentation');
  checkFile('docs/federation/FEDERATION_README.md', 'Developer guide');
  checkFile('BLOCK9.6_IMPLEMENTATION_SUMMARY.md', 'Implementation summary');

  console.log('\n🧪 Checking Tests...\n');

  // Tests
  checkFile('e2e/federation.spec.ts', 'E2E tests');

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 Verification Summary');
  console.log('='.repeat(80));

  console.log(`\n✅ Successes: ${successes.length}`);
  if (successes.length > 0 && process.argv.includes('--verbose')) {
    successes.forEach((success) => console.log(`   ${success}`));
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings: ${warnings.length}`);
    warnings.forEach((warning) => console.log(`   ${warning}`));
  }

  if (errors.length > 0) {
    console.log(`\n❌ Errors: ${errors.length}`);
    errors.forEach((error) => console.log(`   ${error}`));
    console.log('\n❌ Block 9.6 verification FAILED\n');
    process.exit(1);
  }

  console.log('\n✅ Block 9.6 verification PASSED\n');
  process.exit(0);
}

main();

