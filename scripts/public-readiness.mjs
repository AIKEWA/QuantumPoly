#!/usr/bin/env node
/**
 * @fileoverview Public Readiness Verification Script - Block 10.0
 * @see BLOCK10.0_PUBLIC_BASELINE_RELEASE.md
 *
 * Comprehensive readiness check for public baseline release v1.1
 * Verifies domain, SSL, APIs, accessibility, and ledger continuity
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const PRODUCTION_DOMAIN = 'https://quantumpoly.ai';
const TIMEOUT = 15000; // 15 seconds
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');
const LEDGER_FILE = path.join(ROOT_DIR, 'governance/ledger/ledger.jsonl');

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
 * Make HTTP/HTTPS request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      timeout: TIMEOUT,
      headers: options.headers || {},
      rejectUnauthorized: true,
    };

    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Check 1: Domain & SSL
 */
async function checkDomainSSL(targetUrl) {
  log('1️⃣  Checking Domain & SSL/TLS...', 'blue');
  
  const result = {
    name: 'Domain & SSL',
    status: 'pending',
    checks: [],
  };

  try {
    // Check HTTPS connectivity
    const response = await makeRequest(targetUrl);
    
    if (response.statusCode === 200) {
      result.checks.push({
        name: 'HTTPS Connectivity',
        status: 'pass',
        message: `HTTP ${response.statusCode} ${response.statusMessage}`,
      });
      log('   ✅ HTTPS connectivity verified', 'green');
    } else {
      result.checks.push({
        name: 'HTTPS Connectivity',
        status: 'warning',
        message: `Unexpected status code: ${response.statusCode}`,
      });
      log(`   ⚠️  Unexpected status code: ${response.statusCode}`, 'yellow');
    }

    // Check SSL (only for HTTPS)
    if (targetUrl.startsWith('https://')) {
      result.checks.push({
        name: 'SSL/TLS Certificate',
        status: 'pass',
        message: 'Certificate valid (connection successful)',
      });
      log('   ✅ SSL/TLS certificate valid', 'green');
    }

    result.status = result.checks.every(c => c.status === 'pass') ? 'pass' : 'warning';
  } catch (error) {
    result.status = 'fail';
    result.checks.push({
      name: 'Domain & SSL',
      status: 'fail',
      message: error.message,
    });
    log(`   ❌ Domain/SSL check failed: ${error.message}`, 'red');
  }

  console.log('');
  return result;
}

/**
 * Check 2: Integrity API
 */
async function checkIntegrityAPI(baseUrl) {
  log('2️⃣  Checking Integrity API...', 'blue');
  
  const result = {
    name: 'Integrity API',
    status: 'pending',
    checks: [],
  };

  try {
    const response = await makeRequest(`${baseUrl}/api/integrity/status`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      
      // Check system state
      const systemState = data.system_state;
      const isHealthy = systemState === 'healthy' || systemState === 'degraded';
      
      result.checks.push({
        name: 'API Accessibility',
        status: 'pass',
        message: 'Integrity API reachable',
      });
      log('   ✅ Integrity API reachable', 'green');

      result.checks.push({
        name: 'System State',
        status: isHealthy ? 'pass' : 'fail',
        message: `System state: ${systemState}`,
        data: {
          system_state: systemState,
          last_verification: data.last_verification,
          pending_reviews: data.pending_human_reviews,
        },
      });
      
      if (isHealthy) {
        log(`   ✅ System state: ${systemState}`, 'green');
      } else {
        log(`   ❌ System state: ${systemState} (attention required)`, 'red');
      }

      result.status = isHealthy ? 'pass' : 'fail';
    } else {
      result.status = 'fail';
      result.checks.push({
        name: 'API Accessibility',
        status: 'fail',
        message: `HTTP ${response.statusCode}`,
      });
      log(`   ❌ Integrity API returned ${response.statusCode}`, 'red');
    }
  } catch (error) {
    result.status = 'fail';
    result.checks.push({
      name: 'Integrity API',
      status: 'fail',
      message: error.message,
    });
    log(`   ❌ Integrity API check failed: ${error.message}`, 'red');
  }

  console.log('');
  return result;
}

/**
 * Check 3: Governance Dashboard
 */
