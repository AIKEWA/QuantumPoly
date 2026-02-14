/** @type {import('jest').Config} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/storybook-static/',
  ],
  testMatch: ['**/__tests__/**/*.test.(js|jsx|ts|tsx)'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/middleware.ts',
    '!src/i18n.ts',
    '!src/locales/**/index.ts',
    '!src/app/**/layout.tsx',
  ],
  coverageThreshold: {
    // Route-specific thresholds for security-critical API endpoints (Block 4.4)
    'src/app/api/newsletter/route.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Global thresholds calibrated to current full-suite baseline.
    // Route-specific critical paths keep strict thresholds above.
    global: {
      branches: 14,
      functions: 14,
      lines: 14,
      statements: 14,
    },
  },
  moduleNameMapper: {
    // Handle module aliases (if you use them in your Next.js app)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(next-intl|remark|remark-parse|remark-html|rehype-slug|rehype-autolink-headings|unist-util-visit|unified|mdast-util-.*|micromark.*|decode-named-character-reference|character-entities|ccount|escape-string-regexp|markdown-table)/)',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
