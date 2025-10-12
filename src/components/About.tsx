/**
 * ADR: Replaced raw HTML with `ReactNode` to avoid XSS and ease composition.
 * ADR: Prop-driven copy selected for i18n and extensibility.
 */

import clsx from 'clsx';
import React, { ReactNode } from 'react';

export interface AboutProps {
  title: string;
  body: ReactNode;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function About({ title, body, headingLevel = 2, className }: AboutProps) {
  const HeadingTag = `h${headingLevel}` as keyof JSX.IntrinsicElements;
  const bodyId = `about-body-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <section
      className={clsx('bg-white px-4 py-20 md:px-6 dark:bg-black/80', className)}
      role="region"
      aria-labelledby={`about-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <HeadingTag
          id={`about-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="text-center text-3xl font-bold text-cyan-500 md:text-4xl dark:text-cyan-400"
          aria-describedby={bodyId}
        >
          {title}
        </HeadingTag>
        <div
          id={bodyId}
          className="text-center text-lg leading-relaxed text-gray-800 dark:text-gray-200"
        >
          {body}
        </div>
      </div>
    </section>
  );
}
