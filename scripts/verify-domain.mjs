#!/usr/bin/env node
/**
 * @fileoverview Domain & SSL Verification Script - Block 10.0
 * @see infra/domain-setup.md
 *
 * Verifies domain resolution, SSL/TLS certificate validity, and security headers
 */

import https from 'https';
import { URL } from 'url';

// Configuration
const DOMAIN = process.env.NEXT_PUBLIC_BASE_URL || 'https://quantumpoly.ai';
const TIMEOUT = 10000; // 10 seconds

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
};

/**
 * Log with color
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Check HTTPS connectivity
 */
function checkHTTPS(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname,
      method: 'HEAD',
      timeout: TIMEOUT,
      rejectUnauthorized: true, // Verify SSL certificate
    };

    const req = https.request(options, (res) => {
      const result = {
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        headers: res.headers,
        httpVersion: res.httpVersion,
      };
      resolve(result);
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
 * Get SSL certificate details
 */
function getSSLCertificate(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      method: 'GET',
      rejectUnauthorized: true,
    };

    const req = https.request(options, (res) => {
      const cert = res.socket.getPeerCertificate();
      
      if (!cert || Object.keys(cert).length === 0) {
        reject(new Error('No certificate found'));
        return;
      }

      resolve({
        subject: cert.subject,
        issuer: cert.issuer,
        validFrom: cert.valid_from,
        validTo: cert.valid_to,
        serialNumber: cert.serialNumber,
        fingerprint: cert.fingerprint,
        subjectAltNames: cert.subjectaltname,
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Check security headers
 */
function checkSecurityHeaders(headers) {
  const requiredHeaders = {
    'strict-transport-security': {
      required: true,
      description: 'HSTS header',
    },
    'x-frame-options': {
      required: true,
      description: 'Clickjacking protection',
    },
    'x-content-type-options': {
      required: true,
      description: 'MIME type sniffing protection',
    },
    'referrer-policy': {
      required: false,
      description: 'Referrer policy',
    },
    'permissions-policy': {
      required: false,
      description: 'Permissions policy',
    },
  };

  const results = [];
  
  for (const [header, config] of Object.entries(requiredHeaders)) {
    const value = headers[header];
    const present = !!value;
    
    results.push({
      header,
      description: config.description,
      required: config.required,
      present,
      value: value || null,
      status: present ? 'pass' : (config.required ? 'fail' : 'warning'),
    });
  }

  return results;
}

/**
 * Check certificate expiration
 */
function checkCertificateExpiration(validTo) {
  const expiryDate = new Date(validTo);
  const now = new Date();
  const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
  
  let status = 'pass';
  if (daysUntilExpiry < 0) {
    status = 'expired';
  } else if (daysUntilExpiry < 7) {
    status = 'critical';
  } else if (daysUntilExpiry < 30) {
    status = 'warning';
  }
  
  return {
    expiryDate: expiryDate.toISOString(),
    daysUntilExpiry,
    status,
  };
}

/**
 * Main verification
 */
async function main() {
  console.log('');
  log('🔍 Domain & SSL Verification — Block 10.0', 'cyan');
  log('='.repeat(80), 'cyan');
  console.log('');

  const results = {
    timestamp: new Date().toISOString(),
    domain: DOMAIN,
    checks: {},
    overall: 'pass',
  };

  try {
    // 1. Check HTTPS connectivity
    log('1️⃣  Checking HTTPS connectivity...', 'blue');
    try {
      const response = await checkHTTPS(DOMAIN);
      
      if (response.statusCode === 200) {
        log(`   ✅ HTTPS connection successful (${response.statusCode} ${response.statusMessage})`, 'green');
        log(`   HTTP Version: ${response.httpVersion}`, 'cyan');
        results.checks.https = {
          status: 'pass',
          statusCode: response.statusCode,
          httpVersion: response.httpVersion,
        };
      } else {
        log(`   ⚠️  Unexpected status code: ${response.statusCode}`, 'yellow');
        results.checks.https = {
          status: 'warning',
          statusCode: response.statusCode,
        };
      }
    } catch (error) {
      log(`   ❌ HTTPS connection failed: ${error.message}`, 'red');
      results.checks.https = {
        status: 'fail',
        error: error.message,
      };
      results.overall = 'fail';
    }
    console.log('');

    // 2. Check SSL certificate
    log('2️⃣  Checking SSL/TLS certificate...', 'blue');
    try {
      const cert = await getSSLCertificate(DOMAIN);
      
      log(`   ✅ Certificate retrieved successfully`, 'green');
      log(`   Subject: ${cert.subject.CN}`, 'cyan');
      log(`   Issuer: ${cert.issuer.O} (${cert.issuer.CN})`, 'cyan');
      log(`   Valid From: ${cert.validFrom}`, 'cyan');
      log(`   Valid To: ${cert.validTo}`, 'cyan');
      
      // Check expiration
      const expiration = checkCertificateExpiration(cert.validTo);
      log(`   Days Until Expiry: ${expiration.daysUntilExpiry}`, 
        expiration.status === 'pass' ? 'green' : 
        expiration.status === 'warning' ? 'yellow' : 'red'
      );
      
      results.checks.certificate = {
        status: expiration.status === 'expired' || expiration.status === 'critical' ? 'fail' : 'pass',
        subject: cert.subject.CN,
        issuer: cert.issuer.O,
        validFrom: cert.validFrom,
        validTo: cert.validTo,
        daysUntilExpiry: expiration.daysUntilExpiry,
        fingerprint: cert.fingerprint,
      };

      if (expiration.status === 'expired' || expiration.status === 'critical') {
        results.overall = 'fail';
      } else if (expiration.status === 'warning') {
        results.overall = results.overall === 'pass' ? 'warning' : results.overall;
      }
    } catch (error) {
      log(`   ❌ Certificate check failed: ${error.message}`, 'red');
      results.checks.certificate = {
        status: 'fail',
        error: error.message,
      };
      results.overall = 'fail';
    }
    console.log('');

    // 3. Check security headers
    log('3️⃣  Checking security headers...', 'blue');
    try {
      const response = await checkHTTPS(DOMAIN);
      const headerResults = checkSecurityHeaders(response.headers);
      
      let headersFailed = false;
      for (const result of headerResults) {
        const icon = result.status === 'pass' ? '✅' : 
                     result.status === 'warning' ? '⚠️' : '❌';
        const color = result.status === 'pass' ? 'green' : 
                      result.status === 'warning' ? 'yellow' : 'red';
        
        log(`   ${icon} ${result.description} (${result.header})`, color);
        if (result.value) {
          log(`      ${result.value}`, 'cyan');
        }
        
        if (result.status === 'fail') {
          headersFailed = true;
        }
      }
      
      results.checks.securityHeaders = {
        status: headersFailed ? 'fail' : 'pass',
        headers: headerResults,
      };

      if (headersFailed) {
        results.overall = 'fail';
      }
    } catch (error) {
      log(`   ❌ Security headers check failed: ${error.message}`, 'red');
      results.checks.securityHeaders = {
        status: 'fail',
        error: error.message,
      };
      results.overall = 'fail';
    }
    console.log('');

    // Summary
    log('='.repeat(80), 'cyan');
    log('📊 Verification Summary', 'cyan');
    log('='.repeat(80), 'cyan');
    console.log('');
    
    const overallIcon = results.overall === 'pass' ? '✅' : 
                        results.overall === 'warning' ? '⚠️' : '❌';
    const overallColor = results.overall === 'pass' ? 'green' : 
                         results.overall === 'warning' ? 'yellow' : 'red';
    
    log(`${overallIcon} Overall Status: ${results.overall.toUpperCase()}`, overallColor);
    console.log('');
    
    log(`Domain: ${DOMAIN}`, 'cyan');
    log(`Timestamp: ${results.timestamp}`, 'cyan');
    console.log('');

    // Output JSON for scripting
    if (process.argv.includes('--json')) {
      console.log(JSON.stringify(results, null, 2));
    }

    // Exit code
    if (results.overall === 'fail') {
      log('❌ Domain verification failed', 'red');
      process.exit(1);
    } else if (results.overall === 'warning') {
      log('⚠️  Domain verification passed with warnings', 'yellow');
      process.exit(0);
    } else {
      log('✅ Domain verification passed', 'green');
      process.exit(0);
    }

  } catch (error) {
    console.error('');
    log(`❌ Verification failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();