async function checkGovernanceDashboard(baseUrl) {
  log('3️⃣  Checking Governance Dashboard...', 'blue');
  
  const result = {
    name: 'Governance Dashboard',
    status: 'pending',
    checks: [],
  };

  const pages = [
    { path: '/en/governance', name: 'Governance Overview' },
    { path: '/en/governance/dashboard', name: 'Transparency Dashboard' },
    { path: '/en/governance/review', name: 'Review Dashboard' },
  ];

  try {
    for (const page of pages) {
      try {
        const response = await makeRequest(`${baseUrl}${page.path}`);
        
        if (response.statusCode === 200) {
          result.checks.push({
            name: page.name,
            status: 'pass',
            message: 'Page accessible',
          });
          log(`   ✅ ${page.name} accessible`, 'green');
        } else {
          result.checks.push({
            name: page.name,
            status: 'fail',
            message: `HTTP ${response.statusCode}`,
          });
          log(`   ❌ ${page.name} returned ${response.statusCode}`, 'red');
        }
      } catch (error) {
        result.checks.push({
          name: page.name,
          status: 'fail',
          message: error.message,
        });
        log(`   ❌ ${page.name} failed: ${error.message}`, 'red');
      }
    }

    result.status = result.checks.every(c => c.status === 'pass') ? 'pass' : 'fail';
  } catch (error) {
    result.status = 'fail';
    log(`   ❌ Governance dashboard check failed: ${error.message}`, 'red');
  }

  console.log('');
  return result;
}

/**
 * Check 4: Accessibility Statement
 */
async function checkAccessibilityStatement(baseUrl) {
  log('4️⃣  Checking Accessibility Statement...', 'blue');
  
  const result = {
    name: 'Accessibility Statement',
    status: 'pending',
    checks: [],
  };

  try {
    // Check HTML file
    const htmlResponse = await makeRequest(`${baseUrl}/accessibility-statement.html`);
    
    if (htmlResponse.statusCode === 200) {
      result.checks.push({
        name: 'HTML Statement',
        status: 'pass',
        message: 'Static HTML accessible',
      });
      log('   ✅ HTML accessibility statement accessible', 'green');
    } else {
      result.checks.push({
        name: 'HTML Statement',
        status: 'fail',
        message: `HTTP ${htmlResponse.statusCode}`,
      });
      log(`   ❌ HTML statement returned ${htmlResponse.statusCode}`, 'red');
    }

    // Check Next.js page
    const pageResponse = await makeRequest(`${baseUrl}/en/accessibility`);
    
    if (pageResponse.statusCode === 200) {
      result.checks.push({
        name: 'Accessibility Page',
        status: 'pass',
        message: 'Next.js page accessible',
      });
      log('   ✅ Accessibility page accessible', 'green');
    } else {
      result.checks.push({
        name: 'Accessibility Page',
        status: 'warning',
        message: `HTTP ${pageResponse.statusCode}`,
      });
      log(`   ⚠️  Accessibility page returned ${pageResponse.statusCode}`, 'yellow');
    }

    result.status = result.checks.some(c => c.status === 'fail') ? 'fail' : 
                    result.checks.some(c => c.status === 'warning') ? 'warning' : 'pass';
  } catch (error) {
    result.status = 'fail';
    result.checks.push({
      name: 'Accessibility Statement',
      status: 'fail',
      message: error.message,
    });
    log(`   ❌ Accessibility statement check failed: ${error.message}`, 'red');
  }

  console.log('');
  return result;
}

/**
 * Check 5: Ledger Continuity
 */
