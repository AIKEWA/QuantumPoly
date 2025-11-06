/**
 * @fileoverview Type definitions for GDPR/DSG-compliant consent management
 * @module types/consent
 * @see BLOCK9.2_CONSENT_MANAGEMENT_FRAMEWORK.md
 */

/**
 * Consent categories as defined in GDPR Art. 6 and 7
 */
export enum ConsentCategory {
  /** Always enabled - technically necessary for website operation */
  Essential = 'essential',
  /** Optional - Vercel Analytics (cookieless, GDPR-compliant) */
  Analytics = 'analytics',
  /** Optional - Performance monitoring and optimization tools */
  Performance = 'performance',
}

/**
 * User consent preferences for each category
 */
export interface ConsentPreferences {
  /** Always true - cannot be disabled */
  [ConsentCategory.Essential]: true;
  /** User opt-in for analytics */
  [ConsentCategory.Analytics]: boolean;
  /** User opt-in for performance monitoring */
  [ConsentCategory.Performance]: boolean;
}

/**
 * Consent state with metadata for audit trail
 */
export interface ConsentState {
  /** User consent preferences */
  preferences: ConsentPreferences;
  /** ISO-8601 timestamp of consent decision */
  timestamp: string;
  /** Privacy Policy version at time of consent (e.g., "v1.0.0") */
  policyVersion: string;
  /** Pseudonymized user identifier (UUID v4) */
  userId: string;
  /** Whether user has made an explicit choice */
  hasConsented: boolean;
}

/**
 * Consent event types for audit logging
 */
export enum ConsentEventType {
  /** Initial consent given */
  ConsentGiven = 'consent_given',
  /** Consent preferences updated */
  ConsentUpdated = 'consent_updated',
  /** Consent withdrawn/revoked */
  ConsentRevoked = 'consent_revoked',
  /** Consent banner dismissed without choice */
  BannerDismissed = 'banner_dismissed',
}

/**
 * Consent event record for governance ledger
 * Complies with GDPR Art. 7(1) - demonstrable consent requirement
 */
export interface ConsentEvent {
  /** Pseudonymized user ID */
  userId: string;
  /** ISO-8601 timestamp */
  timestamp: string;
  /** Type of consent event */
  event: ConsentEventType;
  /** Consent preferences at time of event */
  preferences: ConsentPreferences;
  /** Privacy Policy version */
  policyVersion: string;
  /** User agent string (for audit purposes) */
  userAgent?: string;
  /** IP address (anonymized, for abuse prevention) */
  ipAddress?: string;
}

/**
 * API request payload for recording consent
 */
export interface ConsentRecordRequest {
  userId: string;
  event: ConsentEventType;
  preferences: ConsentPreferences;
  policyVersion: string;
  userAgent?: string;
}

/**
 * API response for consent recording
 */
export interface ConsentRecordResponse {
  success: boolean;
  message: string;
  recordedAt: string;
}

/**
 * Consent history entry for user display (GDPR Art. 15 - right to access)
 */
export interface ConsentHistoryEntry {
  timestamp: string;
  event: ConsentEventType;
  preferences: ConsentPreferences;
  policyVersion: string;
}

/**
 * Current Privacy Policy version
 * Must match version in content/policies/privacy/en.md frontmatter
 */
export const PRIVACY_POLICY_VERSION = 'v1.0.0';

/**
 * Default consent preferences (all optional categories disabled)
 */
export const DEFAULT_CONSENT_PREFERENCES: ConsentPreferences = {
  [ConsentCategory.Essential]: true,
  [ConsentCategory.Analytics]: false,
  [ConsentCategory.Performance]: false,
};

/**
 * localStorage key for consent state persistence
 */
export const CONSENT_STORAGE_KEY = 'quantumpoly_consent';

/**
 * Consent state version for migration logic
 */
export const CONSENT_STATE_VERSION = 1;

