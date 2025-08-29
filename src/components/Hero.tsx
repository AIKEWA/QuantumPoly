'use client';

import React from 'react';
import { HeroProps } from '../types/components';
import { useTranslations } from 'next-intl';

/**
 * Hero Section Component
 *
 * A fully accessible and internationalized hero section with:
 * - Semantic HTML structure
 * - ARIA attributes for screen readers
 * - Dark/light theme support via Tailwind
 * - Customizable content through props
 * - Focus management and keyboard navigation
 *
 * @param props - Hero component props
 * @returns JSX.Element - Rendered hero section
 */
export default function Hero({
  title,
  subtitle,
  ctaText,
  onCtaClick,
  scrollIndicatorLabel,
  className = '',
  id = 'hero-section',
  ...props
}: HeroProps) {
  // Get translations with fallbacks
  const t = useTranslations('hero');
  const displayTitle = title || t('title');
  const displaySubtitle = subtitle || t('subtitle');
  const displayCta = ctaText || t('cta');
  const displayScrollLabel = scrollIndicatorLabel || t('scrollIndicator');

  // FEEDBACK: Consider adding animation preferences detection for reduced motion
  const handleCtaClick = () => {
    // REVIEW: Should we add analytics tracking here?
    if (onCtaClick) {
      onCtaClick();
    }
  };

  const handleScrollClick = () => {
    // Smooth scroll to next section
    const nextSection = document.querySelector(
      '#about-section, section:nth-of-type(2)'
    );
    if (nextSection) {
      nextSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <section
      id={id}
      className={`relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-black px-4 text-center md:px-6 dark:from-black dark:via-gray-900 dark:to-gray-800 ${className}`}
      role="banner"
      aria-label="Hero section with company introduction"
      {...props}
    >
      {/* Background overlay with theme support */}
      <div
        className="absolute inset-0 z-0 bg-gradient-to-b from-black/30 via-gray-900/50 to-transparent dark:from-black/50 dark:via-gray-900/70 dark:to-transparent"
        aria-hidden="true"
      />

      {/* Main content */}
      <div className="z-10 mx-auto max-w-4xl" role="main">
        <h1
          id="page-title"
          className="cyberpunk-glow mb-4 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-4xl font-bold text-transparent focus:outline-none focus:ring-4 focus:ring-cyan-500/50 sm:text-6xl md:text-8xl dark:from-cyan-300 dark:to-purple-400"
          tabIndex={0}
          aria-label={`${displayTitle} - Company name`}
        >
          {displayTitle}
        </h1>

        <p
          className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-gray-300 sm:text-xl md:text-2xl dark:text-gray-200"
          aria-describedby="hero-description"
        >
          {displaySubtitle}
        </p>

        <button
          onClick={handleCtaClick}
          className="cyberpunk-border transform rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:scale-105 hover:from-cyan-400 hover:to-blue-500 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 active:scale-95 sm:px-8 sm:py-4 dark:from-cyan-400 dark:to-blue-500 dark:hover:from-cyan-300 dark:hover:to-blue-400"
          type="button"
          aria-describedby="cta-description"
        >
          {displayCta}
        </button>

        {/* Hidden description for screen readers */}
        <div id="cta-description" className="sr-only">
          Call to action button to learn more about QuantumPoly
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
        <button
          onClick={handleScrollClick}
          className="animate-bounce rounded-full p-2 transition-colors duration-300 hover:bg-cyan-500/20 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 dark:hover:bg-cyan-400/20"
          aria-hidden="true"
          tabIndex={-1}
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-cyan-400 sm:h-10 sm:w-10 dark:text-cyan-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
