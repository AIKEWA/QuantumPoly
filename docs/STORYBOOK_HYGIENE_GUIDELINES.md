# Storybook Guidelines for QuantumPoly

## Overview

This document establishes standards and best practices for writing, organizing, and maintaining Storybook stories within the QuantumPoly project. These guidelines ensure consistency, maintainability, and optimal developer experience.

## Core Principles

### 1. **Component Story Format 3 (CSF3)**
All stories must use the latest CSF3 format for optimal TypeScript integration and modern tooling support.

### 2. **Accessibility First**
Every story must include accessibility testing and demonstrate proper ARIA usage.

### 3. **Real-world Examples**
Stories should reflect realistic usage scenarios, not just isolated component states.

### 4. **Documentation as Code**
Stories serve as living documentation—they must be self-explanatory and comprehensive.

---

## File Structure & Naming

### Directory Organization
```
src/components/
├── ComponentName/
│   ├── ComponentName.tsx
│   ├── ComponentName.stories.tsx
│   ├── ComponentName.test.tsx
│   └── index.ts
└── stories/
    ├── ComponentName.stories.tsx  (legacy - migrate to component directory)
    └── ...
```

### Naming Conventions
- **Story files**: `ComponentName.stories.tsx`
- **Story titles**: `Components/ComponentName` (use forward slashes for hierarchy)
- **Story names**: `Default`, `WithProps`, `ErrorState`, `Loading`, etc.

---

## Story Structure Template

```typescript
// ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    // Enable accessibility testing
    a11y: { 
      disable: false,
      config: {
        rules: [
          // Custom accessibility rules if needed
        ]
      }
    },
    // Optional: Add layout parameters
    layout: 'centered', // or 'fullscreen', 'padded'
    // Optional: Background variants
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
  // Define component args with proper types
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Size variant of the component',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the component is disabled',
    },
  },
  // Global decorators if needed
  decorators: [
    (Story) => (
      <div style={{ margin: '3em' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - most common usage
export const Default: Story = {
  args: {
    // Realistic default props
    title: 'Component Title',
    description: 'Component description',
  },
};

// Variants demonstrating different states
export const WithCustomProps: Story = {
  args: {
    ...Default.args,
    size: 'large',
    variant: 'primary',
  },
};

export const ErrorState: Story = {
  args: {
    ...Default.args,
    error: 'Something went wrong',
  },
  // Optional: Add play function for interactions
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Simulate user interactions
    await userEvent.click(canvas.getByRole('button'));
    
    // Assert expected behavior
    await expect(canvas.getByText('Error message')).toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
  },
};

// Accessibility showcase
export const AccessibilityDemo: Story = {
  args: {
    ...Default.args,
    'aria-label': 'Accessible component example',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates proper accessibility implementation with ARIA labels and keyboard navigation.',
      },
    },
  },
};
```

---

## Required Story Types

Every component should include these standard story variants:

### 1. **Default**
- Most common usage scenario
- Realistic prop values
- Should represent the component "out of the box"

### 2. **All Variants**
- Cover all prop combinations that significantly change appearance
- Include size variants, color schemes, states

### 3. **Interactive States**
- Hover, focus, active states
- Use `play` functions to demonstrate interactions

### 4. **Error/Edge Cases**
- Error states
- Loading states
- Empty/no-data states
- Disabled states

### 5. **Accessibility Examples**
- Screen reader scenarios
- Keyboard navigation
- High contrast mode
- Reduced motion preferences

---

## Controls Configuration

### ArgTypes Best Practices

```typescript
argTypes: {
  // For enum/union types
  variant: {
    control: { type: 'select' },
    options: ['primary', 'secondary', 'danger'],
    description: 'Visual variant of the component',
    table: {
      type: { summary: 'primary | secondary | danger' },
      defaultValue: { summary: 'primary' },
    },
  },
  
  // For boolean props
  disabled: {
    control: 'boolean',
    description: 'Disables user interaction',
  },
  
  // For numeric props
  maxWidth: {
    control: { type: 'number', min: 100, max: 800, step: 50 },
    description: 'Maximum width in pixels',
  },
  
  // For text props
  placeholder: {
    control: 'text',
    description: 'Placeholder text for input',
  },
  
  // For complex objects (avoid if possible)
  config: {
    control: 'object',
    description: 'Configuration object',
  },
  
  // Hide props that shouldn't be controlled
  className: {
    control: false,
    table: { disable: true },
  },
}
```

---

## Accessibility Standards

### Required Accessibility Features

1. **ARIA Labels and Descriptions**
   ```typescript
   // Always include proper ARIA attributes in stories
   args: {
     'aria-label': 'Submit form',
     'aria-describedby': 'submit-help-text',
   }
   ```

2. **Keyboard Navigation**
   ```typescript
   // Use play functions to test keyboard interactions
   play: async ({ canvasElement }) => {
     const canvas = within(canvasElement);
     
     // Test tab navigation
     await userEvent.tab();
     await expect(canvas.getByRole('button')).toHaveFocus();
     
     // Test enter/space activation
     await userEvent.keyboard('{Enter}');
   }
   ```

3. **Color Contrast**
   ```typescript
   parameters: {
     a11y: {
       config: {
         rules: [
           {
             id: 'color-contrast',
             enabled: true,
           },
         ],
       },
     },
   }
   ```

### Accessibility Story Template

