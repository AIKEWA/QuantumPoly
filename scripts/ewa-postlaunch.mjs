#!/usr/bin/env node
/**
 * @fileoverview Block 10.1 — Post-Launch Monitoring Script
 * @see BLOCK10.1_POSTLAUNCH_FEEDBACK.md
 *
 * Daily monitoring of technical integrity, accessibility, and governance continuity
 * Usage: node scripts/ewa-postlaunch.mjs [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Configuration
const baseURL = process.env.MONITOR_BASE_URL || 'https://quantumpoly.ai';
const checkLedger = process.env.CHECK_LEDGER === 'true';
const timeout = 10000; // 10 seconds

console.log('🔍 Block 10.1 — Post-Launch Monitoring');
console.log('======================================\n');
console.log(`Base URL: ${baseURL}`);
console.log(`Dry Run: ${dryRun}`);
console.log(`Ledger Check: ${checkLedger}`);
console.log(`Timestamp: ${new Date().toISOString()}\n`);

/**
 * Future-proof notification hook
 * Currently: console logging
 * Future (Block 10.2/10.3): webhook/email integration
 */
async function notifyGovernance(message, severity = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = severity === 'warning' ? '⚠️' : severity === 'error' ? '❌' : 'ℹ️';
  console.log(`${prefix} [EWA Governance] ${timestamp} — ${message}`);
  
  // Future integration point:
  // if (process.env.GOVERNANCE_WEBHOOK_URL) {
  //   await fetch(process.env.GOVERNANCE_WEBHOOK_URL, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ timestamp, message, severity })
  //   });
  // }
}

/**
 * Check endpoint availability and response time
 */
