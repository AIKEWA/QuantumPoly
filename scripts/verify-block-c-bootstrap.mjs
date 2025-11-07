#!/usr/bin/env node

/**
 * Block C Bootstrap Verification Script
 * 
 * Verifies that all Block C autonomous operations components are properly configured
 * and ready for Day 0 bootstrap activation.
 * 
 * Usage:
 *   node scripts/verify-block-c-bootstrap.mjs
 *   npm run verify:block-c
 * 
 * Exit Codes:
 *   0 - All checks passed, ready for bootstrap
 *   1 - Some checks failed, review output
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

let checksPassed = 0;
let checksFailed = 0;

/**
 * Print section header
 */
function section(title) {
  console.log(`\n${colors.bold}${colors.blue}${title}${colors.reset}`);
  console.log('='.repeat(80));
}

/**
 * Print success message
 */
function success(message) {
  console.log(`${colors.green}✅${colors.reset} ${message}`);
  checksPassed++;
}

/**
 * Print failure message
 */
function fail(message) {
  console.log(`${colors.red}❌${colors.reset} ${message}`);
  checksFailed++;
}

/**
 * Print warning message
 */
function warn(message) {
  console.log(`${colors.yellow}⚠️${colors.reset}  ${message}`);
}

/**
 * Check if file exists
 */
function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    success(`${description}: ${filePath}`);
    return true;
  } else {
    fail(`${description} not found: ${filePath}`);
    return false;
  }
}

/**
 * Check workflow file and validate structure
 */
function checkWorkflow(filename, expectedCron) {
  const filePath = path.join('.github/workflows', filename);
  
  if (!fs.existsSync(filePath)) {
    fail(`Workflow not found: ${filename}`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check for required components
  const hasSchedule = content.includes('schedule:');
  const hasWorkflowDispatch = content.includes('workflow_dispatch');
  const hasNodeVersion = content.includes('20.17.25');
  const hasArtifactUpload = content.includes('actions/upload-artifact');
  const hasCron = content.includes(expectedCron);
  
  if (hasSchedule && hasWorkflowDispatch && hasNodeVersion && hasArtifactUpload && hasCron) {
    success(`${filename}: Complete (cron: ${expectedCron}, Node 20.17.25)`);
    return true;
  } else {
    fail(`${filename}: Missing components`);
    if (!hasSchedule) warn('  Missing schedule trigger');
    if (!hasWorkflowDispatch) warn('  Missing workflow_dispatch');
    if (!hasNodeVersion) warn('  Missing Node 20.17.25');
    if (!hasArtifactUpload) warn('  Missing artifact upload');
    if (!hasCron) warn(`  Missing cron: ${expectedCron}`);
    return false;
  }
}

/**
 * Validate JSON file structure
 */
function validateJSON(filePath, requiredKeys) {
  if (!fs.existsSync(filePath)) {
    fail(`JSON file not found: ${filePath}`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    const missingKeys = requiredKeys.filter(key => !(key in data));
    
    if (missingKeys.length === 0) {
      success(`${path.basename(filePath)}: Valid (${requiredKeys.join(', ')})`);
      return true;
    } else {
      fail(`${path.basename(filePath)}: Missing keys: ${missingKeys.join(', ')}`);
      return false;
    }
  } catch (error) {
    fail(`${path.basename(filePath)}: Invalid JSON - ${error.message}`);
    return false;
  }
}

/**
 * Main verification
 */
function main() {
  console.log(`\n${colors.bold}Block C Bootstrap Verification${colors.reset}`);
  console.log(`${colors.bold}Autonomous Operations Readiness Check${colors.reset}\n`);
  
  // Check workflows directory
  section('1. GitHub Actions Workflows');
  checkFile('.github/workflows', 'Workflows directory');
  
  // Check individual workflows
  checkWorkflow('daily-governance-report.yml', '0 0 * * *');
  checkWorkflow('autonomous-monitoring.yml', '0 0 * * *');
  checkWorkflow('integrity-verification.yml', '0 0 * * *');
  checkWorkflow('ewa-postlaunch.yml', '0 2 * * *');
  checkWorkflow('governance.yml', '0 0 * * 0');
  
  // Check trust trend baseline
  section('2. Trust Trend Baseline');
  validateJSON(
    'governance/feedback/aggregates/trust-trend.json',
    ['trust_score', 'consent_score', 'engagement_index', 'timestamp']
  );
  
  // Check documentation
  section('3. Documentation');
  checkFile('docs/governance/BLOCK_C_AUTONOMOUS_OPS.md', 'Operations documentation');
  checkFile('BLOCK_C_IMPLEMENTATION_SUMMARY.md', 'Implementation summary');
  
  // Check required directories
  section('4. Directory Structure');
  checkFile('reports', 'Reports directory');
  checkFile('reports/monitoring', 'Monitoring reports directory');
  checkFile('governance/feedback/aggregates', 'Aggregates directory');
  checkFile('governance/integrity/reports', 'Integrity reports directory');
  
  // Check npm scripts
  section('5. NPM Scripts');
  const packageJsonPath = 'package.json';
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const scripts = packageJson.scripts || {};
    
    const requiredScripts = [
      'report:daily',
      'monitor',
      'integrity:verify',
      'postlaunch:monitor',
      'report:weekly',
      'feedback:aggregate-trust',
    ];
    
    requiredScripts.forEach(script => {
      if (scripts[script]) {
        success(`Script defined: ${script}`);
      } else {
        fail(`Script missing: ${script}`);
      }
    });
  } else {
    fail('package.json not found');
  }
  
  // Summary
  section('Summary');
  console.log('');
  console.log(`Total checks: ${checksPassed + checksFailed}`);
  console.log(`${colors.green}Passed: ${checksPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${checksFailed}${colors.reset}`);
  console.log('');
  
  if (checksFailed === 0) {
    console.log(`${colors.bold}${colors.green}✅ Block C is ready for Day 0 bootstrap!${colors.reset}\n`);
    console.log('Next steps:');
    console.log('  1. Verify GitHub CLI: gh auth status');
    console.log('  2. List workflows: gh workflow list');
    console.log('  3. Manual trigger: gh workflow run daily-governance-report.yml');
    console.log('  4. Check status: gh run list --workflow=daily-governance-report.yml --limit 1');
    console.log('  5. Download artifacts: gh run download <run-id>');
    console.log('\nSee docs/governance/BLOCK_C_AUTONOMOUS_OPS.md for detailed procedures.\n');
    process.exit(0);
  } else {
    console.log(`${colors.bold}${colors.red}❌ Some checks failed. Review output above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run verification
main();

