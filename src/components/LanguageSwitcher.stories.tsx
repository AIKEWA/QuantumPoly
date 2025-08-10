/**
 * Storybook Stories for LanguageSwitcher Component
 *
 * Demonstrates various configurations and states of the LanguageSwitcher
 * component for documentation and testing purposes.
 *
 * @module LanguageSwitcher.stories
 * @version 1.0.0
 * @author QuantumPoly Development Team
 */

import type { Meta, StoryObj } from '@storybook/react';
import { NextIntlClientProvider } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

// Mock translations for Storybook
const mockMessages = {
  language: {
    switchTo: 'Switch to {language}',
    current: 'Current language: {language}',
    available: 'Available languages',
  },
};

const meta: Meta<typeof LanguageSwitcher> = {
  title: 'Components/LanguageSwitcher',
  component: LanguageSwitcher,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The LanguageSwitcher component provides an accessible interface for users to switch between supported languages.

## Features
- WCAG 2.1 AA compliant accessibility
- Keyboard navigation support
- Screen reader optimized
- Mobile-friendly dropdown interface
- Local storage persistence
- Animated transitions

## Usage
\`\`\`tsx
import LanguageSwitcher from '@/components/LanguageSwitcher';

<LanguageSwitcher variant="compact" showFlags={true} />
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['compact', 'full'],
      description: 'Visual variant of the component',
    },
    showFlags: {
      control: 'boolean',
      description: 'Whether to show flag emojis',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    ariaLabel: {
      control: 'text',
      description: 'Custom aria-label for accessibility',
    },
  },
  decorators: [
    Story => (
      <NextIntlClientProvider locale="en" messages={mockMessages}>
        <div className="min-h-[200px] bg-gray-100 p-8 dark:bg-gray-900">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default LanguageSwitcher with compact variant
 */
export const Default: Story = {
  args: {
    variant: 'compact',
    showFlags: true,
  },
};

/**
 * Compact variant suitable for headers and navigation
 */
export const Compact: Story = {
  args: {
    variant: 'compact',
    showFlags: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Compact variant perfect for headers and navigation areas where space is limited.',
      },
    },
  },
};

/**
 * Full variant with detailed language information
 */
export const Full: Story = {
  args: {
    variant: 'full',
    showFlags: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Full variant displays complete language names and codes, ideal for settings pages.',
      },
    },
  },
};

/**
 * Without flag emojis for minimal design
 */
export const WithoutFlags: Story = {
  args: {
    variant: 'compact',
    showFlags: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Clean text-only version without flag emojis for minimal design aesthetics.',
      },
    },
  },
};

/**
 * Dark theme demonstration
 */
export const DarkTheme: Story = {
  args: {
    variant: 'compact',
    showFlags: true,
  },
  decorators: [
    Story => (
      <NextIntlClientProvider locale="en" messages={mockMessages}>
        <div className="dark min-h-[200px] bg-gray-900 p-8">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how the component appears in dark theme.',
      },
    },
  },
};

/**
 * Custom styling example
 */
export const CustomStyling: Story = {
  args: {
    variant: 'full',
    showFlags: true,
    className: 'border-2 border-cyan-500 rounded-xl',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of custom styling using the className prop.',
      },
    },
  },
};

/**
 * Accessibility demonstration
 */
export const AccessibilityFocused: Story = {
  args: {
    variant: 'compact',
    showFlags: true,
    ariaLabel: 'Choose your preferred language from available options',
  },
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates accessibility features:
- Custom aria-label for screen readers
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Focus management and visual indicators
- Screen reader announcements for state changes

Try using keyboard navigation to interact with this component.
        `,
      },
    },
  },
};

/**
 * Mobile responsive demonstration
 */
export const MobileResponsive: Story = {
  args: {
    variant: 'compact',
    showFlags: true,
  },
  decorators: [
    Story => (
      <NextIntlClientProvider locale="en" messages={mockMessages}>
        <div className="mx-auto w-full max-w-sm bg-gray-100 p-4 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Mobile Header</h2>
            <Story />
          </div>
        </div>
      </NextIntlClientProvider>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Shows how the component behaves on mobile devices.',
      },
    },
  },
};
