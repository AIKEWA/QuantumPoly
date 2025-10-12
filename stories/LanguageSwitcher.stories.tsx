import type { Meta, StoryObj } from '@storybook/react';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const meta: Meta<typeof LanguageSwitcher> = {
  title: 'Components/LanguageSwitcher',
  component: LanguageSwitcher,
  parameters: {
    layout: 'centered',
    a11y: {
      disable: false,
    },
    docs: {
      description: {
        component:
          'Accessible language switcher dropdown. Enables users to change the interface language ' +
          'with proper keyboard navigation, ARIA labeling, and URL preservation.',
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the select element',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default language switcher with English as the current language
 */
export const Default: Story = {
  args: {},
};

/**
 * Language switcher with custom styling
 */
export const WithCustomClassName: Story = {
  args: {
    className: 'my-4',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of adding custom margin via className prop.',
      },
    },
  },
};

/**
 * Accessibility demonstration - fully keyboard navigable
 */
export const AccessibilityDemo: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'This component is fully accessible:\n' +
          '- Keyboard navigation with Tab and Arrow keys\n' +
          '- ARIA labels for screen readers\n' +
          '- Visible focus indicators\n' +
          '- Disabled state during transitions',
      },
    },
  },
};

/**
 * Dark theme variant
 */
export const DarkMode: Story = {
  args: {},
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Language switcher automatically adapts to dark mode with proper contrast.',
      },
    },
  },
};

