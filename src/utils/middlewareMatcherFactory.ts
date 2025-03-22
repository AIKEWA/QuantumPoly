/**
 * Middleware Matcher Factory
 * 
 * This utility generates the appropriate middleware matcher configuration 
 * to ensure that middleware only runs on paths that need locale detection
 * and redirects, not on paths that already have locale prefixes.
 */

type MatcherOptions = {
  locales: string[];
  excludePaths?: string[];
  includeRoot?: boolean;
  includeExplicitLocalePaths?: boolean;
};

/**
 * Generates a matcher configuration for Next.js middleware
 * that excludes paths with locale prefixes and specified exclude paths,
 * but includes the root path if specified.
 * 
 * @param options Configuration options
 * @returns Array of matcher patterns for middleware config
 */
export function createMiddlewareMatcher({
  locales,
  excludePaths = ['api', '_next'],
  includeRoot = true,
  includeExplicitLocalePaths = false,
}: MatcherOptions): string[] {
  // Always exclude static files and specified paths
  const excludePatterns = [
    ...excludePaths,
    '.*\\..*', // Static files (contains a dot)
  ];

  // Base patterns array that will hold all our matchers
  const patterns: string[] = [];
  
  // Include root path if specified - most critical match
  if (includeRoot) {
    patterns.push('/');
  }
  
  // Option to explicitly include exact locale paths to ensure 
  // they're properly handled when a direct locale URL is entered
  if (includeExplicitLocalePaths) {
    locales.forEach(locale => {
      patterns.push(`/${locale}`);
      patterns.push(`/${locale}/`);
    });
  }

  // Create the main pattern to match paths without locale prefixes
  // or excluded patterns
  const allExcludePatterns = [...excludePatterns, ...locales];
  const negatedPattern = `/((?!${allExcludePatterns.join('|')}).*)`; 
  patterns.push(negatedPattern);
  
  return patterns;
}

/**
 * Example usage:
 * 
 * export const config = {
 *   matcher: createMiddlewareMatcher({ 
 *     locales: ['en', 'de', 'fr'],
 *     excludePaths: ['api', '_next', 'assets'],
 *     includeRoot: true,
 *     includeExplicitLocalePaths: true
 *   })
 * };
 */ 