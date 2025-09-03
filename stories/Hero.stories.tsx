import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Hero from '@/components/Hero';

const meta: Meta<typeof Hero> = {
  title: 'Components/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The Hero component is a prop-driven, accessible hero section that supports:

- **i18n Ready**: All text comes from props, no hardcoded strings
- **Accessibility**: Semantic HTML, proper heading levels, ARIA relationships
- **Theming**: Built for Tailwind light/dark modes with AA contrast
- **Flexibility**: Optional media, CTA, and configurable heading levels

## Accessibility

- **Heading level**: Configurable h1-h6 (page should retain a single h1)
- **Landmark**: Section uses \`role="region"\` linked via \`aria-labelledby\`
- **Focus management**: Keyboard-accessible CTA with visible focus indicators
- **Screen readers**: Proper semantic structure with heading hierarchy

### Usage Notes
- Always provide meaningful \`title\` text
- Use \`headingLevel\` to maintain proper document outline
- \`media\` prop should include proper alt text for images
- CTA button requires clear, actionable text
        `,
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Main heading text',
    },
    subtitle: {
      control: 'text',
      description: 'Optional subtitle displayed below the title',
    },
    ctaLabel: {
      control: 'text',
      description: 'Label for the call-to-action button',
    },
    headingLevel: {
      control: { type: 'select' },
      options: [1, 2, 3, 4, 5, 6],
      description: 'HTML heading level (h1-h6)',
    },
    onCtaClick: {
      action: 'CTA clicked',
      description: 'Click handler for the CTA button',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    onCtaClick: action('CTA clicked'),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Welcome to QuantumPoly',
    subtitle: 'Pioneering the future of quantum computing and decentralized technologies',
    ctaLabel: 'Get Started',
    headingLevel: 1,
  },
};

export const DarkMode: Story = {
  args: {
    title: 'Welcome to QuantumPoly',
    subtitle: 'Pioneering the future of quantum computing and decentralized technologies',
    ctaLabel: 'Get Started',
    headingLevel: 1,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Hero component with dark theme applied demonstrating accessible contrast ratios and theme-aware styling.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};

export const WithoutCTA: Story = {
  args: {
    title: 'About Our Mission',
    subtitle: 'We are building the infrastructure for tomorrow\'s quantum-powered world',
    headingLevel: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'Hero without call-to-action button for informational sections.',
      },
    },
  },
};

export const WithMedia: Story = {
  args: {
    title: 'Quantum Innovation',
    subtitle: 'Visualizing the future of computation',
    ctaLabel: 'Explore Technology',
    headingLevel: 1,
    media: (
      <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
        <span className="text-6xl">⚛️</span>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Hero with custom media content (ensure media has proper accessibility attributes).',
      },
    },
  },
};

export const MinimalHeading: Story = {
  args: {
    title: 'Simple Statement',
    headingLevel: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal hero with just a title for simple page sections.',
      },
    },
  },
};

export const LongContent: Story = {
  args: {
    title: 'Revolutionary Quantum Computing Platform for Next-Generation Applications',
    subtitle: 'QuantumPoly combines cutting-edge quantum algorithms with decentralized network architecture to deliver unprecedented computational capabilities for research institutions, enterprises, and developers worldwide',
    ctaLabel: 'Start Your Quantum Journey Today',
    headingLevel: 1,
  },
  parameters: {
    docs: {
      description: {
        story: 'Hero with longer content to test text wrapping and responsive behavior.',
      },
    },
  },
};
