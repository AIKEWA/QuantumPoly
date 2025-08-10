/**
 * Global type definitions for QuantumPoly project
 *
 * This file contains shared types, interfaces, and ambient declarations
 * used throughout the application for consistent type safety.
 *
 * @version 1.0.0
 * @author QuantumPoly Development Team
 */

// Extend global interfaces if needed
declare global {
  /**
   * Environment variables with type safety
   */
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_APP_ENV: 'development' | 'staging' | 'production';
      NEXT_PUBLIC_APP_URL: string;
      NEXT_PUBLIC_ANALYTICS_ID?: string;
      DATABASE_URL?: string;
      NEXTAUTH_SECRET?: string;
      NEXTAUTH_URL?: string;
    }
  }

  /**
   * Window object extensions for browser APIs
   */
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Component prop types for consistent styling and behavior
 */
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Accessible label for screen readers */
  'aria-label'?: string;
  /** Test ID for automated testing */
  'data-testid'?: string;
}

/**
 * API response wrapper for consistent error handling
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * Loading states for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Theme configuration types
 */
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
}

/**
 * User preference types
 */
export interface UserPreferences {
  theme: ThemeConfig;
  locale: import('./i18n').Locale;
  newsletter: boolean;
  analytics: boolean;
}

/**
 * Newsletter subscription types
 */
export interface NewsletterSubscription {
  email: string;
  preferences: {
    productUpdates: boolean;
    marketing: boolean;
    research: boolean;
  };
  timestamp: Date;
}

/**
 * SEO metadata types for consistent page optimization
 */
export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
}

/**
 * Component variant types for design system consistency
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link';
export type ComponentColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error';

/**
 * Animation and transition types
 */
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

/**
 * Form validation types
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

/**
 * Feature flag types for A/B testing and gradual rollouts
 */
export interface FeatureFlags {
  enableQuantumVisualization: boolean;
  enableAdvancedAnalytics: boolean;
  enableBetaFeatures: boolean;
}

// Export empty object to make this a module
export {};
