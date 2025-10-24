/**
 * ADR: Icons default `aria-hidden` unless meaningful label is provided.
 * ADR: Prop-driven copy selected for i18n and extensibility.
 */

import clsx from 'clsx';
import React, { ReactNode } from 'react';

export interface Pillar {
  title: string;
  description: string;
  icon?: ReactNode;
}

export interface VisionProps {
  title: string;
  pillars: Pillar[];
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  /** Optional custom icon renderer function */
  iconRenderer?: (icon: ReactNode, title: string) => ReactNode;
}

export function Vision({ title, pillars, headingLevel = 2, className, iconRenderer }: VisionProps) {
  const HeadingTag = `h${headingLevel}` as keyof JSX.IntrinsicElements;

  const renderIcon = (icon: ReactNode, pillarTitle: string) => {
    if (iconRenderer) {
      return iconRenderer(icon, pillarTitle);
    }

    return (
      <div className="mb-4 text-6xl" aria-hidden="true">
        {icon}
      </div>
    );
  };

  return (
    <section
      className={clsx(
        'bg-gradient-to-b from-gray-100 to-white px-4 py-20 md:px-6 dark:from-gray-900 dark:to-black',
        className,
      )}
      aria-labelledby={`vision-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="mx-auto max-w-6xl">
        <HeadingTag
          id={`vision-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="mb-16 text-center text-3xl font-bold text-cyan-600 md:text-4xl dark:text-cyan-400"
        >
          {title}
        </HeadingTag>
        <div className="grid gap-8 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-black/50"
            >
              {pillar.icon && renderIcon(pillar.icon, pillar.title)}
              <h3 className="mb-4 text-xl font-semibold text-cyan-700 dark:text-cyan-300">
                {pillar.title}
              </h3>
              <p className="text-gray-800 dark:text-gray-200">{pillar.description}</p>
              <div
                className="absolute -bottom-4 left-1/2 h-1 w-1/4 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-purple-500"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
