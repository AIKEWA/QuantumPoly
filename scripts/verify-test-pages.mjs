#!/usr/bin/env node
/**
 * Verify Test Pages Accessibility
 * 
 * Checks that all target pages for BLOCK 10.8 audit are accessible
 * on the dev server before running automated tests.
 */

const LOCALES = ['en', 'de', 'es', 'fr', 'it', 'tr'];
const PAGES = [
  '/',
  '/ethics',
  '/privacy',
  '/imprint',
  '/gep',
  '/accessibility',
  '/contact',
  '/governance',
  '/governance/dashboard',
  '/governance/dashboard/timeline',
  '/governance/review',
  '/governance/autonomy',
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function checkPage(locale, page) {
  const url = `${BASE_URL}/${locale}${page === '/' ? '' : page}`;
  try {
    const response = await fetch(url);
    return {
      url,
      status: response.status,
      ok: response.ok,
    };
  } catch (error) {
    return {
      url,
      status: 0,
      ok: false,
      error: error.message,
    };
  }
}

async function main() {
  console.log('🔍 Verifying Test Pages for BLOCK 10.8 Accessibility Audit\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Locales: ${LOCALES.join(', ')}`);
  console.log(`Pages: ${PAGES.length}\n`);

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const locale of LOCALES) {
    console.log(`\n📍 Testing locale: ${locale}`);
    for (const page of PAGES) {
      const result = await checkPage(locale, page);
      results.push(result);

      if (result.ok) {
        console.log(`  ✅ ${result.url} → ${result.status}`);
        successCount++;
      } else {
        console.log(`  ❌ ${result.url} → ${result.status} ${result.error || ''}`);
        failCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`  Total URLs tested: ${results.length}`);
  console.log(`  ✅ Accessible: ${successCount}`);
  console.log(`  ❌ Failed: ${failCount}`);
  console.log(`  Success Rate: ${((successCount / results.length) * 100).toFixed(1)}%\n`);

  if (failCount > 0) {
    console.error('❌ Some pages are not accessible. Please fix before running audit.');
    process.exit(1);
  }

  console.log('✅ All test pages accessible. Ready for accessibility audit.\n');
  process.exit(0);
}

main();

