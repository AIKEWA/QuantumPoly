/**
 * @fileoverview Storybook stories for About component
 * @module components/About.stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import About from './About';

const meta: Meta<typeof About> = {
  title: 'Components/About',
  component: About,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# About Component

A comprehensive about section featuring semantic HTML with proper heading hierarchy, full accessibility support with ARIA labels, responsive design with mobile-first approach, dark/light theme integration, internationalization through props, and screen reader optimized content structure.

## Features
- ✅ Semantic HTML with proper heading hierarchy
- ✅ Full accessibility support with ARIA labels
- ✅ Responsive design with mobile-first approach
- ✅ Dark/light theme integration via Tailwind CSS
- ✅ Internationalization through props
- ✅ Screen reader optimized content structure
- ✅ Optional image support with lazy loading
- ✅ Flexible content array for multiple paragraphs

## Accessibility Features
- ARIA landmarks and labels
- Proper heading hierarchy (h2)
- Screen reader helper text
- Focus management
- Alternative text for visual content
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
            id: 'heading-order',
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
        defaultValue: { summary: '"About QuantumPoly"' },
      },
    },
    content: {
      control: 'object',
      description: 'Array of content paragraphs',
      table: {
        type: { summary: 'string[]' },
      },
    },
    visualAltText: {
      control: 'text',
      description: 'Alternative text for visual content',
      table: {
        type: { summary: 'string' },
        defaultValue: {
          summary:
            '"Futuristic brain visualization representing AI and quantum computing integration"',
        },
      },
    },
    imageSrc: {
      control: 'text',
      description: 'Optional image source URL',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default about story
export const Default: Story = {
  args: {},
};

// About with custom content
export const CustomContent: Story = {
  args: {
    title: 'About Our Mission',
    content: [
      'We are a forward-thinking organization dedicated to advancing the intersection of technology and sustainability.',
      'Our team combines expertise in artificial intelligence, quantum computing, and environmental science to create solutions that benefit both humanity and our planet.',
      'Through collaborative research and innovative development, we strive to make complex technology accessible and beneficial for everyone.',
    ],
    visualAltText: 'Team collaboration in a modern tech environment',
  },
  parameters: {
    docs: {
      description: {
        story:
          'About component with custom content demonstrating multiple paragraphs and custom alt text.',
      },
    },
  },
};

// About with custom image
export const WithCustomImage: Story = {
  args: {
    title: 'Our Technology',
    content: [
      'Our cutting-edge laboratory houses state-of-the-art quantum computing equipment.',
      'We maintain the highest standards of research and development in our climate-controlled facilities.',
    ],
    imageSrc:
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop',
    visualAltText:
      'Modern quantum computing laboratory with advanced equipment',
  },
  parameters: {
    docs: {
      description: {
        story:
          'About component featuring a custom image instead of the default visualization.',
      },
    },
  },
};

// Multilingual example
export const Multilingual: Story = {
  args: {
    title: 'Über QuantumPoly',
    content: [
      'QuantumPoly ist ein visionäres KI-Startup, das die Zukunft neu denkt. Unsere Mission ist es, fortgeschrittene maschinelle Intelligenz mit ökologischer Nachhaltigkeit und immersiven digitalen Realitäten in Einklang zu bringen.',
      'Wir kombinieren modernste Quantencomputing-Prinzipien mit nachhaltigen KI-Praktiken, um transformative Lösungen für die nächste Generation von Technologien zu schaffen.',
    ],
    visualAltText:
      'Futuristische Gehirn-Visualisierung, die KI und Quantencomputing-Integration darstellt',
  },
  parameters: {
    docs: {
      description: {
        story:
          'About component displaying German content, showcasing internationalization support.',
      },
    },
  },
};

// Single paragraph content
export const SingleParagraph: Story = {
  args: {
    title: 'Brief Overview',
    content: [
      'QuantumPoly represents the convergence of quantum computing, artificial intelligence, and sustainable technology practices in a single, cohesive platform designed for the future.',
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'About component with a single paragraph of content for concise messaging.',
      },
    },
  },
};

// Long content variant
export const ExtensiveContent: Story = {
  args: {
    title: 'Comprehensive Overview',
    content: [
      'QuantumPoly stands at the forefront of technological innovation, merging the power of quantum computing with the intelligence of advanced AI systems. Our platform represents years of research and development in the field of sustainable technology.',
      'Founded by a team of leading scientists and engineers, we have established ourselves as pioneers in the integration of quantum mechanics principles with practical AI applications. Our commitment to environmental sustainability guides every aspect of our development process.',
      'Our research spans multiple disciplines, including quantum algorithm optimization, neural network architecture design, sustainable computing practices, and immersive virtual reality experiences. We believe that technology should enhance human capabilities while preserving our planet for future generations.',
      "Through strategic partnerships with academic institutions and industry leaders, we continue to push the boundaries of what's possible in quantum-enhanced artificial intelligence, always with an eye toward creating solutions that are both powerful and environmentally responsible.",
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'About component with extensive content to demonstrate how it handles longer text sections.',
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
          'About component displayed on dark background to showcase dark theme styling.',
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
    title: 'Accessibility-First Design',
    content: [
      'This About section demonstrates comprehensive accessibility features including semantic HTML structure, proper heading hierarchy, and screen reader optimization.',
      'All interactive and visual elements include appropriate ARIA labels and alternative text to ensure content is accessible to users with diverse abilities and assistive technologies.',
    ],
    visualAltText:
      'Demonstration of accessible design principles in modern web development',
  },
  parameters: {
    docs: {
      description: {
        story: `
This story demonstrates the accessibility features of the About component:

- **Semantic HTML**: Uses proper HTML5 semantic elements
- **Heading Hierarchy**: Maintains proper h2 heading level
- **ARIA Labels**: Includes appropriate ARIA landmarks and labels
- **Screen Reader Support**: Hidden helper text for navigation
- **Alternative Text**: Comprehensive alt text for visual content
- **Focus Management**: Keyboard accessible headings
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
          'About component optimized for mobile devices with responsive layout and spacing.',
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
        story: 'About component layout optimized for tablet screens.',
      },
    },
  },
};

// Empty content edge case
export const EmptyContent: Story = {
  args: {
    title: 'Section Title Only',
    content: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          'About component with empty content array to test graceful handling of edge cases.',
      },
    },
  },
};

// Custom styling example
export const CustomStyling: Story = {
  args: {
    title: 'Custom Styled Section',
    content: [
      'This About section demonstrates how custom CSS classes can be applied to modify the appearance while maintaining accessibility and functionality.',
    ],
    className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    id: 'custom-about-section',
  },
  parameters: {
    docs: {
      description: {
        story:
          'About component with custom styling applied via className prop.',
      },
    },
  },
};
