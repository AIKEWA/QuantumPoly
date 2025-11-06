'use client';

/**
 * @fileoverview Consent management wrapper component
 * @module components/consent/ConsentManager
 * @see BLOCK9.2_CONSENT_MANAGEMENT_FRAMEWORK.md
 *
 * Orchestrates consent banner and modal display
 */

import { useState } from 'react';

import { ConsentBanner } from './ConsentBanner';
import { ConsentModal } from './ConsentModal';

interface ConsentManagerProps {
  locale: string;
}

/**
 * Consent manager component
 * Coordinates banner and modal interactions
 */
export function ConsentManager({ locale }: ConsentManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ConsentBanner locale={locale} onOpenSettings={() => setIsModalOpen(true)} />
      <ConsentModal locale={locale} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

