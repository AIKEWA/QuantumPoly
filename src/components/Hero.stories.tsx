/**
 * @fileoverview Storybook stories for Hero component
 * @module components/Hero.stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import Hero from './Hero';

const meta: Meta<typeof Hero> = {
  title: 'Components/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Hero Component

A fully accessible and internationalized hero section with semantic HTML structure, ARIA attributes for screen readers, dark/light theme support, customizable content through props, and focus management with keyboard navigation.

## Features
- ✅ Semantic HTML structure with proper landmarks
- ✅ Full accessibility support with ARIA labels
- ✅ Dark/light theme integration via Tailwind CSS
- ✅ Internationalization through props
- ✅ Keyboard navigation and focus management
- ✅ Responsive design with mobile-first approach
- ✅ Smooth scroll functionality
- ✅ Interactive animations and hover states

## Accessibility Features
- Screen reader optimized content structure
- Keyboard-navigable scroll indicator
- Focus management for interactive elements
- ARIA labels and descriptions
- Semantic heading hierarchy
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'focus-order-semantics',
            enabled: true,
          },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Main heading text for the hero section',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"QuantumPoly"' },
      },
    },
    subtitle: {
      control: 'text',
      description: 'Subtitle/description text below the main heading',
      table: {
        type: { summary: 'string' },
        defaultValue: {
          summary:
            '"Merging Artificial Intelligence with Sustainable Innovation and Metaverse Futures"',
        },
      },
    },
    ctaText: {
      control: 'text',
      description: 'Call-to-action button text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"Join the Future"' },
      },
    },
    onCtaClick: {
      action: 'ctaClicked',
      description: 'Callback function when CTA button is clicked',
      table: {
        type: { summary: '() => void' },
      },
    },
    scrollIndicatorLabel: {
      control: 'text',
      description: 'Accessible label for the scroll down indicator',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"Scroll down to learn more"' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default hero story
export const Default: Story = {
  args: {
    onCtaClick: () => {},
  },
};

// Hero with custom content
export const CustomContent: Story = {
  args: {
    title: 'Welcome to Innovation',
    subtitle:
      'Transforming ideas into reality through cutting-edge technology and sustainable practices.',
    ctaText: 'Get Started',
    scrollIndicatorLabel: 'Scroll to explore our services',
    onCtaClick: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Hero component with customized content demonstrating internationalization capabilities.',
      },
    },
  },
};

// Multilingual example
export const Multilingual: Story = {
  args: {
    title: 'QuantumPoly',
    subtitle:
      'Fusionando Inteligencia Artificial con Innovación Sostenible y Futuros del Metaverso',
    ctaText: 'Únete al Futuro',
    scrollIndicatorLabel: 'Desplázate hacia abajo para obtener más información',
    onCtaClick: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Hero component displaying Spanish content, showcasing internationalization support.',
      },
    },
  },
};

// Long content variant
export const LongContent: Story = {
  args: {
    title: 'Revolutionary Quantum Computing Platform',
    subtitle:
      'Discover the future of computational power with our advanced quantum algorithms, sustainable AI practices, and immersive metaverse experiences that bridge the gap between virtual and physical realities while maintaining ecological responsibility.',
    ctaText: 'Explore the Platform',
    onCtaClick: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Hero component with longer content to test responsive layout and text wrapping.',
      },
    },
  },
};

// Minimal content
export const Minimal: Story = {
  args: {
    title: 'QuantumPoly',
    subtitle: 'Future. Now.',
    ctaText: 'Begin',
    onCtaClick: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Hero component with minimal content for a clean, focused design.',
      },
    },
  },
};

// Dark theme showcase
export const DarkTheme: Story = {
  args: {
    onCtaClick: () => {},
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story:
          'Hero component displayed on dark background to showcase dark theme styling.',
      },
    },
  },
  decorators: [
    Story => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};

// Accessibility focused story
export const AccessibilityDemo: Story = {
  args: {
    title: 'Accessible Design',
    subtitle:
      'This hero section demonstrates comprehensive accessibility features including keyboard navigation, screen reader support, and focus management.',
    ctaText: 'Learn About Accessibility',
    scrollIndicatorLabel: 'Navigate to accessibility features section',
    onCtaClick: action('accessibility-cta-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: `
This story demonstrates the accessibility features of the Hero component:

- **Keyboard Navigation**: Tab through interactive elements
- **Screen Reader Support**: Uses semantic HTML and ARIA labels
- **Focus Management**: Visible focus indicators and logical tab order
- **Responsive Design**: Works across all screen sizes
- **High Contrast**: Meets WCAG color contrast requirements
        `,
      },
    },
    a11y: {
      manual: false, // Run automated accessibility tests
    },
  },
};

// Mobile responsive
export const Mobile: Story = {
  args: {
    onCtaClick: () => {},
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story:
          'Hero component optimized for mobile devices with responsive text sizing and spacing.',
      },
    },
  },
};

// Tablet responsive
export const Tablet: Story = {
  args: {
    onCtaClick: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Hero component layout optimized for tablet screens.',
      },
    },
  },
};

// Without CTA callback (fallback behavior)
export const WithoutCallback: Story = {
  args: {
    // No onCtaClick provided to test fallback behavior
  },
  parameters: {
    docs: {
      description: {
        story:
          'Hero component without a CTA callback function, demonstrating graceful fallback.',
      },
    },
  },
};
