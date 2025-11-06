/**
 * @fileoverview Multi-Analytics Configuration System
 * @module config/analytics
 * @see BLOCK9.3_TRANSPARENCY_FRAMEWORK.md
 *
 * Dual-provider analytics architecture:
 * - Vercel Analytics: Operational metrics (performance, traffic)
 * - Plausible Analytics: Privacy-first, EU-hosted ethical analytics
 *
 * Both providers are consent-gated per GDPR Art. 6(1)(a)
 */

/**
 * Analytics provider types
 * @typedef {'vercel' | 'plausible' | 'both' | 'none'} AnalyticsProvider
 */

/**
 * Analytics configuration
 */
export const ANALYTICS_CONFIG = {
  /**
   * Primary analytics provider
   * @type {AnalyticsProvider}
   * 
   * Options:
   * - 'vercel': Vercel Analytics only (default)
   * - 'plausible': Plausible Analytics only
   * - 'both': Both providers (for comparative research)
   * - 'none': Disable all analytics
   */
  provider: process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || 'vercel',

  /**
   * Vercel Analytics configuration
   */
  vercel: {
    enabled: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED !== 'false',
    debug: process.env.NODE_ENV === 'development',
  },

  /**
   * Plausible Analytics configuration
   */
  plausible: {
    enabled: process.env.NEXT_PUBLIC_PLAUSIBLE_ENABLED === 'true',
    domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'quantumpoly.ai',
    apiHost: process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST || 'https://plausible.io',
    trackLocalhost: process.env.NODE_ENV === 'development',
    // Custom events for ethical governance tracking
    customEvents: {
      consentGiven: 'Consent: Given',
      consentRevoked: 'Consent: Revoked',
      consentUpdated: 'Consent: Updated',
      dashboardView: 'Dashboard: View',
      ledgerVerification: 'Ledger: Verification',
      policyView: 'Policy: View',
    },
  },

  /**
   * Consent requirements
   * Both providers require explicit user consent per GDPR
   */
  consent: {
    required: true,
    category: 'analytics', // Maps to ConsentCategory.Analytics
  },

  /**
   * Data retention and privacy
   */
  privacy: {
    anonymizeIP: true,
    respectDNT: true, // Respect Do Not Track
    cookieless: true, // Both providers are cookieless
  },
};

/**
 * Check if a specific provider is enabled
 * @param {'vercel' | 'plausible'} provider
 * @returns {boolean}
 */
export function isProviderEnabled(provider) {
  const config = ANALYTICS_CONFIG;
  
  if (config.provider === 'none') {
    return false;
  }
  
  if (config.provider === 'both') {
    return provider === 'vercel' ? config.vercel.enabled : config.plausible.enabled;
  }
  
  return config.provider === provider;
}

/**
 * Get active analytics providers
 * @returns {Array<'vercel' | 'plausible'>}
 */
export function getActiveProviders() {
  const providers = [];
  
  if (isProviderEnabled('vercel')) {
    providers.push('vercel');
  }
  
  if (isProviderEnabled('plausible')) {
    providers.push('plausible');
  }
  
  return providers;
}

/**
 * Governance metadata for Block 9.3
 */
export const ANALYTICS_GOVERNANCE = {
  blockId: '9.3',
  title: 'Multi-Analytics Framework',
  compliance: ['GDPR Art. 6(1)(a)', 'DSG 2023 Art. 6', 'ePrivacy Directive Art. 5(3)'],
  consentRequired: true,
  dataProcessors: [
    {
      name: 'Vercel Inc.',
      location: 'United States',
      safeguards: 'Standard Contractual Clauses (SCCs)',
      purpose: 'Web analytics and performance monitoring',
    },
    {
      name: 'Plausible Analytics',
      location: 'European Union',
      safeguards: 'EU-based, GDPR-compliant by design',
      purpose: 'Privacy-first web analytics',
    },
  ],
  lastReview: '2025-10-27',
  nextReview: '2026-04-27',
};

export default ANALYTICS_CONFIG;

