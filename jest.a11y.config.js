/**
 * Jest Configuration for Accessibility Tests
 *
 * Isolated configuration for running jest-axe accessibility unit tests.
 * This enables focused a11y test runs and CI artifact generation.
 *
 * Usage:
 *   npm run test:a11y                                    # Run a11y tests
 *   jest --config jest.a11y.config.js                    # Direct invocation
 *   jest --config jest.a11y.config.js --reporters=json   # JSON output for CI
 */

module.exports = {
  // Base configuration
  testEnvironment: 'jsdom',

  // Test discovery pattern
  testMatch: [
    '**/__tests__/a11y/**/*.test.ts',
    '**/__tests__/a11y/**/*.test.tsx',
    '**/__tests__/**/a11y.*.test.ts',
    '**/__tests__/**/a11y.*.test.tsx',
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': ['@swc/jest'],
    '^.+\\.(js|jsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // Coverage configuration (optional)
  collectCoverageFrom: [
    'src/components/**/*.{ts,tsx}',
    'src/app/**/*.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.d.ts',
  ],

  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './reports/a11y',
        outputName: 'jest-axe.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
  ],

  // Performance
  maxWorkers: '50%',

  // Timeouts
  testTimeout: 10000,
};

