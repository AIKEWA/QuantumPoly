/**
 * @fileoverview Provider-agnostic analytics adapter
 * @module lib/analytics
 * @see BLOCK9.3_TRANSPARENCY_FRAMEWORK.md
 *
 * Unified interface for multi-provider analytics system
 * Supports Vercel Analytics and Plausible Analytics
 */

import { ANALYTICS_CONFIG, getActiveProviders } from '../../config/analytics.mjs';

/**
 * Analytics event types for governance tracking
 */
export enum AnalyticsEvent {
  // Consent events
  ConsentGiven = 'consent_given',
  ConsentRevoked = 'consent_revoked',
  ConsentUpdated = 'consent_updated',

  // Dashboard events
  DashboardView = 'dashboard_view',
  LedgerVerification = 'ledger_verification',
  EIIChartView = 'eii_chart_view',

  // Policy events
  PolicyView = 'policy_view',
  PrivacyPolicyView = 'privacy_policy_view',
  ImprintView = 'imprint_view',

  // Governance events
  GovernancePageView = 'governance_page_view',
  TransparencyDashboardView = 'transparency_dashboard_view',
}

/**
 * Analytics event properties
 */
export interface AnalyticsEventProps {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track analytics event across all active providers
 * @param event Event name or enum value
 * @param props Optional event properties
 */
export function trackEvent(event: AnalyticsEvent | string, props?: AnalyticsEventProps): void {
  if (typeof window === 'undefined') {
    return;
  }

  const activeProviders = getActiveProviders();

  // Track in Vercel Analytics
  if (activeProviders.includes('vercel')) {
    trackVercelEvent(event, props);
  }

  // Track in Plausible Analytics
  if (activeProviders.includes('plausible')) {
    trackPlausibleEvent(event, props);
  }
}

/**
 * Track event in Vercel Analytics
 */
function trackVercelEvent(event: string, props?: AnalyticsEventProps): void {
  try {
    // Vercel Analytics uses the track function from @vercel/analytics
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { track } = require('@vercel/analytics');
    if (typeof track === 'function') {
      track(event, props);
    }
  } catch (error) {
    // Silently fail if Vercel Analytics is not available
    if (ANALYTICS_CONFIG.vercel.debug) {
      console.warn('Vercel Analytics tracking failed:', error);
    }
  }
}

/**
 * Track event in Plausible Analytics
 */
function trackPlausibleEvent(event: string, props?: AnalyticsEventProps): void {
  try {
    const plausible = (window as unknown as Record<string, unknown>).plausible;
    if (typeof plausible === 'function') {
      plausible(event, { props });
    }
  } catch (error) {
    // Silently fail if Plausible is not available
    if (ANALYTICS_CONFIG.plausible.enabled) {
      console.warn('Plausible Analytics tracking failed:', error);
    }
  }
}

/**
 * Track page view
 * @param path Page path
 */
export function trackPageView(path: string): void {
  trackEvent('pageview', { path });
}

/**
 * Get analytics configuration
 */
export function getAnalyticsConfig() {
  return {
    provider: ANALYTICS_CONFIG.provider,
    activeProviders: getActiveProviders(),
    consentRequired: ANALYTICS_CONFIG.consent.required,
    privacy: ANALYTICS_CONFIG.privacy,
  };
}

/**
 * Check if analytics is enabled
 */
export function isAnalyticsEnabled(): boolean {
  return getActiveProviders().length > 0;
}

/**
 * Analytics governance metadata
 */
export const ANALYTICS_METADATA = {
  blockId: '9.3',
  framework: 'Multi-Analytics Transparency Framework',
  providers: ANALYTICS_CONFIG.provider,
  compliance: ['GDPR', 'DSG 2023', 'ePrivacy Directive'],
  consentRequired: true,
  lastUpdated: '2025-10-27',
};
