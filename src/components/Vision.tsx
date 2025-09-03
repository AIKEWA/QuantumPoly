'use client';

/**
 * ADR: Icons default `aria-hidden` unless meaningful label is provided.
 * ADR: Prop-driven copy selected for i18n and extensibility.
 */

import React, { ReactNode } from 'react';
import clsx from 'clsx';

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
      <div className="text-6xl mb-4" aria-hidden="true">
        {icon}
      </div>
    );
  };
  
  return (
    <section 
      className={clsx('py-20 px-4 md:px-6 bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-black', className)}
      role="region"
      aria-labelledby={`vision-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="max-w-6xl mx-auto">
        <HeadingTag 
          id={`vision-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="text-3xl md:text-4xl font-bold mb-16 text-center text-cyan-600 dark:text-cyan-400"
        >
          {title}
        </HeadingTag>
        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              className="relative bg-white dark:bg-black/50 p-8 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow"
            >
              {pillar.icon && renderIcon(pillar.icon, pillar.title)}
              <h3 className="text-xl font-semibold mb-4 text-cyan-700 dark:text-cyan-300">
                {pillar.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{pillar.description}</p>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1/4 h-1 bg-gradient-to-r from-cyan-400 to-purple-500" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Vision; 