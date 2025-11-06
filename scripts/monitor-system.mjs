#!/usr/bin/env node

/**
 * System Monitoring Script
 * 
 * Autonomous health checks for API endpoints, TLS certificates, and system integrity.
 * 
 * Block 10.7 — Daily Governance Reports
 * 
 * Usage:
 *   node scripts/monitor-system.mjs [options]
 * 
 * Options:
 *   --base-url=<url>      Base URL to monitor (default: https://quantumpoly.ai)
 *   --no-integrity        Skip integrity verification checks
 *   --no-ewa              Skip EWA analysis checks
 *   --verbose             Detailed output
 *   --output=<path>       Output file path (default: reports/monitoring/monitoring-YYYY-MM-DD.json)
 * 
 * Exit Codes:
 *   0 - Healthy (all checks passed)
 *   1 - Degraded (some checks failed, non-critical)
 *   2 - Critical (critical checks failed)
 */

import https from 'https';
import http from 'http';
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
const noIntegrity = args.includes('--no-integrity');
const noEwa = args.includes('--no-ewa');

const baseUrlArg = args.find(arg => arg.startsWith('--base-url='));
const baseUrl = baseUrlArg ? baseUrlArg.split('=')[1] : 'https://quantumpoly.ai';

const outputArg = args.find(arg => arg.startsWith('--output='));
const today = new Date().toISOString().split('T')[0];
const outputPath = outputArg 
  ? outputArg.split('=')[1]
  : `reports/monitoring/monitoring-${today}.json`;

/**
 * Log message if verbose mode enabled
 */
function log(message) {
  if (verbose) {
    console.log(message);
  }
}

/**
 * Fetch URL with timeout and error handling
 */
function fetchUrl(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const startTime = Date.now();
    
    const request = protocol.get(url, {
      timeout,
      headers: {
        'User-Agent': 'QuantumPoly-Monitor/1.0',
        'Accept': 'application/json'
      }
    }, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
          responseTime
        });
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Check TLS certificate validity
 */
function checkTLSCertificate(hostname) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      method: 'GET',
      path: '/',
      agent: false,
      rejectUnauthorized: true
    };
    
    const request = https.request(options, (res) => {
      const cert = res.socket.getPeerCertificate();
      
      if (!cert || Object.keys(cert).length === 0) {
        reject(new Error('No certificate found'));
        return;
      }
      
      const now = new Date();
      const validFrom = new Date(cert.valid_from);
      const validTo = new Date(cert.valid_to);
      const daysRemaining = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));
      
      resolve({
        valid: now >= validFrom && now <= validTo,
        issuer: cert.issuer.O || cert.issuer.CN || 'Unknown',
        subject: cert.subject.CN || hostname,
        valid_from: cert.valid_from,
        valid_to: cert.valid_to,
        days_remaining: daysRemaining,
        fingerprint: cert.fingerprint
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.end();
  });
}

/**
 * Check API endpoint health
 */
async function checkEndpoint(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const { expectMerkleRoot = false, maxResponseTime = 3000 } = options;
  
  log(`  Checking ${endpoint}...`);
  
  try {
    const result = await fetchUrl(url, 5000);
    
    const status = result.statusCode === 200 ? 'passed' : 'failed';
    const responseTimeAcceptable = result.responseTime <= maxResponseTime;
    
    let notes = '';
    let merkleRootValid = null;
    
    if (status === 'passed') {
      if (!responseTimeAcceptable) {
        notes = `Response time ${result.responseTime}ms exceeds threshold ${maxResponseTime}ms`;
      }
      
      if (expectMerkleRoot) {
        try {
          const data = JSON.parse(result.data);
          if (data.merkleRoot || data.merkle_root || data.global_merkle_root) {
            const merkleRoot = data.merkleRoot || data.merkle_root || data.global_merkle_root;
            merkleRootValid = /^[a-f0-9]{64}$/i.test(merkleRoot);
            if (!merkleRootValid) {
              notes = notes ? `${notes}; Invalid Merkle root format` : 'Invalid Merkle root format';
            }
          } else {
            notes = notes ? `${notes}; Merkle root not found` : 'Merkle root not found';
          }
        } catch (e) {
          notes = notes ? `${notes}; Invalid JSON response` : 'Invalid JSON response';
        }
      }
    } else {
      notes = `HTTP ${result.statusCode}`;
    }
    
    return {
      endpoint,
      url,
      status,
      status_code: result.statusCode,
      response_time_ms: result.responseTime,
      response_time_acceptable: responseTimeAcceptable,
      merkle_root_valid: merkleRootValid,
      notes: notes || null,
      checked_at: new Date().toISOString()
    };
  } catch (error) {
    return {
      endpoint,
      url,
      status: 'failed',
      status_code: null,
      response_time_ms: null,
      response_time_acceptable: false,
      merkle_root_valid: null,
      notes: error.message,
      checked_at: new Date().toISOString()
    };
  }
}

/**
 * Main monitoring function
 */
