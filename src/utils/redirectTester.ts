/**
 * Redirect Testing Utility
 * 
 * A utility for testing and diagnosing redirect behavior in Next.js applications,
 * particularly focused on locale-based redirection.
 */

import { execSync } from 'child_process';
import { locales, defaultLocale } from '../i18n';

// Configuration
const DEFAULT_HOST = 'http://localhost:3000';
const USER_AGENT = 'Mozilla/5.0 (compatible; RedirectTester/1.0)';

type TestResult = {
  path: string;
  statusCode: number;
  redirectLocation?: string;
  cookiesSet?: string[];
  finalLocation: string;
  redirectChain: string[];
  success: boolean;
  timeMs: number;
};

/**
 * Test a URL path for redirect behavior
 * 
 * @param path The path to test (e.g., "/", "/about", etc.)
 * @param options Test configuration options
 * @returns Test result object
 */
export function testRedirect(
  path: string, 
  options: {
    host?: string;
    acceptLanguage?: string;
    initialCookies?: string[];
    followRedirects?: boolean;
    maxRedirects?: number;
    verbose?: boolean;
  } = {}
): TestResult {
  const {
    host = DEFAULT_HOST,
    acceptLanguage = 'en-US,en;q=0.9',
    initialCookies = [],
    followRedirects = true,
    maxRedirects = 5,
    verbose = false
  } = options;
  
  const startTime = Date.now();
  const url = `${host}${path}`;
  const redirectChain: string[] = [];
  let finalLocation = path;
  let statusCode = 0;
  let redirectLocation;
  let cookiesSet: string[] = [];
  
  try {
    // Build curl command
    const cookieArgs = initialCookies.length > 0 
      ? `-b "${initialCookies.join('; ')}"` 
      : '';
    
    const command = `curl -s -I ${followRedirects ? '-L' : ''} ${
      maxRedirects ? `--max-redirs ${maxRedirects}` : ''
    } -A "${USER_AGENT}" -H "Accept-Language: ${acceptLanguage}" ${
      cookieArgs
    } -w "%{url_effective}\\n%{http_code}\\n%{redirect_url}\\n%{time_total}\\n" "${url}"`;
    
    if (verbose) {
      console.log(`Executing: ${command}`);
    }
    
    // Execute curl command
    const output = execSync(command).toString().trim();
    const lines = output.split('\n');
    
    // Parse response
    finalLocation = lines[lines.length - 5] || url;
    statusCode = parseInt(lines[lines.length - 4] || '0', 10);
    redirectLocation = lines[lines.length - 3] || undefined;
    const timeSeconds = parseFloat(lines[lines.length - 2] || '0');
    
    // Extract cookies from response headers
    const headerLines = lines.slice(0, -5);
    cookiesSet = headerLines
      .filter(line => line.toLowerCase().startsWith('set-cookie:'))
      .map(line => line.substring('set-cookie:'.length).trim());
    
    // Extract redirect chain from verbose output
    for (let i = 0; i < headerLines.length; i++) {
      if (headerLines[i].match(/^HTTP\/[0-9.]+ 30[1237]/)) {
        for (let j = i + 1; j < headerLines.length; j++) {
          if (headerLines[j].toLowerCase().startsWith('location:')) {
            redirectChain.push(headerLines[j].substring('location:'.length).trim());
            break;
          }
        }
      }
    }
    
    return {
      path,
      statusCode,
      redirectLocation,
      cookiesSet,
      finalLocation,
      redirectChain,
      success: statusCode >= 200 && statusCode < 400,
      timeMs: Math.round(timeSeconds * 1000)
    };
  } catch (error) {
    if (verbose) {
      console.error('Error executing redirect test:', error);
    }
    
    return {
      path,
      statusCode: -1,
      finalLocation: url,
      redirectChain,
      success: false,
      timeMs: Date.now() - startTime
    };
  }
}

/**
 * Run a comprehensive test suite for locale redirect behavior
 */
export function testLocaleRedirects(options: {
  host?: string;
  verbose?: boolean;
} = {}): void {
  const { host = DEFAULT_HOST, verbose = false } = options;
  
  console.log('=== LOCALE REDIRECT TEST SUITE ===');
  console.log(`Testing host: ${host}\n`);
  
  // Test root path "/"
  console.log('## Testing root path "/"');
  testScenario('/', { host, verbose });
  
  // Test with just-redirected cookie set
  console.log('\n## Testing root path with just-redirected cookie');
  testScenario('/', { 
    host, 
    initialCookies: ['just-redirected=1'],
    verbose
  });
  
  // Test explicit locale paths
  console.log('\n## Testing explicit locale paths');
  for (const locale of locales) {
    testScenario(`/${locale}`, { host, verbose });
  }
  
  // Test redirect to best-match locale path
  console.log('\n## Testing Accept-Language header detection');
  // With German as preferred language
  testScenario('/', { 
    host, 
    acceptLanguage: 'de-DE,de;q=0.9,en;q=0.8',
    verbose
  });
  
  // With Turkish as preferred language
  testScenario('/', { 
    host, 
    acceptLanguage: 'tr-TR,tr;q=0.9,en;q=0.8',
    verbose
  });
  
  // Test with preferred-locale cookie set
  console.log('\n## Testing with preferred-locale cookie');
  testScenario('/', { 
    host, 
    initialCookies: ['preferred-locale=de'],
    verbose
  });
  
  console.log('\n=== TEST SUITE COMPLETE ===');
}

/**
 * Run a single test scenario and print results
 */
function testScenario(
  path: string, 
  options: {
    host?: string;
    acceptLanguage?: string;
    initialCookies?: string[];
    verbose?: boolean;
  }
): void {
  const result = testRedirect(path, {
    ...options,
    followRedirects: true,
    maxRedirects: 3
  });
  
  console.log(`- Path: ${path}`);
  if (options.acceptLanguage) {
    console.log(`  Accept-Language: ${options.acceptLanguage}`);
  }
  if (options.initialCookies && options.initialCookies.length > 0) {
    console.log(`  Initial Cookies: ${options.initialCookies.join('; ')}`);
  }
  
  console.log(`  Status: ${result.statusCode} (${result.success ? 'OK' : 'FAILED'})`);
  console.log(`  Final URL: ${result.finalLocation}`);
  
  if (result.redirectChain.length > 0) {
    console.log(`  Redirect Chain: ${result.redirectChain.join(' -> ')}`);
  }
  
  if (result.cookiesSet && result.cookiesSet.length > 0) {
    console.log(`  Cookies Set: ${result.cookiesSet.length}`);
    if (options.verbose) {
      result.cookiesSet.forEach(cookie => {
        console.log(`    - ${cookie}`);
      });
    }
  }
  
  console.log(`  Time: ${result.timeMs}ms`);
}

// Example usage in Node script:
// 
// import { testLocaleRedirects } from './redirectTester';
// 
// testLocaleRedirects({
//   host: 'http://localhost:3000',
//   verbose: true
// }); 