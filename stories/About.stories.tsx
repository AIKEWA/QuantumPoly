import type { Meta, StoryObj } from '@storybook/react';

import { About } from '@/components/About';

const meta: Meta<typeof About> = {
  title: 'Components/About',
  component: About,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The About component is a prop-driven, accessible content section that supports:

- **i18n Ready**: All text comes from props, no hardcoded strings
- **ReactNode Body**: Accepts rich content via ReactNode (no dangerouslySetInnerHTML)
- **Accessibility**: Semantic HTML, proper heading levels, ARIA relationships
- **Theming**: Built for Tailwind light/dark modes with AA contrast

## Accessibility

- **Heading level**: Configurable h1-h6 (typically h2, page should retain a single h1)
- **Landmark**: Section uses \`role="region"\` linked via \`aria-labelledby\`
- **Content structure**: Proper semantic relationship between heading and body content
- **Screen readers**: Clear content hierarchy and accessible reading flow

### Usage Notes
- \`body\` accepts ReactNode for rich content composition
- Use \`headingLevel\` to maintain proper document outline
- Content is automatically linked via aria-describedby for better screen reader experience
        `,
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Section heading text',
    },
    body: {
      control: 'text',
      description: 'Content body (ReactNode in practice)',
    },
    headingLevel: {
      control: { type: 'select' },
      options: [1, 2, 3, 4, 5, 6],
      description: 'HTML heading level (h1-h6)',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'About QuantumPoly',
    body: 'QuantumPoly is at the forefront of quantum computing innovation, developing cutting-edge solutions that bridge the gap between theoretical quantum mechanics and practical real-world applications. Our platform empowers researchers, developers, and enterprises to harness the transformative power of quantum technology.',
    headingLevel: 2,
  },
};

export const DarkMode: Story = {
  args: {
    title: 'About QuantumPoly',
    body: 'QuantumPoly is at the forefront of quantum computing innovation, developing cutting-edge solutions that bridge the gap between theoretical quantum mechanics and practical real-world applications. Our platform empowers researchers, developers, and enterprises to harness the transformative power of quantum technology.',
    headingLevel: 2,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story:
          'About component with dark theme applied demonstrating accessible contrast ratios and content visibility.',
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

export const WithRichContent: Story = {
  args: {
    title: 'Our Technology Stack',
    body: (
      <div className="space-y-4">
        <p>
          QuantumPoly leverages state-of-the-art technologies to deliver unprecedented computational
          capabilities:
        </p>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong>Quantum Algorithms:</strong> Advanced optimization and simulation protocols
          </li>
          <li>
            <strong>Distributed Computing:</strong> Scalable cloud-native architecture
          </li>
          <li>
            <strong>Cryptographic Security:</strong> Post-quantum encryption standards
          </li>
        </ul>
        <p>
          <em>Experience the future of computing today.</em>
        </p>
      </div>
    ),
    headingLevel: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'About section with rich ReactNode content including lists and emphasis.',
      },
    },
  },
};

export const CompactVersion: Story = {
  args: {
    title: 'Mission Statement',
    body: 'Democratizing quantum computing for everyone.',
    headingLevel: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact about section for smaller content areas.',
      },
    },
  },
};

export const WithInteractiveContent: Story = {
  args: {
    title: 'Get Involved',
    body: (
      <div className="space-y-4 text-center">
        <p>Join our community of quantum computing enthusiasts and researchers.</p>
        <div className="flex justify-center gap-4">
          <button className="rounded-md bg-cyan-500 px-4 py-2 text-white transition-colors hover:bg-cyan-600">
            Join Discord
          </button>
          <button className="rounded-md border border-cyan-500 px-4 py-2 text-cyan-500 transition-colors hover:bg-cyan-50">
            Read Documentation
          </button>
        </div>
      </div>
    ),
    headingLevel: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'About section with interactive elements embedded in the ReactNode body.',
      },
    },
  },
};

export const MultiParagraph: Story = {
  args: {
    title: 'Our Story',
    body: (
      <div className="space-y-6">
        <p>
          Founded in 2024, QuantumPoly emerged from cutting-edge research at leading quantum physics
          laboratories. Our team of quantum scientists, software engineers, and cryptography experts
          recognized the need for accessible quantum computing platforms.
        </p>
        <p>
          Today, we're building the infrastructure that will power tomorrow's quantum applications,
          from drug discovery and financial modeling to optimization problems that classical
          computers cannot solve efficiently.
        </p>
        <p>
          Our vision extends beyond just providing quantum computing resources—we're creating an
          ecosystem where developers and researchers can collaborate, innovate, and push the
          boundaries of what's possible with quantum technology.
        </p>
      </div>
    ),
    headingLevel: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'About section with multiple paragraphs for longer form content.',
      },
    },
  },
};
