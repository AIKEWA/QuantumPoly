/**
 * @fileoverview Storybook preview configuration
 * @module .storybook/preview
 */

import type { Preview } from '@storybook/react';
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    
    // Accessibility testing configuration
    a11y: {
      element: '#storybook-root',
      config: {},
      options: {},
      manual: true,
    },
    
    // Background options for theme testing
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#000000',
        },
        {
          name: 'gray',
          value: '#f3f4f6',
        },
      ],
    },
    
    // Viewport testing for responsive design
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1024px',
            height: '768px',
          },
        },
        largeDesktop: {
          name: 'Large Desktop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
    },
    
    // Documentation configuration
    docs: {
      toc: true,
      source: {
        excludeDecorators: true,
      },
    },
  },
  
  // Global decorators
  decorators: [
    (Story) => (
      <div className = "min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Story />
      </div>
    ),
  ],
  
  // Global args for all stories
  args: {},
  
  // Global arg types
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '""' },
      },
    },
    id: {
      control: 'text', 
      description: 'Component ID for testing and accessibility',
      table: {
        type: { summary: 'string' },
      },
    },
  },
  
  tags: ['autodocs']
};

export default preview;