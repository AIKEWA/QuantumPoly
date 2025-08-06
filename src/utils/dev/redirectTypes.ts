/**
 * Redirect Types
 * 
 * Type definitions for redirect history tracking and visualization
 */

/**
 * Represents an entry in the redirect history
 */
export interface RedirectHistoryEntry {
  /** The type of entry: redirect or request */
  type: 'redirect' | 'request';
  
  /** Timestamp when this entry was recorded */
  timestamp: number;
  
  /** The URL of the request */
  url: string;
  
  /** The target URL for redirects */
  target?: string;
  
  /** The reason for the redirect */
  reason?: string;
  
  /** User agent string */
  userAgent?: string;
  
  /** Locale related to this redirect */
  locale?: string;
} 