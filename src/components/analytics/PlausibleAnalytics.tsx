'use client';

/**
 * @fileoverview Consent-gated Plausible Analytics wrapper
 * @module components/analytics/PlausibleAnalytics
 * @see BLOCK9.3_TRANSPARENCY_FRAMEWORK.md
 *
 * Compliance:
 * - GDPR Art. 6(1)(a): Analytics only loaded after explicit consent
 * - Plausible is cookieless and privacy-first by design
 * - EU-hosted, no personal data collected without consent
 */

import { useEffect } from 'react';

import { useConsent } from '@/hooks/use-consent';
import { ConsentCategory } from '@/types/consent';

interface PlausibleAnalyticsProps {
  domain?: string;
  apiHost?: string;
  trackLocalhost?: boolean;
}

/**
 * Plausible Analytics component with consent gating
 * Only loads analytics script if user has consented to analytics category
 */
export function PlausibleAnalytics({
  domain = 'quantumpoly.ai',
  apiHost = 'https://plausible.io',
  trackLocalhost = false,
}: PlausibleAnalyticsProps) {
  const { hasConsent } = useConsent();

  // Only load analytics if user has explicitly consented
  const analyticsEnabled = hasConsent(ConsentCategory.Analytics);

  useEffect(() => {
    if (!analyticsEnabled) {
      return;
    }

    // Check if script already loaded
    if (document.querySelector('script[data-domain]')) {
      return;
    }

    // Create and inject Plausible script
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = domain;
    script.dataset.api = `${apiHost}/api/event`;
    script.src = `${apiHost}/js/script.js`;

    // Add localhost tracking if enabled
    if (trackLocalhost) {
      script.dataset.trackLocalhost = 'true';
    }

    // Respect Do Not Track
    if (navigator.doNotTrack === '1') {
      return;
    }

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const existingScript = document.querySelector('script[data-domain]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [analyticsEnabled, domain, apiHost, trackLocalhost]);

  // Component renders nothing (script injection only)
  return null;
}

/**
 * Track custom event in Plausible
 * Only tracks if consent is given and Plausible is loaded
 */
export function trackPlausibleEvent(eventName: string, props?: Record<string, string | number>) {
  if (typeof window === 'undefined') {
    return;
  }

  // Check if Plausible is loaded
  const plausible = (window as unknown as Record<string, unknown>).plausible;
  if (typeof plausible !== 'function') {
    return;
  }

  // Track event
  plausible(eventName, { props });
}

/**
 * Hook for tracking Plausible events
 */
export function usePlausibleTracking() {
  const { hasConsent } = useConsent();
  const analyticsEnabled = hasConsent(ConsentCategory.Analytics);

  const trackEvent = (eventName: string, props?: Record<string, string | number>) => {
    if (!analyticsEnabled) {
      return;
    }
    trackPlausibleEvent(eventName, props);
  };

  return { trackEvent, analyticsEnabled };
}

