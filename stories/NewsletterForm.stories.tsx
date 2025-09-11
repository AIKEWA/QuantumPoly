import type { Meta, StoryObj } from '@storybook/react';

import { NewsletterForm } from '@/components/NewsletterForm';

const meta: Meta<typeof NewsletterForm> = {
  title: 'Components/NewsletterForm',
  component: NewsletterForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The NewsletterForm component provides an accessible email subscription form:

- **i18n Ready**: All text comes from props, no hardcoded strings
- **Form Validation**: Client-side email validation with custom regex support
- **Accessibility**: Proper labeling, error states, ARIA live regions
- **Async Support**: Integration with external APIs via onSubscribe prop
- **UX Optimized**: Loading states, success feedback, error handling

## Accessibility

- **Heading level**: h2 (page retains a single h1)
- **Landmark**: Section uses \`role="region"\` linked via \`aria-labelledby\`
- **Form feedback**: Non-critical feedback in \`role="status"\` (polite); reserve \`role="alert"\` for critical failures
- **Live regions**: \`aria-live="polite"\` by design for non-intrusive announcements
- **Error states**: \`aria-invalid\` and \`aria-describedby\` for proper screen reader experience

### Usage Notes
- \`validationRegex\` allows custom email validation patterns
- Error and success states are announced via aria-live regions
- Form submission can be handled via \`onSubscribe\` prop or falls back to default behavior
- All interactive elements are keyboard accessible
        `,
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Form heading text',
    },
    description: {
      control: 'text',
      description: 'Optional description text below title',
    },
    emailLabel: {
      control: 'text',
      description: 'Accessible label for email input',
    },
    emailPlaceholder: {
      control: 'text',
      description: 'Placeholder text for email input',
    },
    submitLabel: {
      control: 'text',
      description: 'Text for submit button',
    },
    successMessage: {
      control: 'text',
      description: 'Message shown on successful submission',
    },
    errorMessage: {
      control: 'text',
      description: 'Message shown on validation or submission error',
    },
    onSubscribe: {
      description: 'Async function called with email on form submission',
    },
    validationRegex: {
      control: false,
      description: 'Custom regex pattern for email validation',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    onSubscribe: async (email: string) => {
      console.log('Newsletter subscription:', email);
      return Promise.resolve();
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Stay Updated with QuantumPoly',
    description: 'Get the latest news about quantum computing breakthroughs and platform updates.',
    emailLabel: 'Email address',
    emailPlaceholder: 'Enter your email address',
    submitLabel: 'Subscribe to Newsletter',
    successMessage: 'Successfully subscribed!',
    errorMessage: 'Please enter a valid email address',
  },
};

export const DarkMode: Story = {
  args: {
    title: 'Stay Updated with QuantumPoly',
    description: 'Get the latest news about quantum computing breakthroughs and platform updates.',
    emailLabel: 'Email address',
    emailPlaceholder: 'Enter your email address',
    submitLabel: 'Subscribe to Newsletter',
    successMessage: 'Successfully subscribed!',
    errorMessage: 'Please enter a valid email address',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story:
          'Newsletter form with dark theme applied demonstrating accessible contrast and live region behavior.',
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
    title: 'Newsletter Signup',
    emailLabel: 'Email',
    emailPlaceholder: 'your@email.com',
    submitLabel: 'Subscribe',
    successMessage: 'Subscribed!',
    errorMessage: 'Invalid email',
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal newsletter form without description.',
      },
    },
  },
};

export const WithCustomValidation: Story = {
  args: {
    title: 'Exclusive Research Updates',
    description: 'Academic and enterprise subscribers only. Please use your institutional email.',
    emailLabel: 'Institutional email address',
    emailPlaceholder: 'researcher@university.edu',
    submitLabel: 'Join Research Network',
    successMessage: 'Welcome to our research network!',
    errorMessage: 'Please use a valid institutional email address',
    validationRegex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|gov|org|ac\.[a-z]{2})$/,
  },
  parameters: {
    docs: {
      description: {
        story: 'Newsletter form with custom validation for institutional emails only.',
      },
    },
  },
};

export const AsyncSimulation: Story = {
  args: {
    title: 'Developer API Access',
    description: 'Sign up for early access to our quantum computing API.',
    emailLabel: 'Developer email',
    emailPlaceholder: 'developer@company.com',
    submitLabel: 'Request Access',
    successMessage: 'Access request submitted!',
    errorMessage: 'Submission failed. Please try again.',
    onSubscribe: async (email: string) => {
      console.log('Developer API access request:', email);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (email.includes('test-error')) {
        throw new Error('Simulated error');
      }
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Newsletter form with simulated async submission (2 second delay). Try "test-error@example.com" to trigger an error.',
      },
    },
  },
};

export const CompactStyle: Story = {
  args: {
    title: 'Quick Subscribe',
    emailLabel: 'Email',
    emailPlaceholder: 'Quick signup',
    submitLabel: 'Go',
    successMessage: '✓ Done',
    errorMessage: 'Try again',
    className: 'max-w-sm',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact newsletter form with shorter labels and custom styling.',
      },
    },
  },
};

export const DetailedForm: Story = {
  args: {
    title: 'QuantumPoly Research Newsletter',
    description:
      'Join thousands of researchers, developers, and quantum computing enthusiasts who rely on our weekly newsletter for the latest breakthroughs in quantum algorithms, hardware developments, and industry applications. Unsubscribe anytime.',
    emailLabel: 'Your email address',
    emailPlaceholder: 'Enter your email to join our community',
    submitLabel: 'Subscribe to Weekly Updates',
    successMessage: 'Thank you! Check your email to confirm your subscription.',
    errorMessage: 'Please enter a valid email address to continue',
  },
  parameters: {
    docs: {
      description: {
        story: 'Detailed newsletter form with comprehensive copy and longer labels.',
      },
    },
  },
};

export const ErrorState: Story = {
  args: {
    title: 'Newsletter Signup',
    description: 'Stay informed about our latest developments.',
    emailLabel: 'Email address',
    emailPlaceholder: 'Enter your email',
    submitLabel: 'Subscribe',
    successMessage: 'Successfully subscribed!',
    errorMessage: 'Please enter a valid email address',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Form pre-configured to show error state. Type an invalid email and submit to see error handling.',
      },
    },
  },
  play: async () => {
    // Note: In real Storybook, you could use @storybook/addon-interactions
    // to automatically trigger the error state for demonstration
  },
};
