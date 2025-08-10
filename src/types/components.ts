/**
 * @fileoverview Component type definitions for internationalization and accessibility
 * @module types/components
 */

// Base interface for all components with internationalization support
export interface BaseComponentProps {
  /** Additional CSS classes for styling customization */
  className?: string;
  /** Component ID for testing and accessibility */
  id?: string;
  /** Language locale for component content */
  locale?: string;
}

// Hero component props interface
export interface HeroProps extends BaseComponentProps {
  /** Main heading text (optional - uses translation if not provided) */
  title?: string;
  /** Subtitle/description text (optional - uses translation if not provided) */
  subtitle?: string;
  /** Call-to-action button text (optional - uses translation if not provided) */
  ctaText?: string;
  /** Call-to-action button click handler */
  onCtaClick?: () => void;
  /** Alternative text for decorative elements (optional - uses translation if not provided) */
  scrollIndicatorLabel?: string;
}

// About component props interface
export interface AboutProps extends BaseComponentProps {
  /** Section heading (optional - uses translation if not provided) */
  title?: string;
  /** Main description text (optional - uses translation if not provided) */
  description?: string;
  /** Alt text for visual content */
  visualAltText?: string;
  /** Optional image source for the about section */
  imageSrc?: string;
}

// Vision pillar interface
export interface VisionPillar {
  /** Emoji or icon for the pillar */
  icon: string;
  /** Pillar title */
  title: string;
  /** Pillar description */
  description: string;
  /** Optional link for more information */
  href?: string;
}

// Vision component props interface
export interface VisionProps extends BaseComponentProps {
  /** Section heading (optional - uses translation if not provided) */
  title?: string;
  /** Description text (optional - uses translation if not provided) */
  description?: string;
}

// Newsletter component props interface
export interface NewsletterProps extends BaseComponentProps {
  /** Section heading (optional - uses translation if not provided) */
  title?: string;
  /** Description text (optional - uses translation if not provided) */
  description?: string;
  /** Email input placeholder text (optional - uses translation if not provided) */
  placeholder?: string;
  /** Subscribe button text (optional - uses translation if not provided) */
  subscribeText?: string;
  /** Privacy notice text (optional - uses translation if not provided) */
  privacyNote?: string;
  /** Form submission handler */
  onSubmit?: (email: string) => void | Promise<void>;
  /** Loading state */
  isLoading?: boolean;
  /** Success message (optional - uses translation if not provided) */
  successMessage?: string;
  /** Error message (optional - uses translation if not provided) */
  errorMessage?: string;
}

// Social link interface
export interface SocialLink {
  /** Link URL */
  href: string;
  /** Accessible label */
  label: string;
  /** Icon component or element */
  icon: React.ReactNode;
  /** Platform name */
  platform: string;
}

// Footer component props interface
export interface FooterProps extends BaseComponentProps {
  /** Company/brand name */
  brandName: string;
  /** Copyright text */
  copyrightText: string;
  /** Tagline or motto */
  tagline: string;
  /** Social media links */
  socialLinks: SocialLink[];
  /** Additional footer links */
  footerLinks?: Array<{
    label: string;
    href: string;
  }>;
}

// Theme context types
export interface ThemeContextType {
  /** Current theme mode */
  theme: 'light' | 'dark' | 'system';
  /** Function to toggle theme */
  toggleTheme: () => void;
  /** Function to set specific theme */
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

// Accessibility helper types
export interface AriaProps {
  /** ARIA label for assistive technologies */
  'aria-label'?: string;
  /** ARIA described by reference */
  'aria-describedby'?: string;
  /** ARIA labelled by reference */
  'aria-labelledby'?: string;
  /** ARIA expanded state */
  'aria-expanded'?: boolean;
  /** ARIA hidden state */
  'aria-hidden'?: boolean;
  /** Role attribute */
  role?: string;
}

// Form validation types
export interface FormValidation {
  /** Whether the field is required */
  required?: boolean;
  /** Minimum length validation */
  minLength?: number;
  /** Maximum length validation */
  maxLength?: number;
  /** Pattern validation (regex) */
  pattern?: string;
  /** Custom validation function */
  validator?: (value: string) => string | null;
}

// Animation and interaction types
export interface AnimationProps {
  /** Whether component should animate on mount */
  animate?: boolean;
  /** Animation delay in milliseconds */
  delay?: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Animation easing function */
  easing?: string;
}

// Responsive design breakpoints
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Component size variants
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Color theme variants
export type ColorVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'error';
