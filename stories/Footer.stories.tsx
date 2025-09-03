import type { Meta, StoryObj } from '@storybook/react';
import Footer from '@/components/Footer';

const meta: Meta<typeof Footer> = {
  title: 'Components/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The Footer component provides a semantic, accessible site footer:

- **i18n Ready**: All text comes from props, no hardcoded strings
- **Semantic HTML**: Uses proper \`<footer>\` element with ARIA labeling
- **Social Links**: Configurable social links with security attributes
- **Accessibility**: External link indicators, proper labeling, keyboard navigation
- **Theming**: Built for Tailwind light/dark modes with AA contrast
- **Extensible**: Optional socialSlot for custom social layouts

## Accessibility

- **Heading level**: Configurable h2-h6 (typically h2, page should retain a single h1)
- **Landmark**: Footer uses \`role="contentinfo"\` linked via \`aria-labelledby\`
- **External links**: Proper security attributes and screen reader announcements
- **Navigation**: Social links grouped in semantic nav with accessible labeling

### Usage Notes
- All external links include \`rel="noopener noreferrer"\` for security
- Social links are grouped in semantic \`<nav>\` with proper labeling
- Screen reader users are informed about external links
- Use \`headingLevel\` to maintain proper document outline
        `,
      },
    },
  },
  argTypes: {
    brand: {
      control: 'text',
      description: 'Brand or site name',
    },
    tagline: {
      control: 'text',
      description: 'Optional tagline displayed beneath brand',
    },
    copyright: {
      control: 'text',
      description: 'Copyright notice text',
    },
    socialLinks: {
      control: 'object',
      description: 'Array of social link objects with label and href',
    },
    headingLevel: {
      control: { type: 'select' },
      options: [2, 3, 4, 5, 6],
      description: 'HTML heading level for brand (h2-h6)',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    socialSlot: {
      control: false,
      description: 'Custom ReactNode to override social links section',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    brand: 'QuantumPoly',
    tagline: 'Pioneering quantum computing for everyone',
    copyright: '© 2024 QuantumPoly. All rights reserved.',
    headingLevel: 2,
    socialLinks: [
      { label: 'Twitter', href: 'https://twitter.com/quantumpoly' },
      { label: 'LinkedIn', href: 'https://linkedin.com/company/quantumpoly' },
      { label: 'GitHub', href: 'https://github.com/quantumpoly' },
      { label: 'Discord', href: 'https://discord.gg/quantumpoly' },
    ],
  },
};

export const DarkMode: Story = {
  args: {
    brand: 'QuantumPoly',
    tagline: 'Pioneering quantum computing for everyone',
    copyright: '© 2024 QuantumPoly. All rights reserved.',
    headingLevel: 2,
    socialLinks: [
      { label: 'Twitter', href: 'https://twitter.com/quantumpoly' },
      { label: 'LinkedIn', href: 'https://linkedin.com/company/quantumpoly' },
      { label: 'GitHub', href: 'https://github.com/quantumpoly' },
      { label: 'Discord', href: 'https://discord.gg/quantumpoly' },
    ],
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Footer component with dark theme applied demonstrating accessible contrast and social link styling.',
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

export const Minimal: Story = {
  args: {
    brand: 'QuantumPoly',
    copyright: '© 2024 QuantumPoly. All rights reserved.',
    headingLevel: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal footer without tagline or social links.',
      },
    },
  },
};

export const WithTaglineOnly: Story = {
  args: {
    brand: 'QuantumPoly',
    tagline: 'Quantum computing made accessible',
    copyright: '© 2024 QuantumPoly. All rights reserved.',
    headingLevel: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer with brand tagline but no social links.',
      },
    },
  },
};

export const ExtensiveSocialLinks: Story = {
  args: {
    brand: 'QuantumPoly',
    tagline: 'Connect with our quantum community',
    copyright: '© 2024 QuantumPoly. All rights reserved.',
    headingLevel: 2,
    socialLinks: [
      { label: 'Twitter', href: 'https://twitter.com/quantumpoly' },
      { label: 'LinkedIn', href: 'https://linkedin.com/company/quantumpoly' },
      { label: 'GitHub', href: 'https://github.com/quantumpoly' },
      { label: 'Discord', href: 'https://discord.gg/quantumpoly' },
      { label: 'YouTube', href: 'https://youtube.com/@quantumpoly' },
      { label: 'Medium', href: 'https://medium.com/@quantumpoly' },
      { label: 'Slack', href: 'https://quantumpoly.slack.com' },
      { label: 'Reddit', href: 'https://reddit.com/r/quantumpoly' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer with extensive social media presence.',
      },
    },
  },
};

export const CustomSocialSlot: Story = {
  args: {
    brand: 'QuantumPoly',
    tagline: 'Custom social integration',
    copyright: '© 2024 QuantumPoly. All rights reserved.',
    headingLevel: 2,
    socialSlot: (
      <div className="mb-8 text-center">
        <h3 className="text-lg font-semibold mb-4 text-cyan-400">Join Our Community</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <a 
            href="https://twitter.com/quantumpoly" 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Follow on Twitter
          </a>
          <a 
            href="https://github.com/quantumpoly" 
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Star on GitHub
          </a>
          <a 
            href="https://discord.gg/quantumpoly" 
            className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join Discord
          </a>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer with custom social slot containing styled buttons instead of simple links.',
      },
    },
  },
};

export const DifferentHeadingLevels: Story = {
  args: {
    brand: 'QuantumPoly',
    tagline: 'Heading level demonstration',
    copyright: '© 2024 QuantumPoly. All rights reserved.',
    headingLevel: 6,
    socialLinks: [
      { label: 'Twitter', href: 'https://twitter.com/quantumpoly' },
      { label: 'GitHub', href: 'https://github.com/quantumpoly' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer with h6 heading level for specific document outline requirements.',
      },
    },
  },
};

export const LongBrandName: Story = {
  args: {
    brand: 'QuantumPoly Advanced Research Initiative',
    tagline: 'Democratizing quantum computing through collaborative research and open-source development',
    copyright: '© 2024 QuantumPoly Advanced Research Initiative. All rights reserved worldwide.',
    headingLevel: 2,
    socialLinks: [
      { label: 'Twitter', href: 'https://twitter.com/quantumpoly' },
      { label: 'LinkedIn', href: 'https://linkedin.com/company/quantumpoly' },
      { label: 'Research Portal', href: 'https://research.quantumpoly.org' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer with longer brand name and content to test text wrapping.',
      },
    },
  },
};

export const InternationalExample: Story = {
  args: {
    brand: 'QuantumPoly',
    tagline: '量子计算的未来 - 全球协作创新',
    copyright: '© 2024 QuantumPoly. Todos los derechos reservados. 保留所有权利.',
    headingLevel: 2,
    socialLinks: [
      { label: 'Twitter Global', href: 'https://twitter.com/quantumpoly' },
      { label: '微博', href: 'https://weibo.com/quantumpoly' },
      { label: 'LinkedIn Internacional', href: 'https://linkedin.com/company/quantumpoly' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer demonstrating i18n capabilities with multilingual content.',
      },
    },
  },
};