import type { Meta, StoryObj } from '@storybook/react';
import Vision from '@/components/Vision';

const meta: Meta<typeof Vision> = {
  title: 'Components/Vision',
  component: Vision,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The Vision component displays strategic pillars or key concepts in a grid layout:

- **i18n Ready**: All text comes from props, no hardcoded strings
- **Flexible Icons**: Supports ReactNode icons (emojis, SVGs, components)
- **Accessibility**: Icons are aria-hidden by default, proper heading hierarchy
- **Theming**: Built for Tailwind light/dark modes with AA contrast
- **Extensibility**: Optional custom iconRenderer for advanced use cases

## Accessibility

- **Heading level**: Configurable h1-h6 (typically h2, page should retain a single h1)
- **Landmark**: Section uses \`role="region"\` linked via \`aria-labelledby\`
- **Icon treatment**: Icons are decorative (\`aria-hidden\`) unless meaningful labels provided
- **Content hierarchy**: H3 pillar titles properly nested under main section heading

### Usage Notes
- Icons default to \`aria-hidden="true"\` unless using custom iconRenderer
- Use \`headingLevel\` to maintain proper document outline
- Each pillar should have meaningful title and description
- Icons can be emojis, SVG components, or any ReactNode
        `,
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Section heading text',
    },
    pillars: {
      control: 'object',
      description: 'Array of pillar objects with title, description, and optional icon',
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
    iconRenderer: {
      control: false,
      description: 'Custom function to render icons with accessibility labels',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Our Vision for the Future',
    headingLevel: 2,
    pillars: [
      {
        title: 'Innovation',
        description: 'Pushing the boundaries of quantum computing to solve problems previously thought impossible.',
        icon: '🚀',
      },
      {
        title: 'Accessibility',
        description: 'Making quantum computing accessible to researchers, developers, and enterprises worldwide.',
        icon: '🌍',
      },
      {
        title: 'Collaboration',
        description: 'Building an open ecosystem where quantum innovations can flourish through partnership.',
        icon: '🤝',
      },
    ],
  },
};

export const DarkMode: Story = {
  args: {
    title: 'Our Vision for the Future',
    headingLevel: 2,
    pillars: [
      {
        title: 'Innovation',
        description: 'Pushing the boundaries of quantum computing to solve problems previously thought impossible.',
        icon: '🚀',
      },
      {
        title: 'Accessibility',
        description: 'Making quantum computing accessible to researchers, developers, and enterprises worldwide.',
        icon: '🌍',
      },
      {
        title: 'Collaboration',
        description: 'Building an open ecosystem where quantum innovations can flourish through partnership.',
        icon: '🤝',
      },
    ],
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Vision component with dark theme applied demonstrating accessible contrast and card styling.',
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

export const TwoPillars: Story = {
  args: {
    title: 'Core Principles',
    headingLevel: 2,
    pillars: [
      {
        title: 'Security First',
        description: 'Every quantum algorithm and communication protocol is built with post-quantum cryptographic standards.',
        icon: '🔒',
      },
      {
        title: 'Performance Optimized',
        description: 'Maximizing quantum advantage through efficient algorithm design and hardware optimization.',
        icon: '⚡',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Vision with two pillars - adapts to fewer items gracefully.',
      },
    },
  },
};

export const FourPillars: Story = {
  args: {
    title: 'Technology Pillars',
    headingLevel: 2,
    pillars: [
      {
        title: 'Quantum Algorithms',
        description: 'Advanced protocols for optimization, simulation, and machine learning.',
        icon: '⚛️',
      },
      {
        title: 'Distributed Systems',
        description: 'Scalable cloud infrastructure for quantum workload management.',
        icon: '☁️',
      },
      {
        title: 'Developer Tools',
        description: 'Intuitive APIs and SDKs for rapid quantum application development.',
        icon: '🛠️',
      },
      {
        title: 'Research Platform',
        description: 'Collaborative environment for academic and industry research.',
        icon: '🔬',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Vision with four pillars - note how the grid layout adapts.',
      },
    },
  },
};

export const WithoutIcons: Story = {
  args: {
    title: 'Text-Only Vision',
    headingLevel: 2,
    pillars: [
      {
        title: 'Reliability',
        description: 'Building quantum systems that researchers and enterprises can depend on for critical workloads.',
      },
      {
        title: 'Scalability',
        description: 'Designing infrastructure that grows with advancing quantum hardware capabilities.',
      },
      {
        title: 'Interoperability',
        description: 'Ensuring compatibility across different quantum computing platforms and classical systems.',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Vision without icons - clean text-focused presentation.',
      },
    },
  },
};

export const WithSVGIcons: Story = {
  args: {
    title: 'Technical Excellence',
    headingLevel: 2,
    pillars: [
      {
        title: 'Quantum Supremacy',
        description: 'Achieving computational advantages that classical computers cannot match.',
        icon: (
          <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="32" cy="32" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="32" cy="32" r="2" fill="currentColor"/>
          </svg>
        ),
      },
      {
        title: 'Error Correction',
        description: 'Implementing fault-tolerant quantum computing with advanced error correction protocols.',
        icon: (
          <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 8L56 32L32 56L8 32L32 8Z" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M24 32L29 37L40 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
      },
      {
        title: 'Network Security',
        description: 'Quantum-safe cryptography protecting data in the post-quantum era.',
        icon: (
          <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="16" y="24" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M24 24V16C24 12 28 8 32 8C36 8 40 12 40 16V24" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="32" cy="36" r="4" fill="currentColor"/>
          </svg>
        ),
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Vision with custom SVG icons demonstrating ReactNode flexibility.',
      },
    },
  },
};

export const CustomIconRenderer: Story = {
  args: {
    title: 'Research Areas',
    headingLevel: 2,
    pillars: [
      {
        title: 'Quantum Machine Learning',
        description: 'Exploring how quantum computing can accelerate artificial intelligence and pattern recognition.',
        icon: '🤖',
      },
      {
        title: 'Cryptanalysis',
        description: 'Developing quantum algorithms for breaking classical encryption while building quantum-safe alternatives.',
        icon: '🔐',
      },
      {
        title: 'Simulation',
        description: 'Modeling complex quantum systems for materials science, chemistry, and physics research.',
        icon: '🧪',
      },
    ],
    iconRenderer: (icon, title) => (
      <div 
        className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-3xl shadow-lg"
        role="img"
        aria-label={`${title} icon`}
      >
        {icon}
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Vision with custom iconRenderer that adds styling and proper accessibility labels.',
      },
    },
  },
};
