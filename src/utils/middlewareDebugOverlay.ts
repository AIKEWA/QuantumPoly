/**
 * Middleware Debug Overlay Utility
 * 
 * This utility provides a visual overlay for debugging middleware 
 * execution in development environments.
 * 
 * Usage:
 * 1. Import and enable in middleware.ts for development environment
 * 2. Add the overlay component to your layout.tsx
 */

import { NextRequest, NextResponse } from 'next/server';
import { middlewareMatcherConfig } from './generatedMatcher';

// Constants
const MIDDLEWARE_DEBUG = process.env.NODE_ENV === 'development';
const HEADER_PREFIX = 'x-middleware-debug';

type DebugInfo = {
  detectedLocale?: string;
  redirectCount?: number;
  redirectReason?: string;
  redirectTarget?: string;
  matcherInfo?: {
    patterns: string[];
    matched: boolean;
  };
  processingTime?: number;
  redirectHistory?: Array<{
    from: string;
    to: string;
    timestamp: number;
    reason: string;
  }>;
  loopDetected?: boolean;
  isRaceCondition?: boolean;
  isSafari?: boolean;
};

/**
 * Injects debug information into the response for development debugging
 */
export function injectDebugInfo(
  request: NextRequest,
  response: NextResponse,
  debugInfo: DebugInfo
): NextResponse {
  if (process.env.NODE_ENV !== 'development') {
    return response;
  }

  // Get the HTML content
  const html = response.clone().text();

  // Create debug overlay HTML
  const now = new Date();
  const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  
  // Add matcher information
  const matcherPatterns = middlewareMatcherConfig.matcher;
  debugInfo.matcherInfo = {
    patterns: Array.isArray(matcherPatterns) ? matcherPatterns : [],
    matched: true, // If middleware is running, it matched
  };

  const debugOverlay = `
    <div id="middleware-debug-overlay" style="
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      color: #fff;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      z-index: 9999;
      max-height: 30vh;
      overflow-y: auto;
    ">
      <div style="margin-bottom: 10px; display: flex; justify-content: space-between;">
        <strong>Middleware Debug</strong>
        <span>${timestamp}</span>
        <button onclick="document.getElementById('middleware-debug-overlay').style.display='none'" 
          style="background: none; border: none; color: white; cursor: pointer;">✕</button>
      </div>
      <div style="display: grid; grid-template-columns: 150px auto; gap: 5px;">
        <div><strong>URL:</strong></div>
        <div>${request.url}</div>
        
        <div><strong>Path:</strong></div>
        <div>${request.nextUrl.pathname}</div>
        
        <div><strong>Detected Locale:</strong></div>
        <div>${debugInfo.detectedLocale || 'N/A'}</div>
        
        <div><strong>Redirect Count:</strong></div>
        <div>${debugInfo.redirectCount !== undefined ? debugInfo.redirectCount : 'N/A'}</div>
        
        <div><strong>Redirect Reason:</strong></div>
        <div>${debugInfo.redirectReason || 'N/A'}</div>
        
        <div><strong>Redirect Target:</strong></div>
        <div>${debugInfo.redirectTarget || 'N/A'}</div>
        
        <div><strong>Processing Time:</strong></div>
        <div>${debugInfo.processingTime !== undefined ? `${debugInfo.processingTime}ms` : 'N/A'}</div>
        
        <div><strong>Loop Detected:</strong></div>
        <div>${debugInfo.loopDetected ? '<span style="color:#ff6b6b">Yes</span>' : 'No'}</div>
        
        <div><strong>Race Condition:</strong></div>
        <div>${debugInfo.isRaceCondition ? '<span style="color:#ff6b6b">Yes</span>' : 'No'}</div>
        
        <div><strong>Safari Browser:</strong></div>
        <div>${debugInfo.isSafari ? '<span style="color:#ffdd59">Yes</span>' : 'No'}</div>
      </div>

      <div style="margin-top: 10px;">
        <strong>Matcher Patterns:</strong>
        <ul style="margin: 5px 0; padding-left: 20px;">
          ${debugInfo.matcherInfo?.patterns.map(pattern => 
            `<li>${pattern}</li>`
          ).join('') || 'N/A'}
        </ul>
      </div>
      
      ${debugInfo.redirectHistory ? `
        <div style="margin-top: 10px;">
          <strong>Redirect History:</strong>
          <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
            <thead>
              <tr style="border-bottom: 1px solid #555;">
                <th style="text-align: left; padding: 3px;">From</th>
                <th style="text-align: left; padding: 3px;">To</th>
                <th style="text-align: left; padding: 3px;">Reason</th>
                <th style="text-align: left; padding: 3px;">Time</th>
              </tr>
            </thead>
            <tbody>
              ${debugInfo.redirectHistory.map(entry => `
                <tr style="border-bottom: 1px solid #333;">
                  <td style="padding: 3px;">${entry.from}</td>
                  <td style="padding: 3px;">${entry.to}</td>
                  <td style="padding: 3px;">${entry.reason}</td>
                  <td style="padding: 3px;">${new Date(entry.timestamp).toLocaleTimeString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
    </div>
  `;

  // Inject the debug overlay before the closing body tag
  html.then(content => {
    const modifiedContent = content.replace('</body>', `${debugOverlay}</body>`);
    response.headers.set('Content-Type', 'text/html');
    return new NextResponse(modifiedContent, response);
  });

  return response;
}

/**
 * React component for displaying middleware debug information
 * To be used in development environment only
 * 
 * @example
 * // In your layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         {process.env.NODE_ENV === 'development' && <MiddlewareDebugOverlay />}
 *       </body>
 *     </html>
 *   );
 * }
 */
export const MiddlewareDebugOverlay = () => {
  if (typeof window === 'undefined') return null;
  
  // Implementation with React hooks would go here
  // This would extract headers, display an overlay, and provide
  // visual indication of middleware execution
  
  return null;
};

// Add a comment with instructions - the actual component would be implemented 
// in a separate React file with access to DOM and React hooks 