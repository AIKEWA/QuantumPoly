/**
 * Middleware Matcher Visualizer
 * 
 * A development utility to help visualize and test Next.js middleware matcher patterns.
 * This tool helps developers understand which paths will trigger middleware execution.
 */

type VisualizerResult = {
  path: string;
  matches: boolean;
  pattern: string;
  reason: string;
};

/**
 * Tests if a path matches a Next.js middleware matcher pattern
 */
export function testPathAgainstPattern(path: string, pattern: string): boolean {
  try {
    // Convert Next.js matcher pattern to a JavaScript-compatible regex
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

/**
 * Visualizes which paths match middleware patterns
 */
export function visualizeMiddlewareMatcher(
  patterns: string[], 
  pathsToTest: string[]
): VisualizerResult[] {
  return pathsToTest.map(path => {
    // Check against each pattern
    for (const pattern of patterns) {
      const matches = testPathAgainstPattern(path, pattern);
      if (matches) {
        return {
          path,
          matches: true,
          pattern,
          reason: `Matched pattern: ${pattern}`
        };
      }
    }
    
    // If we get here, no patterns matched
    return {
      path,
      matches: false,
      pattern: 'none',
      reason: 'No patterns matched'
    };
  });
}

/**
 * Creates a HTML report of middleware matcher visualization
 */
export function createMatcherReport(
  patterns: string[], 
  pathsToTest: string[]
): string {
  const results = visualizeMiddlewareMatcher(patterns, pathsToTest);
  
  // Generate HTML
  let html = `
    <html>
      <head>
        <title>Middleware Matcher Visualization</title>
        <style>
          body { font-family: system-ui, sans-serif; margin: 2rem; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          tr.match { background-color: #e6ffe6; }
          tr.no-match { background-color: #ffe6e6; }
          .patterns { margin-bottom: 2rem; font-family: monospace; }
          .pattern { background-color: #f0f0f0; padding: 0.5rem; margin: 0.5rem 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>Middleware Matcher Visualization</h1>
        
        <div class="patterns">
          <h2>Matcher Patterns</h2>
          ${patterns.map(p => `<div class="pattern">${p}</div>`).join('')}
        </div>
        
        <h2>Path Matching Results</h2>
        <table>
          <tr>
            <th>Path</th>
            <th>Matches</th>
            <th>Matched Pattern</th>
            <th>Reason</th>
          </tr>
          ${results.map(result => `
            <tr class="${result.matches ? 'match' : 'no-match'}">
              <td>${result.path}</td>
              <td>${result.matches ? '✅' : '❌'}</td>
              <td>${result.pattern}</td>
              <td>${result.reason}</td>
            </tr>
          `).join('')}
        </table>
      </body>
    </html>
  `;
  
  return html;
}

/**
 * Example usage in development:
 * 
 * import { createMatcherReport } from './utils/middlewareMatcherVisualizer';
 * import fs from 'fs';
 * 
 * // Your middleware patterns
 * const patterns = [
 *   '/((?!api|_next|_vercel|en|de|fr|.*\\.[^/]+$).*)',
 *   '/'
 * ];
 * 
 * // Paths to test
 * const paths = [
 *   '/',
 *   '/about',
 *   '/en',
 *   '/en/about',
 *   '/api/data',
 *   '/image.jpg'
 * ];
 * 
 * // Generate report
 * const report = createMatcherReport(patterns, paths);
 * 
 * // Write to file
 * fs.writeFileSync('./middleware-matcher-report.html', report);
 * console.log('Report generated at ./middleware-matcher-report.html');
 */ 