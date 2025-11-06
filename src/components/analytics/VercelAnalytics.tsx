'use client';

/**
 * @fileoverview Consent-gated Vercel Analytics wrapper
 * @module components/analytics/VercelAnalytics
 * @see BLOCK9.2_CONSENT_MANAGEMENT_FRAMEWORK.md
 *
 * Compliance:
 * - GDPR Art. 6(1)(a): Analytics only loaded after explicit consent
 * - Vercel Analytics is cookie-free and GDPR-compliant by design
 * - No personal data collected without consent
 */

import { Analytics } from '@vercel/analytics/react';

import { useConsent } from '@/hooks/use-consent';
import { ConsentCategory } from '@/types/consent';

/**
 * Vercel Analytics component with consent gating
 * Only renders analytics script if user has consented to analytics category
 */
export function VercelAnalytics() {
  const { hasConsent } = useConsent();

  // Only load analytics if user has explicitly consented
  const analyticsEnabled = hasConsent(ConsentCategory.Analytics);

  if (!analyticsEnabled) {
    return null;
  }

  return <Analytics />;
}

