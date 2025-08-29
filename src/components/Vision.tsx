'use client';

import React from 'react';
import { VisionProps, VisionPillar } from '../types/components';
import { useTranslations } from 'next-intl';

/**
 * Vision Section Component
 *
 * Displays company vision pillars with:
 * - Accessible card-based layout
 * - Keyboard navigation support
 * - Screen reader optimization
 * - Responsive grid system
 * - Theme-aware styling
 * - Interactive hover states
 * - Semantic markup structure
 *
 * @param props - Vision component props
 * @returns JSX.Element - Rendered vision section
 */

// Default vision pillars are computed within the component to avoid hook usage at module scope

export default function Vision({
  title = 'Our Vision',
  pillars,
  className = '',
  id = 'vision-section',
  ...props
}: VisionProps) {
  const t = useTranslations('vision');
  const defaultPillars: VisionPillar[] = [
    { icon: '🌐', title: 'Artificial Intelligence', description: 'Harnessing neural networks to solve complex challenges.' },
    { icon: '🌱', title: 'Sustainability', description: 'Innovations that advance planetary health for everyone.' },
    { icon: '🕶️', title: 'Metaverse Integration', description: 'Designing immersive experiences that blend realities.' },
  ];
  const computedPillars: VisionPillar[] = Array.isArray(pillars) ? pillars : defaultPillars;
  // REVIEW: Consider adding animation based on intersection observer
  // FEEDBACK: Should we add expandable detail views for each pillar?

  const handlePillarClick = (pillar: VisionPillar, index: number) => {
    // DISCUSS: Add analytics tracking for pillar interactions
    if (pillar.href) {
      window.open(pillar.href, '_blank', 'noopener noreferrer');
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent,
    pillar: VisionPillar,
    index: number
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handlePillarClick(pillar, index);
    }
  };

  return (
    <section
      id={id}
      className={`bg-gradient-to-b from-gray-100 to-gray-200 px-4 py-16 transition-colors duration-300 sm:py-20 md:px-6 dark:from-gray-900 dark:to-black ${className}`}
      aria-labelledby={`${id}-heading`}
      role="region"
      {...props}
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id={`${id}-heading`}
          className="cyberpunk-glow mb-12 rounded-lg text-center text-2xl font-bold text-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 sm:mb-16 sm:text-3xl md:text-4xl dark:text-cyan-400"
          tabIndex={0}
        >
          {title}
        </h2>

        <div
          className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3"
          role="list"
          aria-label="Vision pillars"
        >
          {computedPillars.map((pillar, index) => (
            <div
              key={index}
              className={`cyberpunk-border relative flex transform flex-col items-center rounded-lg bg-white/80 p-6 text-center transition-all duration-300 focus-within:z-10 focus-within:scale-105 focus-within:shadow-lg hover:z-10 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 sm:p-8 dark:bg-black/50 dark:hover:shadow-cyan-400/20 ${pillar.href ? 'cursor-pointer' : ''}`}
              role="listitem"
              tabIndex={pillar.href ? 0 : -1}
              onClick={() => handlePillarClick(pillar, index)}
              onKeyDown={e => handleKeyDown(e, pillar, index)}
              aria-label={`${pillar.title}: ${pillar.description}${pillar.href ? ' (clickable)' : ''}`}
            >
              {/* Icon */}
              <div
                className="mb-4 text-4xl sm:text-6xl"
                role="presentation"
                aria-hidden="true"
              >
                {pillar.icon}
              </div>

              {/* Title */}
              <h3
                className="mb-4 text-lg font-bold text-cyan-700 transition-colors duration-300 sm:text-xl dark:text-cyan-300"
                id={`pillar-${index}-title`}
              >
                {pillar.title}
              </h3>

              {/* Description */}
              <p
                className="text-sm leading-relaxed text-gray-600 transition-colors duration-300 sm:text-base dark:text-gray-400"
                aria-describedby={`pillar-${index}-title`}
              >
                {pillar.description}
              </p>

              {/* Decorative accent bar */}
              <div
                className="absolute -bottom-3 left-1/2 h-1 w-1/4 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300 group-hover:w-1/2 dark:from-cyan-400 dark:to-purple-400"
                aria-hidden="true"
              />

              {/* Link indicator */}
              {pillar.href && (
                <div className="sr-only">
                  Press Enter or Space to learn more about {pillar.title}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Screen reader navigation aid */}
        <div className="sr-only" aria-live="polite">
          End of vision pillars section. {Array.isArray(pillars) ? pillars.length : computedPillars.length} pillars displayed.
        </div>
      </div>
    </section>
  );
}
