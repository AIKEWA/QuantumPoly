import { CodeBracketIcon, CpuChipIcon, SparklesIcon } from '@heroicons/react/24/outline';
import type { ElementType } from 'react';

// Defined outside component to prevent recreation on every render
const FEATURE_ICONS = [CodeBracketIcon, CpuChipIcon, SparklesIcon];

interface Feature {
  title: string;
  description: string;
}

interface CodeIntelligenceProps {
  title: string;
  description: string;
  features: Feature[];
  headingLevel?: 2 | 3;
}

export function CodeIntelligence({
  title,
  description,
  features,
  headingLevel = 2,
}: CodeIntelligenceProps) {
  // Type-safe heading selection
  const Heading: ElementType = `h${headingLevel}`;

  return (
    <section className="bg-gray-50 py-20 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Heading className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            {title}
          </Heading>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => {
            // Safe array access using modulo to cycle through available icons
            const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length];

            return (
              <div
                key={feature.title}
                className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
              >
                <div
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/10 dark:text-cyan-400"
                  aria-hidden="true" // Mark icon container as decorative
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
