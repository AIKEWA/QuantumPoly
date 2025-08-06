/**
 * Locale Redirect Test Script
 * 
 * This script tests the locale redirection behavior of the application
 * to ensure that redirects work correctly and consistently.
 */

import { testLocaleRedirects } from '../src/utils/redirectTester';

// Configuration
const TEST_HOST = process.env.TEST_HOST || 'http://localhost:3000';
const VERBOSE = process.env.VERBOSE === 'true';

console.log(`
╔══════════════════════════════════════════════════╗
║   QuantumPoly Locale Redirection Test Script     ║
╚══════════════════════════════════════════════════╝
`);

// Run the test suite
testLocaleRedirects({
  host: TEST_HOST,
  verbose: VERBOSE
});

/**
 * To run this script:
 * 
 * 1. Start your Next.js development server:
 *    npm run dev
 * 
 * 2. In a separate terminal, run this script:
 *    npx ts-node scripts/test-redirects.ts
 * 
 * 3. For verbose output:
 *    VERBOSE=true npx ts-node scripts/test-redirects.ts
 * 
 * 4. To test against a production environment:
 *    TEST_HOST=https://example.com npx ts-node scripts/test-redirects.ts
 */ 