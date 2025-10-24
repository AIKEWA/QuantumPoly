#!/usr/bin/env node

/**
 * Robots.txt Validation Script
 * 
 * Validates the generated robots.txt for:
 * - HTTP 200 response
 * - Environment-appropriate crawling policy
 * - Sitemap directive presence
 * 
 * Environment Policies:
 * - Production (NODE_ENV=production): Must allow crawling
 * - Non-production: Must disallow crawling (prevents accidental indexing)
 * 
 * Usage:
 *   NODE_ENV=production NEXT_PUBLIC_SITE_URL=http://localhost:3000 node scripts/check-robots.js
 * 
 * Exit codes:
 *   0 - All validations passed
 *   1 - One or more validations failed
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const ROBOTS_PATH = '/robots.txt';
const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * Fetch robots.txt from server
 */
function fetchRobots(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const request = client.get(url, (response) => {
      // Check status code
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: robots.txt not accessible at ${url}`));
        return;
      }

      // Collect response chunks
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        resolve({ text, statusCode: response.statusCode });
      });
    });

    request.on('error', (error) => {
      reject(new Error(`Network error fetching robots.txt: ${error.message}`));
    });

    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Robots.txt request timeout after 10s'));
    });
  });
}

/**
 * Validate robots.txt content
 */
function validateRobots(text, isProd) {
  const errors = [];
  const warnings = [];

  // Check for User-agent directive
  if (!text.includes('User-agent:')) {
    errors.push('Missing User-agent directive');
  }

  // Check environment-specific policy
  if (isProd) {
    // Production: must allow crawling
    if (!text.includes('Allow: /')) {
      errors.push('Production environment must include "Allow: /" directive');
    }
    if (text.includes('Disallow: /')) {
      warnings.push('Production environment should not disallow root path');
    }
  } else {
    // Non-production: must disallow crawling
    if (!text.includes('Disallow: /')) {
      errors.push('Non-production environment must include "Disallow: /" directive');
    }
    if (text.includes('Allow: /')) {
      errors.push('Non-production environment should not allow crawling');
    }
  }

  // Check for sitemap reference
  if (!text.includes('Sitemap:')) {
    errors.push('Missing Sitemap directive');
  } else {
    // Verify sitemap URL format
    const sitemapMatch = text.match(/Sitemap:\s*(.+)/);
    if (sitemapMatch) {
      const sitemapUrl = sitemapMatch[1].trim();
      if (!sitemapUrl.startsWith('http')) {
        errors.push(`Sitemap URL must be absolute, found: ${sitemapUrl}`);
      }
      if (!sitemapUrl.endsWith('/sitemap.xml')) {
        warnings.push(`Sitemap URL should end with /sitemap.xml, found: ${sitemapUrl}`);
      }
    }
  }

  return { errors, warnings };
}

/**
 * Main validation routine
 */
async function main() {
  const target = `${SITE_URL}${ROBOTS_PATH}`;
  const environment = IS_PROD ? 'PRODUCTION' : 'NON-PRODUCTION';
  
  console.log('🤖 Robots.txt Validation');
  console.log('━'.repeat(50));
  console.log(`📍 Target: ${target}`);
  console.log(`🔧 Environment: ${environment}`);
  console.log(`📋 Expected policy: ${IS_PROD ? 'Allow crawling' : 'Disallow crawling'}`);
  console.log('');

  try {
    // Fetch robots.txt
    console.log('⏳ Fetching robots.txt...');
    const { text, statusCode } = await fetchRobots(target);
    console.log(`✅ HTTP ${statusCode} - robots.txt accessible`);
    console.log(`📏 Size: ${text.length} bytes`);
    console.log('');

    // Display content
    console.log('📄 Content:');
    console.log('─'.repeat(50));
    console.log(text);
    console.log('─'.repeat(50));
    console.log('');

    // Validate content
    console.log('⏳ Validating policy and directives...');
    const { errors, warnings } = validateRobots(text, IS_PROD);

    // Show warnings
    if (warnings.length > 0) {
      console.warn('⚠️  Warnings:\n');
      warnings.forEach((warning, index) => {
        console.warn(`  ${index + 1}. ${warning}`);
      });
      console.warn('');
    }

    // Check errors
    if (errors.length > 0) {
      console.error('❌ Validation failed with errors:\n');
      errors.forEach((error, index) => {
        console.error(`  ${index + 1}. ${error}`);
      });
      console.error('');
      process.exit(1);
    }

    // Success
    console.log('✅ User-agent directive present');
    console.log(`✅ ${environment} policy correct`);
    console.log('✅ Sitemap directive present');
    console.log('');
    console.log('🎉 Robots.txt validation passed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Robots.txt validation failed:\n');
    console.error(`  ${error.message}`);
    console.error('');
    console.error('💡 Tips:');
    console.error('  - Ensure the Next.js server is running');
    console.error('  - Check NEXT_PUBLIC_SITE_URL environment variable');
    console.error('  - Verify the robots.ts file exports valid metadata');
    console.error('  - Check NODE_ENV is set correctly for your environment');
    console.error('');
    process.exit(1);
  }
}

// Run validation
main();