async function checkLedgerContinuity() {
  log('5️⃣  Checking Ledger Continuity...', 'blue');
  
  const result = {
    name: 'Ledger Continuity',
    status: 'pending',
    checks: [],
  };

  try {
    if (!fs.existsSync(LEDGER_FILE)) {
      result.status = 'fail';
      result.checks.push({
        name: 'Ledger File',
        status: 'fail',
        message: 'Ledger file not found',
      });
      log('   ❌ Ledger file not found', 'red');
      console.log('');
      return result;
    }

    const content = fs.readFileSync(LEDGER_FILE, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    const entries = lines.map(line => JSON.parse(line));

    result.checks.push({
      name: 'Ledger File',
      status: 'pass',
      message: `Found ${entries.length} entries`,
    });
    log(`   ✅ Ledger file found (${entries.length} entries)`, 'green');

    // Check for Block 9.9 audit closure
    const block99Entry = entries.find(e => 
      e.entry_id?.includes('audit-closure-block9.9') || 
      e.block_id === '9.9'
    );

    if (block99Entry) {
      result.checks.push({
        name: 'Block 9.9 Entry',
        status: 'pass',
        message: `Found: ${block99Entry.entry_id}`,
        data: {
          entry_id: block99Entry.entry_id,
          timestamp: block99Entry.timestamp,
          status: block99Entry.status,
        },
      });
      log(`   ✅ Block 9.9 audit closure found`, 'green');
    } else {
      result.checks.push({
        name: 'Block 9.9 Entry',
        status: 'warning',
        message: 'Block 9.9 audit closure not found (may be pending)',
      });
      log('   ⚠️  Block 9.9 audit closure not found', 'yellow');
    }

    // Check for Block 9.8 integrity entry
    const block98Entry = entries.find(e => 
      e.entry_id?.includes('continuous-integrity-block9.8') ||
      e.block_id === '9.8'
    );

    if (block98Entry) {
      result.checks.push({
        name: 'Block 9.8 Entry',
        status: 'pass',
        message: 'Continuous integrity entry found',
      });
      log('   ✅ Block 9.8 continuous integrity found', 'green');
    } else {
      result.checks.push({
        name: 'Block 9.8 Entry',
        status: 'warning',
        message: 'Block 9.8 entry not found',
      });
      log('   ⚠️  Block 9.8 entry not found', 'yellow');
    }

    result.status = result.checks.some(c => c.status === 'fail') ? 'fail' : 
                    result.checks.some(c => c.status === 'warning') ? 'warning' : 'pass';
  } catch (error) {
    result.status = 'fail';
    result.checks.push({
      name: 'Ledger Continuity',
      status: 'fail',
      message: error.message,
    });
    log(`   ❌ Ledger continuity check failed: ${error.message}`, 'red');
  }

  console.log('');
  return result;
}

/**
 * Check 6: Public APIs
 */
async function checkPublicAPIs(baseUrl) {
  log('6️⃣  Checking Public APIs...', 'blue');
  
  const result = {
    name: 'Public APIs',
    status: 'pending',
    checks: [],
  };

  const apis = [
    { path: '/api/integrity/status', name: 'Integrity Status' },
    { path: '/api/trust/proof', name: 'Trust Proof', method: 'GET' },
    { path: '/api/ethics/public', name: 'Public Ethics' },
    { path: '/api/governance/verify', name: 'Governance Verification' },
  ];

  try {
    for (const api of apis) {
      try {
        const response = await makeRequest(`${baseUrl}${api.path}`, {
          method: api.method || 'GET',
        });
        
        if (response.statusCode === 200 || response.statusCode === 400) {
          // 400 is acceptable for APIs that require parameters
          result.checks.push({
            name: api.name,
            status: 'pass',
            message: `HTTP ${response.statusCode}`,
          });
          log(`   ✅ ${api.name} accessible`, 'green');
        } else {
          result.checks.push({
            name: api.name,
            status: 'warning',
            message: `HTTP ${response.statusCode}`,
          });
          log(`   ⚠️  ${api.name} returned ${response.statusCode}`, 'yellow');
        }
      } catch (error) {
        result.checks.push({
          name: api.name,
          status: 'fail',
          message: error.message,
        });
        log(`   ❌ ${api.name} failed: ${error.message}`, 'red');
      }
    }

    result.status = result.checks.some(c => c.status === 'fail') ? 'fail' : 
                    result.checks.some(c => c.status === 'warning') ? 'warning' : 'pass';
  } catch (error) {
    result.status = 'fail';
    log(`   ❌ Public APIs check failed: ${error.message}`, 'red');
  }

  console.log('');
  return result;
}

/**
 * Generate report
 */
function generateReport(results) {
  const timestamp = new Date().toISOString();
  const reportFilename = `public-readiness-v1.1-${timestamp.split('T')[0]}.json`;
  const reportPath = path.join(REPORTS_DIR, reportFilename);

  // Ensure reports directory exists
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const report = {
    version: '1.1',
    timestamp,
    target_url: BASE_URL,
    production_domain: PRODUCTION_DOMAIN,
    overall_status: results.every(r => r.status === 'pass') ? 'pass' : 
                    results.some(r => r.status === 'fail') ? 'fail' : 'warning',
    checks: results,
    summary: {
      total_checks: results.length,
      passed: results.filter(r => r.status === 'pass').length,
      warnings: results.filter(r => r.status === 'warning').length,
      failed: results.filter(r => r.status === 'fail').length,
    },
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  
  return { report, reportPath };
}

/**
 * Main execution
 */
async function main() {
  console.log('');
  log('🚀 Block 10.0 — Public Readiness Verification', 'magenta');
  log('='.repeat(80), 'magenta');
  console.log('');
  log(`Target URL: ${BASE_URL}`, 'cyan');
  log(`Production Domain: ${PRODUCTION_DOMAIN}`, 'cyan');
  console.log('');
  log('='.repeat(80), 'cyan');
  console.log('');

  const results = [];

  try {
    // Run all checks
    results.push(await checkDomainSSL(BASE_URL));
    results.push(await checkIntegrityAPI(BASE_URL));
    results.push(await checkGovernanceDashboard(BASE_URL));
    results.push(await checkAccessibilityStatement(BASE_URL));
    results.push(await checkLedgerContinuity());
    results.push(await checkPublicAPIs(BASE_URL));

    // Generate report
    log('='.repeat(80), 'cyan');
    log('📊 Generating Report...', 'blue');
    console.log('');

    const { report, reportPath } = generateReport(results);

    log(`✅ Report generated: ${reportPath}`, 'green');
    console.log('');

    // Summary
    log('='.repeat(80), 'magenta');
    log('📋 Readiness Summary', 'magenta');
    log('='.repeat(80), 'magenta');
    console.log('');

    const overallIcon = report.overall_status === 'pass' ? '✅' : 
                        report.overall_status === 'warning' ? '⚠️' : '❌';
    const overallColor = report.overall_status === 'pass' ? 'green' : 
                         report.overall_status === 'warning' ? 'yellow' : 'red';

    log(`${overallIcon} Overall Status: ${report.overall_status.toUpperCase()}`, overallColor);
    console.log('');
    log(`Total Checks: ${report.summary.total_checks}`, 'cyan');
    log(`✅ Passed: ${report.summary.passed}`, 'green');
    log(`⚠️  Warnings: ${report.summary.warnings}`, 'yellow');
    log(`❌ Failed: ${report.summary.failed}`, 'red');
    console.log('');

    // Detailed results
    log('Detailed Results:', 'cyan');
    for (const result of results) {
      const icon = result.status === 'pass' ? '✅' : 
                   result.status === 'warning' ? '⚠️' : '❌';
      const color = result.status === 'pass' ? 'green' : 
                    result.status === 'warning' ? 'yellow' : 'red';
      log(`  ${icon} ${result.name}: ${result.status}`, color);
    }
    console.log('');

    // Next steps
    if (report.overall_status === 'pass') {
      log('='.repeat(80), 'green');
      log('✅ READINESS VERIFICATION PASSED', 'green');
      log('='.repeat(80), 'green');
      console.log('');
      log('Next steps:', 'cyan');
      log('1. Review the generated report', 'cyan');
      log('2. Create ledger entry: npm run audit:finalize', 'cyan');
      log('3. Create public baseline entry', 'cyan');
      log('4. Complete release documentation', 'cyan');
      console.log('');
      process.exit(0);
    } else if (report.overall_status === 'warning') {
      log('='.repeat(80), 'yellow');
      log('⚠️  READINESS VERIFICATION PASSED WITH WARNINGS', 'yellow');
      log('='.repeat(80), 'yellow');
      console.log('');
      log('Review warnings before proceeding with release.', 'yellow');
      console.log('');
      process.exit(0);
    } else {
      log('='.repeat(80), 'red');
      log('❌ READINESS VERIFICATION FAILED', 'red');
      log('='.repeat(80), 'red');
      console.log('');
      log('Address failed checks before proceeding with release.', 'red');
      console.log('');
      process.exit(1);
    }

  } catch (error) {
    console.error('');
    log(`❌ Readiness verification failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();

