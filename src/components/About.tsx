'use client';

import React from 'react';
import { AboutProps } from '../types/components';
import { useTranslations } from 'next-intl';

/**
 * About Section Component
 *
 * A comprehensive about section featuring:
 * - Semantic HTML with proper heading hierarchy
 * - Full accessibility support with ARIA labels
 * - Responsive design with mobile-first approach
 * - Dark/light theme integration
 * - Internationalization through props
 * - Screen reader optimized content structure
 *
 * @param props - About component props
 * @returns JSX.Element - Rendered about section
 */
export default function About({
  title,
  description,
  visualAltText = 'Futuristic brain visualization representing AI and quantum computing integration',
  imageSrc,
  className = '',
  id = 'about-section',
  ...props
}: AboutProps) {
  // Get translations with fallbacks
  const t = useTranslations('about');
  const displayTitle = title || t('title');
  const displayDescription =
    description || 'QuantumPoly is a visionary AI startup';

  // REVIEW: Consider adding lazy loading for heavy visual content
  // FEEDBACK: Should we add animation on scroll detection here?

  return (
    <section
      id={id}
      className={`bg-gray-50 px-4 py-16 transition-colors duration-300 sm:py-20 md:px-6 dark:bg-black dark:bg-opacity-80 ${className}`}
      aria-labelledby={`${id}-heading`}
      role="region"
      {...props}
    >
      <h2
        id={`${id}-heading`}
        className="cyberpunk-glow mb-8 rounded-lg text-center text-2xl font-bold text-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 sm:mb-12 sm:text-3xl md:text-4xl dark:text-cyan-400"
        tabIndex={0}
      >
        {displayTitle}
      </h2>

      <div className="mx-auto max-w-6xl">
        <p
          className="mx-auto mb-8 max-w-3xl text-center text-base leading-relaxed text-gray-700 transition-colors duration-300 sm:text-lg dark:text-gray-300"
          aria-describedby={`${id}-content`}
        >
          {displayDescription}
        </p>

        <div className="flex flex-col items-center gap-8 sm:gap-12 lg:flex-row">
          {/* Content Section */}
          <div className="lg:w-1/2">
            {Array.isArray((props as any).content) && (props as any).content.length > 0 ? (
              <div aria-describedby={`${id}-content`}>
                {(props as any).content.map((paragraph: string, index: number) => (
                  <p
                    key={index}
                    className="text-base leading-relaxed text-gray-700 transition-colors duration-300 sm:text-lg dark:text-gray-300"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}

            {/* Hidden description for screen readers */}
            <div id={`${id}-content`} className="sr-only">
              Main content about QuantumPoly company mission and values
            </div>
          </div>

          {/* Visual Section */}
          <div className="mt-8 w-full max-w-md lg:mt-0 lg:w-1/2 lg:max-w-none">
            <div
              className="cyberpunk-border aspect-video rounded-lg bg-gradient-to-br from-gray-200 to-blue-200 p-1 transition-colors duration-300 hover:shadow-lg hover:shadow-cyan-500/20 dark:from-gray-900 dark:to-blue-900 dark:hover:shadow-cyan-400/20"
              {...(!imageSrc ? { role: 'img', 'aria-label': visualAltText } : {})}
            >
              <div className="flex h-full w-full items-center justify-center rounded bg-white/70 backdrop-blur-sm transition-colors duration-300 dark:bg-black/70">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={visualAltText}
                    className="h-full w-full rounded object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-center" aria-hidden="true">
                    <div
                      className="mb-4 text-4xl sm:text-6xl"
                      role="presentation"
                    >
                      🧠
                    </div>
                    <p className="font-mono text-sm text-cyan-600 sm:text-base dark:text-cyan-400">
                      VISUALIZATION
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional accessibility enhancement */}
        <div className="mt-12 text-center">
          <div className="sr-only">
            End of about section. Learn more about our vision in the next
            section.
          </div>
        </div>
      </div>
    </section>
  );
}
