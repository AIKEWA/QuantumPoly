/**
 * @fileoverview Storybook stories for Footer component
 * @module components/Footer.stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import Footer from './Footer';
import { SocialLink } from '../types/components';

// Mock react-icons for Storybook
const mockIcon = (name: string) => (
  <div
    style={{
      width: '20px',
      height: '20px',
      background: '#cyan',
      borderRadius: '2px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      color: 'white',
    }}
  >
    {name}
  </div>
);

const meta: Meta<typeof Footer> = {
  title: 'Components/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Footer Component

A comprehensive site footer featuring accessible social media link navigation, semantic footer markup with proper landmarks, theme-aware styling with proper contrast, keyboard navigation and focus management, screen reader optimized content structure, customizable brand and copyright information, and responsive design with mobile-first approach.

## Features
- ✅ Accessible social media link navigation
- ✅ Semantic footer markup with proper landmarks
- ✅ Theme-aware styling with proper contrast
- ✅ Keyboard navigation and focus management
- ✅ Screen reader optimized content structure
- ✅ Customizable brand and copyright information
- ✅ Responsive design with mobile-first approach
- ✅ Additional footer links support
- ✅ Back-to-top skip link for accessibility

## Accessibility Features
- Proper contentinfo landmark
- Keyboard accessible social links
- Screen reader optimized navigation
- ARIA labels and descriptions
- Focus management and visual indicators
- Skip link for efficient navigation
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
            id: 'landmark-one-main',
            enabled: false, // Footer doesn't need main landmark
          },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    brandName: {
      control: 'text',
      description: 'Company or brand name',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"QuantumPoly"' },
      },
    },
    copyrightText: {
      control: 'text',
      description: 'Copyright notice text',
      table: {
        type: { summary: 'string' },
      },
    },
    tagline: {
      control: 'text',
      description: 'Company tagline or motto',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"Building the future, responsibly."' },
      },
    },
    socialLinks: {
      control: 'object',
      description: 'Array of social media links',
      table: {
        type: { summary: 'SocialLink[]' },
      },
    },
    footerLinks: {
      control: 'object',
      description: 'Additional footer navigation links',
      table: {
        type: { summary: 'Array<{label: string, href: string}>' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default footer story
export const Default: Story = {
  args: {},
};

// Footer with custom brand
export const CustomBrand: Story = {
  args: {
    brandName: 'TechCorp',
    copyrightText: '© 2024 TechCorp Industries. All rights reserved.',
    tagline: 'Innovation through technology.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Footer component with custom brand name, copyright, and tagline.',
      },
    },
  },
};

// Footer with custom social links
export const CustomSocialLinks: Story = {
  args: {
    socialLinks: [
      {
        icon: mockIcon('YT'),
        label: 'Watch our videos on YouTube',
        href: 'https://youtube.com/quantumpoly',
        platform: 'YouTube',
      },
      {
        icon: mockIcon('IG'),
        label: 'Follow us on Instagram',
        href: 'https://instagram.com/quantumpoly',
        platform: 'Instagram',
      },
      {
        icon: mockIcon('FB'),
        label: 'Like us on Facebook',
        href: 'https://facebook.com/quantumpoly',
        platform: 'Facebook',
      },
      {
        icon: mockIcon('TW'),
        label: 'Follow us on Twitter',
        href: 'https://twitter.com/quantumpoly',
        platform: 'Twitter',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Footer component with custom social media links and platforms.',
      },
    },
  },
};

// Footer with additional links
export const WithFooterLinks: Story = {
  args: {
    footerLinks: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: 'https://blog.quantumpoly.com' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Footer component with additional navigation links including both internal and external URLs.',
      },
    },
  },
};

// Footer without tagline
export const WithoutTagline: Story = {
  args: {
    tagline: undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Footer component without a tagline to demonstrate optional content.',
      },
    },
  },
};

// Minimal footer
export const Minimal: Story = {
  args: {
    brandName: 'Minimal',
    copyrightText: '© 2024 Minimal Inc.',
    tagline: undefined,
    socialLinks: [
      {
        icon: mockIcon('GH'),
        label: 'View our code on GitHub',
        href: 'https://github.com/minimal',
        platform: 'GitHub',
      },
    ],
    footerLinks: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal footer with only essential elements.',
      },
    },
  },
};

// Comprehensive footer
export const Comprehensive: Story = {
  args: {
    brandName: 'QuantumPoly Enterprise',
    copyrightText:
      '© 2024 QuantumPoly Enterprise Solutions. All rights reserved worldwide.',
    tagline:
      'Pioneering the future of quantum-enhanced artificial intelligence.',
    socialLinks: [
      {
        icon: mockIcon('TW'),
        label: 'Follow us on Twitter',
        href: 'https://twitter.com/quantumpoly',
        platform: 'Twitter',
      },
      {
        icon: mockIcon('LI'),
        label: 'Connect on LinkedIn',
        href: 'https://linkedin.com/company/quantumpoly',
        platform: 'LinkedIn',
      },
      {
        icon: mockIcon('GH'),
        label: 'View our code on GitHub',
        href: 'https://github.com/quantumpoly',
        platform: 'GitHub',
      },
      {
        icon: mockIcon('YT'),
        label: 'Watch our videos',
        href: 'https://youtube.com/quantumpoly',
        platform: 'YouTube',
      },
      {
        icon: mockIcon('DC'),
        label: 'Join our Discord',
        href: 'https://discord.gg/quantumpoly',
        platform: 'Discord',
      },
      {
        icon: mockIcon('RE'),
        label: 'Follow on Reddit',
        href: 'https://reddit.com/r/quantumpoly',
        platform: 'Reddit',
      },
    ],
    footerLinks: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Technology', href: '/technology' },
      { label: 'Research Papers', href: '/research' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Contact Support', href: '/support' },
      { label: 'Press Kit', href: '/press' },
      { label: 'Careers', href: '/careers' },
      { label: 'Investor Relations', href: '/investors' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive footer with extensive social links and navigation options.',
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
          'Footer component displayed on dark background to showcase dark theme styling.',
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
    brandName: 'Accessible Design Co.',
    tagline: 'Creating inclusive digital experiences for everyone.',
    socialLinks: [
      {
        icon: mockIcon('A11Y'),
        label: 'Learn about our accessibility initiatives',
        href: 'https://accessibility.example.com',
        platform: 'Accessibility',
      },
      {
        icon: mockIcon('WCAG'),
        label: 'View our WCAG compliance report',
        href: 'https://wcag.example.com',
        platform: 'WCAG',
      },
    ],
    footerLinks: [
      { label: 'Accessibility Statement', href: '/accessibility' },
      { label: 'Contact Accessibility Team', href: '/accessibility-contact' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: `
This story demonstrates the accessibility features of the Footer component:

- **Semantic Markup**: Uses proper contentinfo landmark
- **Keyboard Navigation**: All links are keyboard accessible
- **Screen Reader Support**: Proper labels and navigation structure
- **Focus Management**: Clear focus indicators
- **Skip Links**: Back-to-top functionality for efficient navigation
- **External Link Handling**: Proper target and rel attributes
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
          'Footer component optimized for mobile devices with responsive layout.',
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
        story: 'Footer component layout optimized for tablet screens.',
      },
    },
  },
};

// No social links
export const NoSocialLinks: Story = {
  args: {
    socialLinks: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Footer component with no social media links to test graceful handling.',
      },
    },
  },
};

// Long brand name
export const LongBrandName: Story = {
  args: {
    brandName: 'QuantumPoly Advanced Research & Development Corporation',
    copyrightText:
      '© 2024 QuantumPoly Advanced Research & Development Corporation. All rights reserved.',
    tagline:
      'Leading the way in quantum computing, artificial intelligence, and sustainable technology solutions.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Footer component with long brand name and content to test responsive text handling.',
      },
    },
  },
};

// International links
export const InternationalLinks: Story = {
  args: {
    brandName: 'Global Tech Solutions',
    footerLinks: [
      { label: 'United States', href: '/us' },
      { label: 'Europe', href: '/eu' },
      { label: 'Asia Pacific', href: '/apac' },
      { label: 'Privacy (GDPR)', href: '/privacy-gdpr' },
      { label: 'Privacy (CCPA)', href: '/privacy-ccpa' },
      { label: 'International Support', href: 'https://support.global.com' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Footer component with international links and region-specific content.',
      },
    },
  },
};
