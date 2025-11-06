'use client';

/**
 * @fileoverview React hook for client-side consent management
 * @module hooks/useConsent
 * @see BLOCK9.2_CONSENT_MANAGEMENT_FRAMEWORK.md
 */

import { useCallback, useEffect, useState } from 'react';

import {
  CONSENT_STORAGE_KEY,
  ConsentCategory,
  ConsentEventType,
  ConsentPreferences,
  ConsentState,
  DEFAULT_CONSENT_PREFERENCES,
  PRIVACY_POLICY_VERSION,
} from '@/types/consent';

/**
 * Generate or retrieve pseudonymized user ID
 * Uses UUID v4 for GDPR-compliant pseudonymization
 */
function getUserId(): string {
  const storageKey = 'quantumpoly_user_id';
  let userId = localStorage.getItem(storageKey);

  if (!userId) {
    // Generate UUID v4
    userId = crypto.randomUUID();
    localStorage.setItem(storageKey, userId);
  }

  return userId;
}

/**
 * Load consent state from localStorage
 */
function loadConsentState(): ConsentState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;

    const state = JSON.parse(stored) as ConsentState;

    // Validate state structure
    if (!state.preferences || !state.timestamp || !state.policyVersion) {
      return null;
    }

    return state;
  } catch (error) {
    console.error('Failed to load consent state:', error);
    return null;
  }
}

/**
 * Save consent state to localStorage
 */
function saveConsentState(state: ConsentState): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));

    // Emit storage event for cross-tab synchronization
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: CONSENT_STORAGE_KEY,
        newValue: JSON.stringify(state),
        storageArea: localStorage,
      }),
    );
  } catch (error) {
    console.error('Failed to save consent state:', error);
  }
}

/**
 * Record consent event via API
 */
async function recordConsentEvent(
  userId: string,
  event: ConsentEventType,
  preferences: ConsentPreferences,
): Promise<void> {
  try {
    const response = await fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        event,
        preferences,
        policyVersion: PRIVACY_POLICY_VERSION,
        userAgent: navigator.userAgent,
      }),
    });

    if (!response.ok) {
      console.error('Failed to record consent event:', response.statusText);
    }
  } catch (error) {
    console.error('Failed to record consent event:', error);
  }
}

/**
 * React hook for consent management
 * Provides consent state, update functions, and cross-tab synchronization
 */
export function useConsent() {
  const [consentState, setConsentState] = useState<ConsentState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize consent state on mount
  useEffect(() => {
    const state = loadConsentState();
    setConsentState(state);
    setIsLoading(false);
  }, []);

  // Listen for storage events (cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CONSENT_STORAGE_KEY && event.newValue) {
        try {
          const newState = JSON.parse(event.newValue) as ConsentState;
          setConsentState(newState);
        } catch (error) {
          console.error('Failed to parse consent state from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Accept all optional consent categories
   */
  const acceptAll = useCallback(async () => {
    const userId = getUserId();
    const preferences: ConsentPreferences = {
      [ConsentCategory.Essential]: true,
      [ConsentCategory.Analytics]: true,
      [ConsentCategory.Performance]: true,
    };

    const newState: ConsentState = {
      preferences,
      timestamp: new Date().toISOString(),
      policyVersion: PRIVACY_POLICY_VERSION,
      userId,
      hasConsented: true,
    };

    saveConsentState(newState);
    setConsentState(newState);

    // Record event asynchronously
    await recordConsentEvent(userId, ConsentEventType.ConsentGiven, preferences);
  }, []);

  /**
   * Reject all optional consent categories
   */
  const rejectAll = useCallback(async () => {
    const userId = getUserId();
    const preferences: ConsentPreferences = { ...DEFAULT_CONSENT_PREFERENCES };

    const newState: ConsentState = {
      preferences,
      timestamp: new Date().toISOString(),
      policyVersion: PRIVACY_POLICY_VERSION,
      userId,
      hasConsented: true,
    };

    saveConsentState(newState);
    setConsentState(newState);

    // Record event asynchronously
    await recordConsentEvent(userId, ConsentEventType.ConsentRevoked, preferences);
  }, []);

  /**
   * Update specific consent preferences
   */
  const updatePreferences = useCallback(
    async (preferences: ConsentPreferences) => {
      const userId = getUserId();
      const isFirstConsent = !consentState?.hasConsented;

      const newState: ConsentState = {
        preferences,
        timestamp: new Date().toISOString(),
        policyVersion: PRIVACY_POLICY_VERSION,
        userId,
        hasConsented: true,
      };

      saveConsentState(newState);
      setConsentState(newState);

      // Determine event type
      const eventType = isFirstConsent
        ? ConsentEventType.ConsentGiven
        : ConsentEventType.ConsentUpdated;

      // Record event asynchronously
      await recordConsentEvent(userId, eventType, preferences);
    },
    [consentState],
  );

  /**
   * Check if user has consented to a specific category
   */
  const hasConsent = useCallback(
    (category: ConsentCategory): boolean => {
      if (!consentState?.hasConsented) return false;
      return consentState.preferences[category] === true;
    },
    [consentState],
  );

  /**
   * Check if user has made any consent decision
   */
  const hasConsentDecision = consentState?.hasConsented ?? false;

  return {
    /** Current consent state (null if not yet decided) */
    consentState,
    /** Whether consent state is being loaded */
    isLoading,
    /** Whether user has made a consent decision */
    hasConsentDecision,
    /** Accept all optional categories */
    acceptAll,
    /** Reject all optional categories */
    rejectAll,
    /** Update specific preferences */
    updatePreferences,
    /** Check consent for specific category */
    hasConsent,
  };
}

