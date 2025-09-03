'use client';

/**
 * ADR: Prop-driven copy selected for i18n and extensibility.
 * ADR: Media props require alt text to ensure accessibility compliance.
 */

import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { HeadingLevel, WithClassName } from './types';

/**
 * Props for the Hero component.
 */
export interface HeroProps extends WithClassName {
  /** Main heading text */
  title: string;
  /** Optional subtitle displayed below the title */
  subtitle?: string;
  /** Label for the call-to-action button */
  ctaLabel?: string;
  /** Click handler for the CTA button */
  onCtaClick?: () => void;
  /** Provide a custom HTML heading level (1-6). Defaults to 2. */
  headingLevel?: HeadingLevel;
  /** Optional background or immersive media element rendered beneath text */
  media?: ReactNode;
}

/**
 * Accessible, responsive hero section.
 *
 * @component
 */
export function Hero({
  title,
  subtitle,
  ctaLabel,
  onCtaClick,
  headingLevel = 2,
  media,
  className,
}: HeroProps) {
  const HeadingTag = `h${headingLevel}` as keyof JSX.IntrinsicElements;
  const subtitleId = subtitle ? `${title.replace(/\s+/g, '-')}-subtitle` : undefined;

  return (
    <section
      className={clsx(
        'relative flex flex-col items-center justify-center text-center px-4 md:px-6 py-24',
        'min-h-[60vh] md:min-h-screen',
        'bg-gradient-to-b from-white via-white/70 to-transparent dark:from-black dark:via-black/70',
        className,
      )}
      role="region"
      aria-labelledby={`hero-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="z-10 max-w-4xl mx-auto space-y-6">
        <HeadingTag
          id={`hero-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="font-bold tracking-tight text-4xl sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-purple-500"
          {...(subtitleId && { 'aria-describedby': subtitleId })}
        >
          {title}
        </HeadingTag>

        {subtitle && (
          <p id={subtitleId} className="text-lg md:text-2xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}

        {ctaLabel && (
          <button
            type="button"
            className="px-8 py-4 rounded-xl font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all focus:outline-none focus-visible:ring focus-visible:ring-cyan-300"
            onClick={onCtaClick}
          >
            {ctaLabel}
          </button>
        )}

        {media && <div className="mt-10">{media}</div>}
      </div>
    </section>
  );
}

export default Hero; 