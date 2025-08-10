/**
 * Application constants and configuration values
 *
 * Centralized location for all constant values used throughout the application.
 * This promotes consistency and makes configuration changes easier to manage.
 *
 * @module constants
 * @version 1.0.0
 * @author QuantumPoly Development Team
 */

/**
 * Application metadata and branding
 */
export const APP_CONFIG = {
  name: 'QuantumPoly',
  description:
    'The Future, Now - Blending AI, Sustainability, and the Metaverse',
  version: '1.0.0',
  author: 'QuantumPoly Development Team',
  keywords: [
    'AI',
    'Quantum Computing',
    'Metaverse',
    'Sustainability',
    'Technology',
  ],
  domain: 'quantumpoly.com', // TODO: Update with actual domain
} as const;

/**
 * Social media and external links
 */
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/quantumpoly',
  linkedin: 'https://linkedin.com/company/quantumpoly',
  github: 'https://github.com/quantumpoly',
  youtube: 'https://youtube.com/@quantumpoly',
  discord: 'https://discord.gg/quantumpoly',
} as const;

/**
 * Contact information
 */
export const CONTACT_INFO = {
  email: 'hello@quantumpoly.com',
  support: 'support@quantumpoly.com',
  press: 'press@quantumpoly.com',
  careers: 'careers@quantumpoly.com',
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000, // 10 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

/**
 * UI configuration and design tokens
 */
export const UI_CONFIG = {
  maxWidth: '1440px',
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  animations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  zIndex: {
    modal: 1000,
    overlay: 999,
    dropdown: 50,
    header: 40,
    footer: 10,
  },
} as const;

/**
 * Feature flags for gradual rollouts and A/B testing
 */
export const FEATURE_FLAGS = {
  enableQuantumVisualization:
    process.env.NEXT_PUBLIC_ENABLE_QUANTUM_VIZ === 'true',
  enableAdvancedAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableBetaFeatures: process.env.NEXT_PUBLIC_ENABLE_BETA === 'true',
  enableNewsletterCapture: true,
  enableContactForm: true,
} as const;

/**
 * SEO and metadata defaults
 */
export const SEO_DEFAULTS = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
  keywords: APP_CONFIG.keywords,
  ogImage: '/images/og-default.jpg', // TODO: Create default OG image
  twitterCard: 'summary_large_image' as const,
  locale: 'en_US',
  type: 'website',
} as const;

/**
 * Form validation constants
 */
export const VALIDATION = {
  email: {
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: 'Please enter a valid email address',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message:
      'Password must contain at least 8 characters with uppercase, lowercase, number and special character',
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Please enter a valid phone number',
  },
} as const;

/**
 * Analytics and tracking configuration
 */
export const ANALYTICS_CONFIG = {
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
  facebookPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
  hotjarId: process.env.NEXT_PUBLIC_HOTJAR_ID,
  enableTracking: process.env.NODE_ENV === 'production',
} as const;

/**
 * Performance and optimization settings
 */
export const PERFORMANCE_CONFIG = {
  imageQuality: 85,
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  cacheMaxAge: 31536000, // 1 year in seconds
  preloadCriticalResources: true,
  enableWebVitals: true,
} as const;

/**
 * Security configuration
 */
export const SECURITY_CONFIG = {
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://www.googletagmanager.com',
    ],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://www.google-analytics.com'],
  },
  enableHSTS: true,
  enableNoSniff: true,
  enableXSSProtection: true,
} as const;

/**
 * Newsletter and communication settings
 */
export const NEWSLETTER_CONFIG = {
  provider: 'mailchimp', // or 'sendgrid', 'convertkit', etc.
  listId: process.env.NEXT_PUBLIC_NEWSLETTER_LIST_ID,
  confirmationRequired: true,
  trackingEnabled: FEATURE_FLAGS.enableAdvancedAnalytics,
} as const;

/**
 * Error tracking and logging
 */
export const ERROR_CONFIG = {
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enableErrorTracking: process.env.NODE_ENV === 'production',
  logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  enableLocalStorage: true,
} as const;

/**
 * Development and debugging helpers
 */
export const DEV_CONFIG = {
  enableDevTools: process.env.NODE_ENV === 'development',
  enableMockData: process.env.NEXT_PUBLIC_ENABLE_MOCKS === 'true',
  enableTestIds: process.env.NODE_ENV !== 'production',
  showBoundaries: process.env.NODE_ENV === 'development',
} as const;

// REVIEW: Consider moving environment-specific configs to separate files
// FEEDBACK: Monitor which constants are most frequently accessed for optimization