```typescript
export const AccessibilityDemo: Story = {
  args: {
    'aria-label': 'Accessible component',
    'aria-describedby': 'component-description',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates accessibility features including ARIA labels, keyboard navigation, and screen reader support.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test keyboard navigation
    await userEvent.tab();
    await expect(canvas.getByRole('button')).toHaveFocus();
    
    // Test screen reader announcements
    const button = canvas.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  },
};
```

---

## Interactive Stories with Play Functions

### Basic Play Function

```typescript
import { userEvent, within, expect } from '@storybook/test';

export const InteractiveExample: Story = {
  args: {
    onClick: fn(), // Use fn() for action logging
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Find and interact with elements
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    
    // Verify the interaction
    expect(args.onClick).toHaveBeenCalled();
  },
};
```

### Complex Interaction Scenarios

```typescript
export const FormSubmissionFlow: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Fill out form
    const emailInput = canvas.getByLabelText('Email');
    await userEvent.type(emailInput, 'test@example.com');
    
    // Submit form
    const submitButton = canvas.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);
    
    // Wait for and verify async behavior
    await waitFor(() => {
      expect(canvas.getByText('Success!')).toBeInTheDocument();
    });
  },
};
```

---

## Documentation Integration

### Component Documentation

```typescript
const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    docs: {
      description: {
        component: 'A reusable component that provides [specific functionality]. Used throughout the application for [use cases].',
      },
    },
  },
};
```

### Story-Level Documentation

```typescript
export const ComplexExample: Story = {
  parameters: {
    docs: {
      description: {
        story: 'This example demonstrates how to handle complex state interactions and error scenarios.',
      },
    },
  },
};
```

---

## Performance Considerations

### Optimize Story Performance

1. **Avoid Heavy Computations**
   ```typescript
   // ❌ Don't do heavy computations in render
   const heavyData = generateLargeDataset();
   
   // ✅ Use static data or lazy initialization
   const staticData = useMemo(() => generateLargeDataset(), []);
   ```

2. **Mock External Dependencies**
   ```typescript
   // Mock API calls and external services
   parameters: {
     msw: {
       handlers: [
         rest.get('/api/data', (req, res, ctx) => {
           return res(ctx.json({ data: 'mocked' }));
         }),
       ],
     },
   }
   ```

3. **Use Controls Sparingly**
   ```typescript
   // Only expose controls that provide value
   argTypes: {
     internalState: { table: { disable: true } },
     onInternalCallback: { control: false },
   }
   ```

---

## Maintenance Guidelines

### Story Review Checklist

Before merging stories, ensure:

- [ ] **CSF3 format** with proper TypeScript types
- [ ] **Accessibility testing** enabled and configured
- [ ] **Realistic args** that represent actual usage
- [ ] **All major variants** covered (size, state, props)
- [ ] **Interactive examples** with play functions where applicable
- [ ] **Documentation** describes the component and its usage
- [ ] **Controls** are properly configured with descriptions
- [ ] **Performance** considerations addressed

### Regular Maintenance Tasks

1. **Quarterly Review**
   - Update stories to match component changes
   - Remove deprecated examples
   - Add new variant examples

2. **Accessibility Audit**
   - Run accessibility tests on all stories
   - Update ARIA patterns based on latest guidelines
   - Test with screen readers

3. **Performance Monitoring**
   - Check story load times
   - Optimize heavy stories
   - Update mocks and data

---

## Common Patterns & Examples

### Form Components

```typescript
export const FormExample: Story = {
  args: {
    onSubmit: fn(),
    onValidate: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test validation
    const input = canvas.getByRole('textbox');
    await userEvent.type(input, 'invalid-email');
    await userEvent.tab(); // Trigger validation
    
    expect(args.onValidate).toHaveBeenCalled();
    expect(canvas.getByText(/invalid email/i)).toBeInTheDocument();
  },
};
```

### Loading States

```typescript
export const LoadingState: Story = {
  args: {
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading state with proper accessibility announcements.',
      },
    },
  },
};
```

### Error Boundaries

```typescript
export const ErrorState: Story = {
  args: {
    shouldThrowError: true,
  },
  decorators: [
    (Story) => (
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Story />
      </ErrorBoundary>
    ),
  ],
};
```

---

## Migration Guide

### Migrating Legacy Stories

1. **Update to CSF3**
   ```typescript
   // Old format
   export default {
     title: 'ComponentName',
     component: ComponentName,
   };
   
   export const Default = () => <ComponentName />;
   
   // New format
   const meta: Meta<typeof ComponentName> = {
     title: 'Components/ComponentName',
     component: ComponentName,
   };
   
   export default meta;
   export const Default: StoryObj<typeof meta> = {};
   ```

2. **Add Type Safety**
   - Import proper types from `@storybook/react`
   - Use `Meta` and `StoryObj` types
   - Ensure `args` match component props

3. **Enable Accessibility**
   - Add `a11y` parameters
   - Include accessibility-focused stories
   - Test with play functions

---

## Tooling Integration

### VS Code Extensions
- **Storybook Extension**: Auto-completion and navigation
- **ES7+ React/Redux/React-Native**: Code snippets
- **Auto Rename Tag**: Consistent JSX editing

### Development Workflow
1. **Create component** with TypeScript interface
2. **Write basic story** with `Default` example
3. **Add variants** for different props/states
4. **Include accessibility** examples and tests
5. **Document usage** and integration notes
6. **Review and iterate** based on team feedback

---

## Conclusion

Following these guidelines ensures that our Storybook remains a valuable tool for development, testing, and documentation. Stories should be treated as first-class citizens in our codebase, maintained with the same rigor as production code.

For questions or suggestions regarding these guidelines, please reach out to the frontend architecture team or create an issue in the project repository.