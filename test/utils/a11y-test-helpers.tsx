/**
 * A11y Test Helpers
 *
 * Provides utilities for accessibility testing with jest-axe.
 * Includes NextIntlClientProvider integration for authentic render trees.
 */

import { render, RenderOptions } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';
import { NextIntlClientProvider } from 'next-intl';
import { ReactElement, ReactNode } from 'react';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

/**
 * Load real translation messages for a given locale
 */
export async function loadMessages(locale: string = 'en') {
  try {
    // Import all locale namespaces
    const messages = await import(`@/locales/${locale}/index.ts`);
    return messages.default || messages;
  } catch (error) {
    console.warn(`Failed to load messages for locale: ${locale}`, error);
    return {};
  }
}

/**
 * Wrapper component that provides next-intl context
 */
interface ProvidersProps {
  children: ReactNode;
  locale?: string;
  messages?: Record<string, unknown>;
}

function Providers({ children, locale = 'en', messages = {} }: ProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

/**
 * Custom render function that wraps components with necessary providers
 * for authentic accessibility testing
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: string;
  messages?: Record<string, unknown>;
}

export async function renderWithProviders(
  ui: ReactElement,
  { locale = 'en', messages, ...renderOptions }: CustomRenderOptions = {},
) {
  // Load messages if not provided
  const finalMessages = messages || (await loadMessages(locale));

  return render(ui, {
    wrapper: ({ children }) => (
      <Providers locale={locale} messages={finalMessages}>
        {children}
      </Providers>
    ),
    ...renderOptions,
  });
}

/**
 * Synchronous version of renderWithProviders for components that don't need translations
 * or when messages are pre-loaded
 */
export function renderWithProvidersSync(
  ui: ReactElement,
  { locale = 'en', messages = {}, ...renderOptions }: CustomRenderOptions = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <Providers locale={locale} messages={messages}>
        {children}
      </Providers>
    ),
    ...renderOptions,
  });
}

/**
 * Mock messages for testing
 * Provides a minimal set of translations for common components
 */
export const mockMessages = {
  hero: {
    title: 'Welcome to QuantumPoly',
    subtitle: 'Building the future of AI',
    ctaLabel: 'Get Started',
  },
  about: {
    title: 'About Us',
    body: 'We are building safe, scalable, and open AI systems.',
  },
  vision: {
    title: 'Our Vision',
    pillars: {
      safety: {
        title: 'Safety First',
        description: 'Prioritizing ethical AI development',
      },
      scale: {
        title: 'Scale Responsibly',
        description: 'Growing with sustainable practices',
      },
      openness: {
        title: 'Open Collaboration',
        description: 'Transparent and inclusive development',
      },
    },
  },
  newsletter: {
    title: 'Stay Updated',
    emailLabel: 'Email Address',
    emailPlaceholder: 'your@email.com',
    submitLabel: 'Subscribe',
    successMessage: 'Successfully subscribed!',
    errorMessage: 'Subscription failed',
    invalidEmail: 'Please enter a valid email',
    serverError: 'Server error occurred',
  },
  footer: {
    brand: 'QuantumPoly',
    tagline: 'Advancing AI for humanity',
    copyright: '© 2024 QuantumPoly. All rights reserved.',
    trustNav: 'Trust & Legal',
    ethics: 'Ethics',
    privacy: 'Privacy Policy',
    imprint: 'Imprint',
    gep: 'Good Electronic Practices',
    socialLinks: {
      github: 'GitHub',
      twitter: 'Twitter',
    },
  },
  policy: {
    tableOfContents: 'Table of Contents',
    lastUpdated: 'Last updated',
    backToHome: 'Back to Home',
  },
};

