import { createMiddlewareMatcher } from '../src/utils/middlewareMatcherFactory';
import { locales } from '../src/i18n';

describe('Middleware Matcher Configuration', () => {
  it('should exclude locale-prefixed paths', () => {
    // Create a matcher with our app configuration
    const matcher = createMiddlewareMatcher({
      locales,
      excludePaths: ['api', '_next', '_vercel', 'assets'],
      includeRoot: true
    });
    
    // Verify matcher is an array
    expect(Array.isArray(matcher)).toBe(true);
    
    // Get the main pattern (typically the first one)
    const mainPattern = matcher[0];
    expect(typeof mainPattern).toBe('string');
    
    // Test paths that should NOT match (because they have locale prefixes)
    const localePathsToTest = locales.map(locale => `/${locale}`);
    localePathsToTest.push(...locales.map(locale => `/${locale}/about`));
    
    // Simple regex test function to simulate middleware matcher behavior
    function testPath(path: string, pattern: string): boolean {
      try {
        // Convert Next.js matcher pattern to a JavaScript-compatible regex
        // This is a simplified version of Next.js's actual matcher logic
        const regexStr = pattern
          .replace(/\(/, '(?:')  // Convert capture groups to non-capturing
          .replace(/\)/, ')')
          .replace(/\/\*$/, '(?:/.*)?'); // Handle trailing wildcards
        
        const regex = new RegExp(`^${regexStr}$`);
        return regex.test(path);
      } catch (e) {
        console.error('Invalid regex pattern:', e);
        return false;
      }
    }
    
    // For locale paths, they should NOT match
    for (const path of localePathsToTest) {
      const matches = testPath(path, mainPattern);
      expect(matches).toBe(false);
    }
    
    // Test paths that SHOULD match (no locale prefix)
    const shouldMatchPaths = [
      '/about',
      '/products/123',
      '/checkout',
      '/contact-us'
    ];
    
    for (const path of shouldMatchPaths) {
      const matches = testPath(path, mainPattern);
      expect(matches).toBe(true);
    }
    
    // Root path should be included separately
    expect(matcher.includes('/')).toBe(true);
  });
  
  it('should include root path when configured', () => {
    const matcherWithRoot = createMiddlewareMatcher({
      locales,
      includeRoot: true
    });
    
    const matcherWithoutRoot = createMiddlewareMatcher({
      locales,
      includeRoot: false
    });
    
    expect(matcherWithRoot.includes('/')).toBe(true);
    expect(matcherWithoutRoot.includes('/')).toBe(false);
  });
  
  it('should handle additional exclude paths', () => {
    const customExcludePaths = ['foo', 'bar', 'baz'];
    const matcher = createMiddlewareMatcher({
      locales,
      excludePaths: customExcludePaths,
      includeRoot: true
    });
    
    const mainPattern = matcher[0];
    
    // Simple check to see if the exclude paths appear in the pattern
    for (const path of customExcludePaths) {
      expect(mainPattern.includes(path)).toBe(true);
    }
  });
}); 