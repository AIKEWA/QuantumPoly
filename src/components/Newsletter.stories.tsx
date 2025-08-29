/**
 * @fileoverview Storybook stories for Newsletter component
 * @module components/Newsletter.stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import Newsletter from './Newsletter';

const meta: Meta<typeof Newsletter> = {
  title: 'Components/Newsletter',
  component: Newsletter,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Newsletter Component

A comprehensive newsletter signup form featuring full accessibility with ARIA labels and error handling, email validation and loading states, theme-aware styling with proper contrast, keyboard navigation and focus management, success and error state handling, screen reader optimized feedback, and sanitized input handling for security.

## Features
- ✅ Full accessibility with ARIA labels and error handling
- ✅ Email validation and loading states
- ✅ Theme-aware styling with proper contrast
- ✅ Keyboard navigation and focus management
- ✅ Success and error state handling
- ✅ Screen reader optimized feedback
- ✅ Sanitized input handling for security
- ✅ Customizable messages and content
- ✅ Responsive design with mobile-first approach

## Security Features
- Input sanitization to prevent XSS attacks
- Email format validation
- Secure form submission handling

## Accessibility Features
- Semantic form structure with proper labels
- ARIA live regions for status updates
- Keyboard accessible form controls
- Screen reader announcements for state changes
- Error message association with form fields
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
            id: 'label',
            enabled: true,
          },
          {
            id: 'form-field-multiple-labels',
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
      description: 'Newsletter section heading',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"Stay Connected"' },
      },
    },
    description: {
      control: 'text',
      description: 'Description text below the heading',
      table: {
        type: { summary: 'string' },
        defaultValue: {
          summary: '"Sign up for updates on our journey into the future."',
        },
      },
    },
    emailPlaceholder: {
      control: 'text',
      description: 'Placeholder text for email input',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"Enter your email"' },
      },
    },
    subscribeText: {
      control: 'text',
      description: 'Text for the subscribe button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"Subscribe"' },
      },
    },
    privacyText: {
      control: 'text',
      description: 'Privacy notice text',
      table: {
        type: { summary: 'string' },
        defaultValue: {
          summary: '"We respect your privacy. Unsubscribe at any time."',
        },
      },
    },
    onSubmit: {
      action: 'form-submitted',
      description: 'Callback function when form is submitted',
      table: {
        type: { summary: '(email: string) => void | Promise<void>' },
      },
    },
    isLoading: {
      control: 'boolean',
      description: 'External loading state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    successMessage: {
      control: 'text',
      description: 'Custom success message',
      table: {
        type: { summary: 'string' },
      },
    },
    errorMessage: {
      control: 'text',
      description: 'Custom error message',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default newsletter story
export const Default: Story = {
  args: {
    onSubmit: () => {},
  },
};

// Newsletter with custom content
export const CustomContent: Story = {
  args: {
    title: 'Join Our Community',
    description:
      'Get exclusive insights, early access to new features, and industry updates delivered to your inbox.',
    emailPlaceholder: 'your.email@example.com',
    subscribeText: 'Join Now',
    privacyText: 'Your privacy is our priority. No spam, unsubscribe anytime.',
    onSubmit: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Newsletter component with customized content and messaging.',
      },
    },
  },
};

// Loading state
export const LoadingState: Story = {
  args: {
    isLoading: true,
    onSubmit: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Newsletter component in loading state with disabled form elements.',
      },
    },
  },
};

// Success state
export const SuccessState: Story = {
  args: {
    successMessage:
      'Thank you! Please check your email to confirm your subscription.',
    onSubmit: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Newsletter component displaying success message after submission.',
      },
    },
  },
};

// Error state
export const ErrorState: Story = {
  args: {
    errorMessage: 'Oops! Something went wrong. Please try again later.',
    onSubmit: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Newsletter component displaying error message.',
      },
    },
  },
};

// Multilingual example
export const Multilingual: Story = {
  args: {
    title: 'Restez Connecté',
    description:
      'Inscrivez-vous pour recevoir des mises à jour sur notre voyage vers le futur.',
    emailPlaceholder: 'Entrez votre email',
    subscribeText: "S'abonner",
    privacyText:
      'Nous respectons votre vie privée. Désabonnez-vous à tout moment.',
    onSubmit: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Newsletter component displaying French content, showcasing internationalization support.',
      },
    },
  },
};

// Dark theme showcase
export const DarkTheme: Story = {
  args: {
    onSubmit: () => {},
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story:
          'Newsletter component displayed on dark background to showcase dark theme styling.',
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
    title: 'Accessible Newsletter Signup',
    description:
      'This form demonstrates comprehensive accessibility features including keyboard navigation, screen reader support, and error handling.',
    onSubmit: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: `
This story demonstrates the accessibility features of the Newsletter component:

- **Keyboard Navigation**: Tab through form elements and submit with Enter
- **Screen Reader Support**: Proper labels, ARIA live regions, and status updates
- **Error Handling**: Clear error messages associated with form fields
- **Form Validation**: Client-side validation with accessible feedback
- **Loading States**: Accessible loading indicators and disabled states
        `,
      },
    },
    a11y: {
      manual: false,
    },
  },
};

// Interactive demo
export const InteractiveDemo: Story = {
  args: {
    onSubmit: async (email: string) => {
      // simulate calling a submission handler
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Randomly succeed or fail for demo
      if (Math.random() > 0.3) {
        return Promise.resolve();
      } else {
        throw new Error('Demo error for testing');
      }
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo that simulates real form submission with loading and success/error states.',
      },
    },
  },
  play: async () => {},
};

// Mobile responsive
export const Mobile: Story = {
  args: {
    onSubmit: () => {},
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story:
          'Newsletter component optimized for mobile devices with responsive form layout.',
      },
    },
  },
};

// Tablet responsive
export const Tablet: Story = {
  args: {
    onSubmit: () => {},
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Newsletter component layout optimized for tablet screens.',
      },
    },
  },
};

// Form validation demo
export const ValidationDemo: Story = {
  args: {
    title: 'Email Validation Demo',
    description:
      'Try entering invalid email formats to see validation in action.',
    onSubmit: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Newsletter component demonstrating email validation with immediate feedback.',
      },
    },
  },
  play: async () => {},
};

// Security demo
export const SecurityDemo: Story = {
  args: {
    title: 'Security Features Demo',
    description:
      'This form sanitizes inputs to prevent XSS attacks and validates email formats.',
    onSubmit: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Newsletter component demonstrating input sanitization and security features.',
      },
    },
  },
};

// Without callback
export const WithoutCallback: Story = {
  args: {
    title: 'Fallback Behavior',
    description:
      'This newsletter form demonstrates fallback behavior when no onSubmit callback is provided.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Newsletter component without onSubmit callback, showing fallback success message.',
      },
    },
  },
};
