'use client';

/**
 * ADR: Replaced raw HTML with `ReactNode` to avoid XSS and ease composition.
 * ADR: Prop-driven copy selected for i18n and extensibility.
 */

import React, { ReactNode } from 'react';
import clsx from 'clsx';

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
      className={clsx(
        'py-20 px-4 md:px-6 bg-white dark:bg-black/80',
        className,
      )}
      role="region"
      aria-labelledby={`about-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <HeadingTag 
          id={`about-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="text-3xl md:text-4xl font-bold text-center text-cyan-500 dark:text-cyan-400"
          aria-describedby={bodyId}
        >
          {title}
        </HeadingTag>
        <div 
          id={bodyId}
          className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 text-center"
        >
          {body}
        </div>
      </div>
    </section>
  );
}

export default About; 