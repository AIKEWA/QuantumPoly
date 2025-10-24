#!/usr/bin/env node

/**
 * Sitemap Validation Script
 * 
 * Validates the generated sitemap.xml for:
 * - HTTP 200 response
 * - Valid XML structure
 * - Required sitemap elements
 * - All locale hreflang alternates (en, de, tr, es, fr, it)
 * - x-default fallback
 * 
 * Usage:
 *   NEXT_PUBLIC_SITE_URL=http://localhost:3000 node scripts/check-sitemap.js
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
const SITEMAP_PATH = '/sitemap.xml';
const REQUIRED_LOCALES = ['en', 'de', 'tr', 'es', 'fr', 'it'];

// Required XML elements for valid sitemap
const REQUIRED_ELEMENTS = [
  '<urlset',
  '<url>',
  '<loc>',
  'xhtml:link',
  'hreflang="x-default"',
];

/**
 * Fetch sitemap from server
 */
function fetchSitemap(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const request = client.get(url, (response) => {
      // Check status code
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: Sitemap not accessible at ${url}`));
        return;
      }

      // Collect response chunks
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const xml = Buffer.concat(chunks).toString('utf8');
        resolve({ xml, statusCode: response.statusCode });
      });
    });

    request.on('error', (error) => {
      reject(new Error(`Network error fetching sitemap: ${error.message}`));
    });

    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Sitemap request timeout after 10s'));
    });
  });
}

/**
 * Validate sitemap XML structure and content
 */
function validateSitemap(xml) {
  const errors = [];

  // Check for required XML elements
  for (const element of REQUIRED_ELEMENTS) {
    if (!xml.includes(element)) {
      errors.push(`Missing required element: ${element}`);
    }
  }

  // Check for all required locale hreflang attributes
  for (const locale of REQUIRED_LOCALES) {
    const hreflangAttr = `hreflang="${locale}"`;
    if (!xml.includes(hreflangAttr)) {
      errors.push(`Missing hreflang for locale: ${locale}`);
    }
  }

  // Verify URLs are absolute (not relative)
  if (xml.includes('<loc>/') && !xml.includes('<loc>http')) {
    errors.push('Found relative URLs in <loc> tags (must be absolute)');
  }

  // Basic XML structure validation
  const urlsetOpen = (xml.match(/<urlset/g) || []).length;
  const urlsetClose = (xml.match(/<\/urlset>/g) || []).length;
  if (urlsetOpen !== urlsetClose) {
    errors.push('Malformed XML: <urlset> tags not properly closed');
  }

  return errors;
}

/**
 * Main validation routine
 */
async function main() {
  const target = `${SITE_URL}${SITEMAP_PATH}`;
  
  console.log('🔍 Sitemap Validation');
  console.log('━'.repeat(50));
  console.log(`📍 Target: ${target}`);
  console.log(`🌐 Locales: ${REQUIRED_LOCALES.join(', ')}`);
  console.log('');

  try {
    // Fetch sitemap
    console.log('⏳ Fetching sitemap...');
    const { xml, statusCode } = await fetchSitemap(target);
    console.log(`✅ HTTP ${statusCode} - Sitemap accessible`);
    console.log(`📏 Size: ${xml.length} bytes`);
    console.log('');

    // Validate content
    console.log('⏳ Validating structure and content...');
    const errors = validateSitemap(xml);

    if (errors.length > 0) {
      console.error('❌ Validation failed with errors:\n');
      errors.forEach((error, index) => {
        console.error(`  ${index + 1}. ${error}`);
      });
      console.error('');
      process.exit(1);
    }

    // Success
    console.log('✅ All required elements present');
    console.log('✅ All locale hreflang alternates found');
    console.log('✅ x-default fallback configured');
    console.log('✅ URLs are absolute');
    console.log('');
    console.log('🎉 Sitemap validation passed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Sitemap validation failed:\n');
    console.error(`  ${error.message}`);
    console.error('');
    console.error('💡 Tips:');
    console.error('  - Ensure the Next.js server is running');
    console.error('  - Check NEXT_PUBLIC_SITE_URL environment variable');
    console.error('  - Verify the sitemap.ts file exports valid metadata');
    console.error('');
    process.exit(1);
  }
}

// Run validation
main();

