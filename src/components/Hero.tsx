/**
 * ADR: Prop-driven copy selected for i18n and extensibility.
 * ADR: Media props require alt text to ensure accessibility compliance.
 */

import clsx from 'clsx';
import React, { ReactNode } from 'react';

import { HeroCtaClient } from './HeroCtaClient';
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
export function Hero({ title, subtitle, ctaLabel, headingLevel = 2, media, className }: HeroProps) {
  const HeadingTag = `h${headingLevel}` as keyof JSX.IntrinsicElements;
  const subtitleId = subtitle ? `${title.replace(/\s+/g, '-')}-subtitle` : undefined;

  return (
    <section
      className={clsx(
        'relative flex flex-col items-center justify-center px-4 py-24 text-center md:px-6',
        'min-h-[60vh] md:min-h-screen',
        'bg-gradient-to-b from-white via-white/70 to-transparent dark:from-black dark:via-black/70',
        className,
      )}
      role="region"
      aria-labelledby={`hero-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="z-10 mx-auto max-w-4xl space-y-6">
        <HeadingTag
          id={`hero-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl md:text-7xl"
          {...(subtitleId && { 'aria-describedby': subtitleId })}
        >
          {title}
        </HeadingTag>

        {subtitle && (
          <p
            id={subtitleId}
            className="mx-auto max-w-2xl text-lg text-gray-800 md:text-2xl dark:text-gray-200"
          >
            {subtitle}
          </p>
        )}

        {ctaLabel && <HeroCtaClient ctaLabel={ctaLabel} />}

        {media && <div className="mt-10">{media}</div>}
      </div>
    </section>
  );
}
