'use client';

import React from 'react';

export interface HeroCtaClientProps {
  /** Label for the call-to-action button */
  ctaLabel: string;
  /** Additional CSS classes */
  className?: string;
  /** Target element ID to scroll to (defaults to scrolling to bottom) */
  targetId?: string;
}

/**
 * Client-side CTA button component for Hero section.
 * Handles smooth scrolling behavior that requires client-side JavaScript.
 * Respects user's reduced motion preference for accessibility.
 */
export function HeroCtaClient({ ctaLabel, className, targetId }: HeroCtaClientProps) {
  const handleCtaClick = () => {
    // Check for reduced motion preference (with fallback for environments without matchMedia)
    const prefersReduced =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    if (targetId) {
      const el = document.getElementById(targetId);
      if (!el) return;
      el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    } else {
      // Fallback to scrolling to bottom
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: prefersReduced ? 'auto' : 'smooth',
      });
    }
  };

  return (
    <button
      type="button"
      className={
        className ||
        'rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 font-medium text-white transition-all hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus-visible:ring focus-visible:ring-cyan-300'
      }
      onClick={handleCtaClick}
    >
      {ctaLabel}
    </button>
  );
}
