/**
 * ADR: Prop-driven copy selected for i18n and extensibility.
 * ADR: Media props require alt text to ensure accessibility compliance.
 * ADR: Use next/image with priority flag for LCP optimization on hero image only.
 */

import clsx from 'clsx';
import Image from 'next/image';
import React, { ReactNode } from 'react';

import { HeroCtaClient } from './HeroCtaClient';
import { HeadingLevel, WithClassName } from './types';

/**
 * Configuration for optimized hero background image
 */
export interface HeroImage {
  /** Image source path (relative to public/) */
  src: string;
  /** Accessible alt text for the image */
  alt: string;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** Responsive sizes attribute for optimal loading */
  sizes?: string;
}

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
  /** Optional optimized hero background image (LCP candidate) */
  heroImage?: HeroImage;
}

/**
 * Accessible, responsive hero section.
 *
 * Performance: If heroImage is provided, it uses next/image with priority flag
 * for LCP optimization. The image is positioned as a background layer with
 * content overlaid at z-10.
 *
 * @component
 */
export function Hero({
  title,
  subtitle,
  ctaLabel,
  headingLevel = 2,
  media,
  heroImage,
  className,
}: HeroProps) {
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
      aria-labelledby={`hero-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {/* Optimized background image for LCP - priority flag ensures immediate loading */}
      {heroImage && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            width={heroImage.width}
            height={heroImage.height}
            priority
            sizes={heroImage.sizes || '100vw'}
            className="h-full w-full object-cover opacity-20 dark:opacity-10"
            quality={85}
          />
        </div>
      )}

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