async function main() {
  console.log('\n🔍 System Monitoring - Block 10.7');
  console.log('=====================================\n');
  
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Verbose: ${verbose ? 'Yes' : 'No'}`);
  console.log(`Skip Integrity: ${noIntegrity ? 'Yes' : 'No'}`);
  console.log(`Skip EWA: ${noEwa ? 'Yes' : 'No'}`);
  console.log('');
  
  const timestamp = new Date().toISOString();
  const reportId = `monitoring-${today}`;
  
  // Define endpoints to check
  const endpoints = [
    { path: '/api/status', options: {} },
    { path: '/api/ethics/summary', options: { expectMerkleRoot: true } },
    { path: '/api/trust/proof', options: {} },
    { path: '/api/federation/trust', options: {} },
  ];
  
  if (!noIntegrity) {
    endpoints.push({ path: '/api/integrity/status', options: {} });
  }
  
  if (!noEwa) {
    endpoints.push({ path: '/api/ewa/insights', options: {} });
  }
  
  // Check API endpoints
  console.log('📋 Checking API endpoints...\n');
  const endpointResults = [];
  
  for (const { path, options } of endpoints) {
    const result = await checkEndpoint(path, options);
    endpointResults.push(result);
    
    const statusEmoji = result.status === 'passed' ? '✅' : '❌';
    console.log(`  ${statusEmoji} ${path}: ${result.status} (${result.response_time_ms}ms)`);
    if (result.notes) {
      console.log(`     ⚠️  ${result.notes}`);
    }
  }
  console.log('');
  
  // Check TLS certificate
  console.log('🔒 Checking TLS certificate...\n');
  let tlsResult = null;
  
  try {
    const hostname = new URL(baseUrl).hostname;
    tlsResult = await checkTLSCertificate(hostname);
    
    const validEmoji = tlsResult.valid ? '✅' : '❌';
    console.log(`  ${validEmoji} Certificate valid: ${tlsResult.valid}`);
    console.log(`     Issuer: ${tlsResult.issuer}`);
    console.log(`     Days remaining: ${tlsResult.days_remaining}`);
    
    if (tlsResult.days_remaining < 30) {
      console.log(`     ⚠️  Certificate expires in less than 30 days!`);
    }
  } catch (error) {
    console.log(`  ❌ TLS check failed: ${error.message}`);
    tlsResult = {
      valid: false,
      issuer: null,
      subject: null,
      valid_from: null,
      valid_to: null,
      days_remaining: null,
      error: error.message
    };
  }
  console.log('');
  
  // Calculate summary statistics
  const totalEndpoints = endpointResults.length;
  const passedEndpoints = endpointResults.filter(e => e.status === 'passed').length;
  const failedEndpoints = totalEndpoints - passedEndpoints;
  
  const responseTimes = endpointResults
    .filter(e => e.response_time_ms !== null)
    .map(e => e.response_time_ms);
  
  const avgResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : null;
  
  // Determine overall system state
  let systemState = 'healthy';
  
  if (failedEndpoints > 0 || !tlsResult.valid) {
    systemState = 'degraded';
  }
  
  if (failedEndpoints >= totalEndpoints * 0.5 || (tlsResult.days_remaining !== null && tlsResult.days_remaining < 7)) {
    systemState = 'critical';
  }
  
  // Generate recommendations
  const recommendations = [];
  
  if (failedEndpoints > 0) {
    recommendations.push({
      priority: failedEndpoints >= totalEndpoints * 0.5 ? 'high' : 'medium',
      category: 'availability',
      action: 'Investigate failed API endpoints',
      details: `${failedEndpoints} of ${totalEndpoints} endpoints are not responding correctly`
    });
  }
  
  if (tlsResult.days_remaining !== null && tlsResult.days_remaining < 30) {
    recommendations.push({
      priority: tlsResult.days_remaining < 7 ? 'critical' : 'high',
      category: 'security',
      action: 'Renew TLS certificate',
      details: `Certificate expires in ${tlsResult.days_remaining} days`
    });
  }
  
  endpointResults.forEach(result => {
    if (result.response_time_ms && result.response_time_ms > 2000) {
      recommendations.push({
        priority: 'low',
        category: 'performance',
        action: `Optimize ${result.endpoint} response time`,
        details: `Current response time: ${result.response_time_ms}ms (target: <2000ms)`
      });
    }
  });
  
  // Build report
  const report = {
    report_id: reportId,
    timestamp,
    report_date: today,
    base_url: baseUrl,
    system_state: systemState,
    endpoint_summary: {
      total: totalEndpoints,
      passed: passedEndpoints,
      failed: failedEndpoints,
      success_rate: totalEndpoints > 0 ? Math.round((passedEndpoints / totalEndpoints) * 100) / 100 : 0
    },
    endpoints: endpointResults,
    tls: tlsResult,
    performance: {
      avg_response_time_ms: avgResponseTime,
      min_response_time_ms: responseTimes.length > 0 ? Math.min(...responseTimes) : null,
      max_response_time_ms: responseTimes.length > 0 ? Math.max(...responseTimes) : null
    },
    recommendations,
    monitoring_config: {
      integrity_enabled: !noIntegrity,
      ewa_enabled: !noEwa,
      response_time_threshold_ms: 3000
    }
  };
  
  // Save report
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
  
  console.log(`📄 Report saved: ${outputPath}\n`);
  
  // Summary
  console.log('✅ Monitoring complete\n');
  console.log(`System State: ${systemState.toUpperCase()}`);
  console.log(`Endpoints: ${passedEndpoints}/${totalEndpoints} passed`);
  console.log(`Avg Response Time: ${avgResponseTime}ms`);
  console.log(`Recommendations: ${recommendations.length}`);
  console.log('');
  
  // Exit with appropriate code
  if (systemState === 'critical') {
    process.exit(2);
  } else if (systemState === 'degraded') {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(2);
});
