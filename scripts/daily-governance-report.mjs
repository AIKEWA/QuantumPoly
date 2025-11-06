#!/usr/bin/env node

/**
 * Daily Governance Report Generator
 * 
 * Unified daily report combining monitoring, integrity, feedback, and trust metrics.
 * 
 * Block 10.7 — Daily Governance Reports
 * 
 * Usage:
 *   node scripts/daily-governance-report.mjs [options]
 * 
 * Options:
 *   --date=<YYYY-MM-DD>   Report date (default: today)
 *   --output=<path>       Output file path (default: reports/monitoring-YYYY-MM-DD.json)
 *   --verbose             Detailed output
 * 
 * Exit Codes:
 *   0 - Report generated successfully
 *   1 - Report generated with warnings
 *   2 - Failed to generate report
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command-line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');

const dateArg = args.find(arg => arg.startsWith('--date='));
const reportDate = dateArg ? dateArg.split('=')[1] : new Date().toISOString().split('T')[0];

const outputArg = args.find(arg => arg.startsWith('--output='));
const outputPath = outputArg 
  ? outputArg.split('=')[1]
  : `reports/monitoring-${reportDate}.json`;

/**
 * Log message if verbose mode enabled
 */
function log(message) {
  if (verbose) {
    console.log(message);
  }
}

/**
 * Compute SHA-256 hash
 */
function sha256(data) {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Read JSONL ledger
 */
function readLedger(ledgerPath) {
  if (!fs.existsSync(ledgerPath)) {
    return [];
  }

  const content = fs.readFileSync(ledgerPath, 'utf8');
  const lines = content.trim().split('\n').filter(Boolean);
  
  return lines.map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      console.error(`Invalid JSON at line ${index + 1} in ${ledgerPath}`);
      return null;
    }
  }).filter(Boolean);
}

/**
 * Read JSON file safely
 */
function readJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log(`Warning: Failed to read ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Get latest file from directory matching pattern
 */
function getLatestFile(directory, pattern) {
  if (!fs.existsSync(directory)) {
    return null;
  }
  
  const files = fs.readdirSync(directory)
    .filter(f => pattern.test(f))
    .sort()
    .reverse();
  
  return files.length > 0 ? path.join(directory, files[0]) : null;
}

/**
 * Load monitoring data
 */
function loadMonitoringData(date) {
  const monitoringPath = `reports/monitoring/monitoring-${date}.json`;
  log(`Loading monitoring data from ${monitoringPath}...`);
  return readJSON(monitoringPath);
}

/**
 * Load integrity data
 */
function loadIntegrityData(date) {
  const integrityPath = `governance/integrity/reports/${date}.json`;
  log(`Loading integrity data from ${integrityPath}...`);
  return readJSON(integrityPath);
}

/**
 * Load feedback aggregates
 */
function loadFeedbackData() {
  log('Loading feedback aggregates...');
  const aggregatesDir = 'governance/feedback/aggregates';
  
  if (!fs.existsSync(aggregatesDir)) {
    return null;
  }
  
  // Get latest aggregate file
  const latestFile = getLatestFile(aggregatesDir, /\.json$/);
  if (!latestFile) {
    return null;
  }
  
  return readJSON(latestFile);
}

/**
 * Calculate EII 7-day rolling average
 */
function calculateEII7DayAverage(currentDate) {
  log('Calculating EII 7-day rolling average...');
  
  const ledger = readLedger('governance/ledger/ledger.jsonl');
  if (ledger.length === 0) {
    return null;
  }
  
  // Get last 7 entries with EII data
  const eiiEntries = ledger
    .filter(entry => entry.eii || entry.metrics?.eii)
    .slice(-7);
  
  if (eiiEntries.length === 0) {
    return null;
  }
  
  const eiiValues = eiiEntries.map(entry => entry.eii || entry.metrics?.eii).filter(Boolean);
  const currentEII = eiiValues[eiiValues.length - 1] || null;
  const avg = eiiValues.reduce((a, b) => a + b, 0) / eiiValues.length;
  
  let trend = 'stable';
  if (currentEII !== null && avg !== null && avg !== 0) {
    const diff = ((currentEII - avg) / avg) * 100;
    if (diff > 5) trend = 'improving';
    else if (diff < -5) trend = 'declining';
  }
  
  return {
    current: currentEII,
    seven_day_avg: Math.round(avg * 10) / 10,
    trend,
    data_points: eiiValues.length
  };
}

/**
 * Load consent metrics
 */
function loadConsentMetrics() {
  log('Loading consent metrics...');
  const consentLedger = readLedger('governance/consent/ledger.jsonl');
  
  if (consentLedger.length === 0) {
    return null;
  }
  
  const totalEvents = consentLedger.length;
  const optInEvents = consentLedger.filter(e => 
    e.event_type === 'consent_given' || 
    e.event_type === 'preferences_updated'
  ).length;
  
  return {
    total_events: totalEvents,
    opt_in_events: optInEvents,
    opt_in_rate: totalEvents > 0 ? Math.round((optInEvents / totalEvents) * 100) / 100 : 0
  };
}

/**
 * Load federation status
 */
function loadFederationStatus() {
  log('Loading federation status...');
  const federationLedger = readLedger('governance/federation/ledger.jsonl');
  
  if (federationLedger.length === 0) {
    return null;
  }
  
  const verifications = federationLedger.filter(e => 
    e.ledger_entry_type === 'federation_verification'
  );
  
  if (verifications.length === 0) {
    return null;
  }
  
  const latest = verifications[verifications.length - 1];
  const partnersVerified = latest.partners_verified || 0;
  const networkHealth = latest.network_health || 'unknown';
  
  return {
    partners_verified: partnersVerified,
    network_health: networkHealth,
    last_verification: latest.timestamp
  };
}

/**
 * Aggregate system health status
 */
function aggregateSystemHealth(monitoring, integrity) {
  log('Aggregating system health status...');
  
  let status = 'healthy';
  
  // Check monitoring status
  if (monitoring) {
    if (monitoring.system_state === 'critical') {
      status = 'attention_required';
    } else if (monitoring.system_state === 'degraded' && status === 'healthy') {
      status = 'degraded';
    }
  }
  
  // Check integrity status
  if (integrity) {
    if (integrity.system_state === 'attention_required') {
      status = 'attention_required';
    } else if (integrity.system_state === 'degraded' && status === 'healthy') {
      status = 'degraded';
    }
  }
  
  return status;
}

/**
 * Main report generation function
 */
async function main() {
  console.log('\n📊 Daily Governance Report Generator');
  console.log('======================================\n');
  
  console.log(`Report Date: ${reportDate}`);
  console.log(`Verbose: ${verbose ? 'Yes' : 'No'}`);
  console.log('');
  
  const timestamp = new Date().toISOString();
  const reportId = `daily-governance-${reportDate}`;
  
  let hasWarnings = false;
  
  // Load all data sources
  console.log('📋 Loading data sources...\n');
  
  const monitoring = loadMonitoringData(reportDate);
  if (!monitoring) {
    console.log('  ⚠️  Monitoring data not found');
    hasWarnings = true;
  } else {
    console.log('  ✅ Monitoring data loaded');
  }
  
  const integrity = loadIntegrityData(reportDate);
  if (!integrity) {
    console.log('  ⚠️  Integrity data not found');
    hasWarnings = true;
  } else {
    console.log('  ✅ Integrity data loaded');
  }
  
  const feedback = loadFeedbackData();
  if (!feedback) {
    console.log('  ⚠️  Feedback data not found');
    hasWarnings = true;
  } else {
    console.log('  ✅ Feedback data loaded');
  }
  
  console.log('');
  
  // Calculate derived metrics
  console.log('📈 Calculating metrics...\n');
  
  const eiiMetrics = calculateEII7DayAverage(reportDate);
  const consentMetrics = loadConsentMetrics();
  const federationStatus = loadFederationStatus();
  
  // Aggregate system health
  const systemHealth = aggregateSystemHealth(monitoring, integrity);
  
  // Build report
  const report = {
    report_id: reportId,
    timestamp,
    report_date: reportDate,
    verified: true,
    hash: '', // Will be computed below
    system_health: {
      status: systemHealth,
      api_endpoints: monitoring ? {
        passed: monitoring.endpoint_summary.passed,
        total: monitoring.endpoint_summary.total,
        success_rate: monitoring.endpoint_summary.success_rate,
        details: monitoring.endpoints
      } : null,
      tls_certificate: monitoring ? monitoring.tls : null,
      response_time_avg_ms: monitoring ? monitoring.performance.avg_response_time_ms : null
    },
    integrity_status: integrity ? {
      last_verification: integrity.timestamp,
      ledger_health: integrity.ledger_status,
      open_issues: integrity.total_issues || 0,
      auto_repaired: integrity.auto_repaired || 0,
      pending_reviews: integrity.requires_human_review || 0,
      global_merkle_root: integrity.global_merkle_root || null
    } : null,
    ethical_metrics: {
      eii_current: eiiMetrics ? eiiMetrics.current : null,
      eii_7day_avg: eiiMetrics ? eiiMetrics.seven_day_avg : null,
      eii_trend: eiiMetrics ? eiiMetrics.trend : null,
      trust_score_avg: feedback ? feedback.average_trust_score : null,
      consent_metrics: consentMetrics
    },
    feedback_summary: feedback ? {
      new_submissions_24h: feedback.new_submissions_24h || 0,
      open_items: feedback.open_items || 0,
      resolved_items: feedback.resolved_items || 0,
      average_trust_score: feedback.average_trust_score || null
    } : null,
    federation_status: federationStatus,
    recommendations: [
      ...(monitoring?.recommendations || []),
      ...(integrity?.recommendations || [])
    ],
    governance_links: {
      ledger_entry: 'entry-block10.7-daily-reports',
      integrity_report: integrity ? `governance/integrity/reports/${reportDate}.json` : null,
      monitoring_report: monitoring ? `reports/monitoring/monitoring-${reportDate}.json` : null
    },
    data_quality: {
      monitoring_available: !!monitoring,
      integrity_available: !!integrity,
      feedback_available: !!feedback,
      federation_available: !!federationStatus,
      completeness_score: [monitoring, integrity, feedback, federationStatus].filter(Boolean).length / 4
    }
  };
  
  // Compute hash (exclude hash field itself)
  const reportForHash = { ...report };
  delete reportForHash.hash;
  report.hash = sha256(JSON.stringify(reportForHash, Object.keys(reportForHash).sort()));
  
  // Save report
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
  
  console.log(`\n📄 Report saved: ${outputPath}\n`);
  
  // Summary
  console.log('✅ Report generation complete\n');
  console.log(`Report ID: ${reportId}`);
  console.log(`System Status: ${systemHealth.toUpperCase()}`);
  console.log(`Hash: ${report.hash.slice(0, 16)}...`);
  console.log(`Completeness: ${Math.round(report.data_quality.completeness_score * 100)}%`);
  console.log(`Recommendations: ${report.recommendations.length}`);
  console.log('');
  
  // Exit with appropriate code
  if (hasWarnings) {
    console.log('⚠️  Report generated with warnings (some data sources unavailable)\n');
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(2);
});

