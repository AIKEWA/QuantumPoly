/**
 * Redirect Visualizer
 * 
 * A development tool that visualizes the redirect history and flow
 * as a flowchart-like diagram in the browser console.
 */

import { RedirectHistoryEntry } from './redirectTypes';

interface VisualizeOptions {
  showTimings?: boolean;
  colorize?: boolean;
  showUserAgent?: boolean;
}

/**
 * Formats a URL for display, removing long query parameters
 */
function formatUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const params = Array.from(urlObj.searchParams.entries())
      .map(([key, value]) => `${key}=${value.length > 10 ? value.substring(0, 10) + '...' : value}`)
      .join('&');
    
    return `${urlObj.pathname}${params ? '?' + params : ''}`;
  } catch (e) {
    return url;
  }
}

/**
 * Generates ANSI color codes for console output
 */
function getColor(index: number, isRedirect = true): string {
  if (typeof window === 'undefined') {
    // Server-side, use ANSI colors
    const colors = [
      '\x1b[32m', // Green
      '\x1b[36m', // Cyan
      '\x1b[35m', // Magenta
      '\x1b[33m', // Yellow
      '\x1b[31m', // Red
    ];
    
    return isRedirect ? colors[index % colors.length] : '\x1b[90m'; // Gray for non-redirects
  } else {
    // Browser console, use CSS colors
    const colors = [
      'color: green',
      'color: blue',
      'color: purple',
      'color: orange',
      'color: red',
    ];
    
    return isRedirect ? colors[index % colors.length] : 'color: gray';
  }
}

/**
 * Visualizes redirect history as a flowchart in the console
 */
export function visualizeRedirects(
  history: RedirectHistoryEntry[],
  options: VisualizeOptions = {}
): void {
  const { showTimings = true, colorize = true, showUserAgent = false } = options;
  
  if (!history || history.length === 0) {
    console.log('No redirect history to visualize');
    return;
  }
  
  // Calculate timing information
  const startTime = history[0].timestamp;
  let totalTime = 0;
  
  if (history.length > 1) {
    totalTime = history[history.length - 1].timestamp - startTime;
  }
  
  // Header
  console.log('\n📊 REDIRECT FLOW VISUALIZATION');
  console.log(`Total redirects: ${history.length}`);
  if (showTimings && totalTime > 0) {
    console.log(`Total time: ${totalTime}ms`);
  }
  
  // Browser info
  if (showUserAgent && history[0].userAgent) {
    console.log(`Browser: ${history[0].userAgent}`);
  }
  
  console.log('\n');
  
  // Draw the flow
  history.forEach((entry, index) => {
    const isLast = index === history.length - 1;
    const resetColor = typeof window === 'undefined' ? '\x1b[0m' : '';
    const color = colorize ? getColor(index, entry.type === 'redirect') : '';
    const prefix = isLast ? '└─' : '├─';
    
    // Format timing
    let timing = '';
    if (showTimings && index > 0) {
      const timeDiff = entry.timestamp - history[index - 1].timestamp;
      timing = `(+${timeDiff}ms)`;
    }
    
    // Entry message
    let message = `${prefix} [${index + 1}] `;
    
    // Different handling based on redirect type
    if (entry.type === 'redirect') {
      message += `Redirect to ${formatUrl(entry.target)} - ${entry.reason} ${timing}`;
    } else {
      message += `Request to ${formatUrl(entry.url)} ${timing}`;
    }
    
    // Log with or without colors
    if (colorize && typeof window === 'undefined') {
      console.log(`${color}${message}${resetColor}`);
    } else if (colorize && typeof window !== 'undefined') {
      console.log(`%c${message}`, color);
    } else {
      console.log(message);
    }
    
    // Draw connector line except for last item
    if (!isLast) {
      console.log(colorize && typeof window === 'undefined' 
        ? `${getColor(index, false)}│${resetColor}` 
        : '│');
    }
  });
  
  console.log('\n');
}

/**
 * Parses redirect history from cookies or local storage
 */
export function getRedirectHistoryFromStorage(): RedirectHistoryEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const historyString = localStorage.getItem('redirect-history');
    if (!historyString) return [];
    
    return JSON.parse(historyString) as RedirectHistoryEntry[];
  } catch (e) {
    console.error('Failed to parse redirect history:', e);
    return [];
  }
}

/**
 * Renders a visual representation of the redirect flow
 * This can be called from the browser console
 */
export function showRedirectFlow(): void {
  const history = getRedirectHistoryFromStorage();
  visualizeRedirects(history, { 
    showTimings: true, 
    colorize: true,
    showUserAgent: true
  });
}

// Add to window object for console access
if (typeof window !== 'undefined') {
  (window as any).showRedirectFlow = showRedirectFlow;
} 