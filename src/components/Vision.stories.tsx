/**
 * @fileoverview Storybook stories for Vision component
 * @module components/Vision.stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Vision from './Vision';
import { VisionPillar } from '../types/components';

const meta: Meta<typeof Vision> = {
  title: 'Components/Vision',
  component: Vision,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Vision Component

Displays company vision pillars with accessible card-based layout, keyboard navigation support, screen reader optimization, responsive grid system, theme-aware styling, interactive hover states, and semantic markup structure.

## Features
- ✅ Accessible card-based layout with proper semantics
- ✅ Keyboard navigation support for interactive elements
- ✅ Screen reader optimization with ARIA labels
- ✅ Responsive grid system (1-2-3 column layout)
- ✅ Theme-aware styling with dark/light mode
- ✅ Interactive hover and focus states
- ✅ Optional clickable pillars with external links
- ✅ Customizable pillar content and icons

## Accessibility Features
- List semantics with proper role attributes
- Keyboard navigation for clickable pillars
- Screen reader guidance text
- ARIA labels and descriptions
- Focus management and visual indicators
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
            id: 'keyboard',
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
      description: 'Section heading text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"Our Vision"' },
      },
    },
    pillars: {
      control: 'object',
      description: 'Array of vision pillars to display',
      table: {
        type: { summary: 'VisionPillar[]' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default vision story
export const Default: Story = {
  args: {},
};

// Custom vision with different pillars
export const CustomVision: Story = {
  args: {
    title: 'Our Core Values',
    pillars: [
      {
        icon: '🚀',
        title: 'Innovation',
        description:
          "Pushing the boundaries of what's possible through cutting-edge research and development.",
      },
      {
        icon: '🤝',
        title: 'Collaboration',
        description:
          'Working together with partners, communities, and stakeholders to achieve shared goals.',
      },
      {
        icon: '🎯',
        title: 'Excellence',
        description:
          'Maintaining the highest standards in everything we do, from code quality to customer service.',
      },
      {
        icon: '🌍',
        title: 'Global Impact',
        description:
          'Creating solutions that benefit people and communities around the world.',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Vision component with custom pillars demonstrating four-column layout and different content.',
      },
    },
  },
};

// Vision with clickable pillars
export const ClickablePillars: Story = {
  args: {
    title: 'Explore Our Technologies',
    pillars: [
      {
        icon: '🧠',
        title: 'Artificial Intelligence',
        description:
          'Advanced neural networks and machine learning algorithms. Click to learn more.',
        href: 'https://example.com/ai',
      },
      {
        icon: '⚛️',
        title: 'Quantum Computing',
        description:
          'Quantum algorithms and computational breakthroughs. Click to explore.',
        href: 'https://example.com/quantum',
      },
      {
        icon: '🌐',
        title: 'Web Technologies',
        description:
          'Modern web development and user experience design. Click for details.',
        href: 'https://example.com/web',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Vision component with clickable pillars that open external links. Supports both mouse and keyboard interaction.',
      },
    },
  },
};

// Minimal pillars
export const MinimalContent: Story = {
  args: {
    title: 'Simple Vision',
    pillars: [
      {
        icon: '✨',
        title: 'Quality',
        description: 'Excellence in execution.',
      },
      {
        icon: '🔮',
        title: 'Future',
        description: 'Innovation for tomorrow.',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Vision component with minimal content and only two pillars.',
      },
    },
  },
};

// Extensive content
export const ExtensiveContent: Story = {
  args: {
    title: 'Comprehensive Technology Stack',
    pillars: [
      {
        icon: '🤖',
        title: 'Artificial Intelligence & Machine Learning',
        description:
          'Our AI systems leverage advanced neural networks, deep learning architectures, and sophisticated machine learning algorithms to process complex data patterns and deliver intelligent insights that enhance human decision-making capabilities.',
      },
      {
        icon: '🌱',
        title: 'Sustainable Computing & Green Technology',
        description:
          'We are committed to developing environmentally responsible computing solutions that minimize energy consumption, reduce carbon footprints, and promote sustainable practices throughout the entire technology lifecycle.',
      },
      {
        icon: '🕶️',
        title: 'Immersive Technologies & Metaverse',
        description:
          'Our metaverse platform creates seamless bridges between physical and virtual realities, enabling immersive experiences that enhance collaboration, education, and entertainment while maintaining user privacy and security.',
      },
      {
        icon: '⚡',
        title: 'Quantum Computing & Advanced Algorithms',
        description:
          'We harness the power of quantum mechanics to solve complex computational problems that are intractable for classical computers, opening new possibilities in cryptography, optimization, and scientific simulation.',
      },
      {
        icon: '🔒',
        title: 'Cybersecurity & Privacy Protection',
        description:
          'Our security frameworks implement state-of-the-art encryption, zero-trust architectures, and privacy-preserving technologies to protect user data and maintain trust in digital interactions.',
      },
      {
        icon: '🌐',
        title: 'Distributed Systems & Cloud Infrastructure',
        description:
          'We design and operate scalable, resilient distributed systems that can handle massive workloads while maintaining high availability, performance, and data consistency across global networks.',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Vision component with six pillars and extensive content to test responsive layout and text handling.',
      },
    },
  },
};

// Multilingual example
export const Multilingual: Story = {
  args: {
    title: 'Notre Vision',
    pillars: [
      {
        icon: '🧠',
        title: 'Intelligence Artificielle',
        description:
          'Réseaux de neurones avancés et algorithmes quantiques pour augmenter le potentiel humain de manière responsable et éthique.',
      },
      {
        icon: '🌱',
        title: 'Durabilité',
        description:
          'Chaque innovation soutient la santé planétaire, garantissant que le progrès technologique préserve notre environnement.',
      },
      {
        icon: '🕶️',
        title: 'Intégration Métaverse',
        description:
          'Créer des expériences numériques immersives et inclusives qui comblent le fossé entre les réalités virtuelles et physiques.',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Vision component displaying French content, showcasing internationalization support.',
      },
    },
  },
};

// Dark theme showcase
export const DarkTheme: Story = {
  args: {},
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story:
          'Vision component displayed on dark background to showcase dark theme styling.',
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
    title: 'Accessibility-First Vision',
    pillars: [
      {
        icon: '♿',
        title: 'Universal Design',
        description:
          'Creating technology that is accessible to users of all abilities through inclusive design principles and assistive technology support.',
        href: 'https://example.com/accessibility',
      },
      {
        icon: '🎯',
        title: 'WCAG Compliance',
        description:
          'Adhering to Web Content Accessibility Guidelines to ensure our products meet international accessibility standards.',
      },
      {
        icon: '🔤',
        title: 'Screen Reader Support',
        description:
          'Optimizing content structure and markup to provide excellent screen reader experiences for visually impaired users.',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: `
This story demonstrates the accessibility features of the Vision component:

- **Keyboard Navigation**: Tab through pillars and use Enter/Space to activate links
- **Screen Reader Support**: Uses semantic list markup and ARIA labels
- **Focus Management**: Clear focus indicators and logical tab order
- **Interactive Feedback**: Visual and auditory feedback for interactions
- **Semantic Markup**: Proper heading hierarchy and landmark roles
        `,
      },
    },
    a11y: {
      manual: false,
    },
  },
};

// Mobile responsive
export const Mobile: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story:
          'Vision component optimized for mobile devices with single-column layout.',
      },
    },
  },
};

// Tablet responsive
export const Tablet: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story:
          'Vision component layout optimized for tablet screens with two-column grid.',
      },
    },
  },
};

// Empty pillars edge case
export const EmptyPillars: Story = {
  args: {
    title: 'Vision Section',
    pillars: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Vision component with empty pillars array to test graceful handling of edge cases.',
      },
    },
  },
};

// Single pillar
export const SinglePillar: Story = {
  args: {
    title: 'Core Focus',
    pillars: [
      {
        icon: '🎯',
        title: 'Excellence',
        description:
          'Our singular focus on delivering exceptional quality in everything we create.',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Vision component with a single pillar to test layout flexibility.',
      },
    },
  },
};

// Mixed interactive and static pillars
export const MixedInteraction: Story = {
  args: {
    title: 'Our Approach',
    pillars: [
      {
        icon: '📚',
        title: 'Research',
        description:
          'Continuous learning and investigation into emerging technologies.',
      },
      {
        icon: '🛠️',
        title: 'Development',
        description:
          'Building robust, scalable solutions. Click to see our projects.',
        href: 'https://example.com/projects',
      },
      {
        icon: '🚀',
        title: 'Deployment',
        description: 'Delivering solutions that make a real-world impact.',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Vision component mixing clickable and non-clickable pillars to demonstrate interaction patterns.',
      },
    },
  },
};