async function checkEndpoint(endpoint) {
  const url = `${baseURL}${endpoint}`;
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'QuantumPoly-PostLaunch-Monitor/1.0',
      },
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    return {
      endpoint,
      url,
      status: response.status,
      statusText: response.statusText,
      responseTime,
      ok: response.ok,
      timestamp: new Date().toISOString(),
      headers: {
        'content-type': response.headers.get('content-type'),
        'x-vercel-id': response.headers.get('x-vercel-id'),
      },
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      endpoint,
      url,
      status: 0,
      statusText: error.name === 'AbortError' ? 'Timeout' : error.message,
      responseTime,
      ok: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Check TLS certificate validity (basic check)
 */
async function checkTLS() {
  try {
    const url = new URL(baseURL);
    if (url.protocol !== 'https:') {
      return { valid: false, reason: 'Not HTTPS' };
    }
    
    // Basic HTTPS connectivity check
    const response = await fetch(baseURL, { method: 'HEAD' });
    return {
      valid: true,
      protocol: 'https',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      valid: false,
      reason: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Optional: Verify ledger integrity
 * (Modular hook for future Block 10.3 integration)
 */
async function verifyLedgerIntegrity() {
  try {
    const ledgerPath = path.join(projectRoot, 'governance/ledger/ledger.jsonl');
    
    if (!fs.existsSync(ledgerPath)) {
      return { valid: false, reason: 'Ledger file not found' };
    }
    
    const stats = fs.statSync(ledgerPath);
    const content = fs.readFileSync(ledgerPath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    return {
      valid: true,
      entries: lines.length,
      lastModified: stats.mtime.toISOString(),
      size: stats.size,
    };
  } catch (error) {
    return {
      valid: false,
      reason: error.message,
    };
  }
}

/**
 * Calculate overall system status
 */
function calculateOverallStatus(checks) {
  const endpointResults = checks.endpoints;
  const tlsResult = checks.tls;
  const ledgerResult = checks.ledger;
  
  // Critical: All core endpoints must be accessible
  const criticalEndpoints = ['/', '/api/status'];
  const criticalFailed = endpointResults
    .filter(e => criticalEndpoints.includes(e.endpoint))
    .filter(e => !e.ok);
  
  if (criticalFailed.length > 0) {
    return 'degraded';
  }
  
  // TLS must be valid
  if (!tlsResult.valid) {
    return 'degraded';
  }
  
  // Warning: Non-critical endpoints down or slow response
  const anyFailed = endpointResults.filter(e => !e.ok);
  const anySlow = endpointResults.filter(e => e.ok && e.responseTime > 5000);
  
  if (anyFailed.length > 0 || anySlow.length > 0) {
    return 'warning';
  }
  
  // Optional ledger check
  if (checkLedger && ledgerResult && !ledgerResult.valid) {
    return 'warning';
  }
  
  return 'valid';
}

/**
 * Generate daily monitoring report
 */
async function generateReport() {
  const timestamp = new Date().toISOString();
  const date = timestamp.split('T')[0];
  
  console.log('🔍 Running endpoint checks...\n');
  
  // Define endpoints to monitor
  const endpoints = [
    '/',
    '/accessibility-statement.html',
    '/governance/review',
    '/api/status',
  ];
  
  // Run checks in parallel
  const endpointChecks = await Promise.all(
    endpoints.map(endpoint => checkEndpoint(endpoint))
  );
  
  // Display results
  endpointChecks.forEach(check => {
    const status = check.ok ? '✅' : '❌';
    const time = check.responseTime ? `${check.responseTime}ms` : 'N/A';
    console.log(`${status} ${check.endpoint} — ${check.status} (${time})`);
  });
  
  console.log('\n🔒 Checking TLS/SSL...\n');
  const tlsCheck = await checkTLS();
  console.log(tlsCheck.valid ? '✅ TLS Valid' : `❌ TLS Invalid: ${tlsCheck.reason}`);
  
  // Optional ledger check
  let ledgerCheck = null;
  if (checkLedger) {
    console.log('\n📖 Verifying ledger integrity...\n');
    ledgerCheck = await verifyLedgerIntegrity();
    console.log(
      ledgerCheck.valid
        ? `✅ Ledger Valid (${ledgerCheck.entries} entries)`
        : `❌ Ledger Issue: ${ledgerCheck.reason}`
    );
  }
  
  // Calculate overall status
  const overallStatus = calculateOverallStatus({
    endpoints: endpointChecks,
    tls: tlsCheck,
    ledger: ledgerCheck,
  });
  
  console.log(`\n📊 Overall Status: ${overallStatus.toUpperCase()}\n`);
  
  // Prepare report
  const report = {
    report_id: `postlaunch-${date}`,
    block_id: '10.1',
    timestamp,
    date,
    base_url: baseURL,
    overall_status: overallStatus,
    checks: {
      endpoints: endpointChecks,
      tls: tlsCheck,
      ledger: ledgerCheck,
    },
    summary: {
      total_endpoints: endpointChecks.length,
      successful_endpoints: endpointChecks.filter(e => e.ok).length,
      failed_endpoints: endpointChecks.filter(e => !e.ok).length,
      avg_response_time: Math.round(
        endpointChecks
          .filter(e => e.ok)
          .reduce((sum, e) => sum + e.responseTime, 0) /
          endpointChecks.filter(e => e.ok).length
      ),
      max_response_time: Math.max(
        ...endpointChecks.filter(e => e.ok).map(e => e.responseTime)
      ),
    },
    metadata: {
      script_version: '1.0.0',
      node_version: process.version,
      dry_run: dryRun,
      check_ledger: checkLedger,
    },
  };
  
  // Notify if status is not valid
  if (overallStatus !== 'valid') {
    await notifyGovernance(
      `Post-launch status is ${overallStatus.toUpperCase()}. Failed endpoints: ${report.summary.failed_endpoints}. Review required.`,
      'warning'
    );
  }
  
  return report;
}

/**
 * Save report to file
 */
function saveReport(report) {
  const reportsDir = path.join(projectRoot, 'reports');
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportPath = path.join(reportsDir, `postlaunch-status-${report.date}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  
  console.log(`📄 Report saved: ${reportPath}\n`);
  return reportPath;
}

/**
 * Append monitoring entry to governance ledger
 */
function appendToLedger(report) {
  const ledgerPath = path.join(projectRoot, 'governance/ledger/ledger.jsonl');
  
  const entry = {
    entry_id: `postlaunch-monitoring-${report.date}`,
    ledger_entry_type: 'postlaunch_monitoring',
    block_id: '10.1',
    title: 'Post-Launch Daily Monitoring',
    status: 'verified',
    approved_date: report.date,
    responsible_roles: ['Post-Launch Monitor', 'Governance Officer'],
    monitoring_result: {
      overall_status: report.overall_status,
      successful_endpoints: report.summary.successful_endpoints,
      failed_endpoints: report.summary.failed_endpoints,
      avg_response_time: report.summary.avg_response_time,
      tls_valid: report.checks.tls.valid,
    },
    summary: `Daily post-launch monitoring completed. Status: ${report.overall_status}. ${report.summary.successful_endpoints}/${report.summary.total_endpoints} endpoints operational.`,
    report_reference: `reports/postlaunch-status-${report.date}.json`,
    next_review: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next day
    hash: '',
    merkleRoot: '',
    signature: null,
  };
  
  // Compute hash
  const hashData = JSON.stringify({
    ...entry,
    hash: undefined,
    merkleRoot: undefined,
    signature: undefined,
  });
  entry.hash = crypto.createHash('sha256').update(hashData).digest('hex');
  
  // Compute Merkle root (simplified)
  entry.merkleRoot = crypto.createHash('sha256').update(entry.hash).digest('hex');
  
  fs.appendFileSync(ledgerPath, JSON.stringify(entry) + '\n', 'utf-8');
  console.log(`✅ Ledger entry created: ${entry.entry_id}\n`);
}

/**
 * Main execution
 */
async function main() {
  try {
    // Generate monitoring report
    const report = await generateReport();
    
    if (dryRun) {
      console.log('🏃 Dry run mode — no files written\n');
      console.log('Report Preview:');
      console.log(JSON.stringify(report, null, 2));
      return;
    }
    
    // Save report
    saveReport(report);
    
    // Append to ledger
    appendToLedger(report);
    
    console.log('✅ Post-launch monitoring complete\n');
    
    // Exit with appropriate code
    if (report.overall_status === 'degraded') {
      console.log('⚠️  System degraded — manual review required');
      process.exit(1);
    } else if (report.overall_status === 'warning') {
      console.log('⚠️  System warning — monitoring continues');
      process.exit(0);
    } else {
      console.log('✅ All systems operational');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Monitoring failed:', error);
    
    // Even on error, try to generate a minimal report
    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0];
    
    const errorReport = {
      report_id: `postlaunch-${date}-error`,
      block_id: '10.1',
      timestamp,
      date,
      overall_status: 'degraded',
      error: error.message,
      stack: error.stack,
    };
    
    try {
      const reportsDir = path.join(projectRoot, 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      const reportPath = path.join(reportsDir, `postlaunch-status-${date}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(errorReport, null, 2), 'utf-8');
      console.log(`📄 Error report saved: ${reportPath}\n`);
    } catch (saveError) {
      console.error('❌ Failed to save error report:', saveError);
    }
    
    await notifyGovernance(`Monitoring script failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run monitoring
main();

