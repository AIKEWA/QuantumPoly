/**
 * Jest setup file for QuantumPoly
 *
 * This file runs before each test suite and sets up the testing environment
 * with necessary polyfills, mocks, and configurations.
 *
 * @version 1.0.0
 * @author QuantumPoly Development Team
 */

import '@testing-library/jest-dom';

// Provide a stable next-intl mock across tests to avoid ESM issues and ensure
// components receive realistic translations sourced from English messages.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const enMessages = require('./messages/en.json');

function getFromMessages(path) {
  const parts = path.split('.');
  let cur = enMessages;
  for (const p of parts) {
    if (!cur) return path;
    cur = cur[p];
  }
  return typeof cur === 'string' ? cur : path;
}

jest.mock('next-intl', () => ({
  useTranslations: (ns) => (key) => getFromMessages(`${ns ? ns + '.' : ''}${key}`),
  NextIntlClientProvider: ({ children }) => children,
}));

jest.mock('next-intl/server', () => ({
  getTranslations: async ({ namespace } = {}) => (key) => getFromMessages(`${namespace ? namespace + '.' : ''}${key}`),
  getMessages: async () => enMessages,
  getRequestConfig: () => () => ({ messages: enMessages }),
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
      isLocaleDomain: true,
      isReady: true,
      defaultLocale: 'en',
      domainLocales: [],
      isPreview: false,
      locale: 'en',
      locales: ['en', 'de', 'fr', 'es'],
    };
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: props => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }) => {
    return <a {...props}>{children}</a>;
  },
}));

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(callback => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(callback => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock scrollTo
global.scrollTo = jest.fn();

// Mock fetch for API tests
global.fetch = jest.fn();

// Setup test environment variables
process.env.NEXT_PUBLIC_APP_ENV = 'test';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Global test utilities
global.testUtils = {
  // Helper to create mock component props
  createMockProps: (overrides = {}) => ({
    'data-testid': 'test-component',
    ...overrides,
  }),

  // Helper to wait for async operations
  waitFor: (fn, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        try {
          fn();
          resolve();
        } catch (error) {
          if (Date.now() - startTime > timeout) {
            reject(error);
          } else {
            setTimeout(check, 10);
          }
        }
      };
      check();
    });
  },
};

// Console error/warning suppressions for known issues
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  // Suppress specific warnings that are expected in tests
  const suppressedMessages = [
    'Warning: ReactDOM.render is no longer supported',
    'Warning: An invalid form control',
  ];

  const message = args[0];
  if (
    typeof message === 'string' &&
    suppressedMessages.some(msg => message.includes(msg))
  ) {
    return;
  }

  originalError.call(console, ...args);
};

console.warn = (...args) => {
  // Suppress specific warnings that are expected in tests
  const suppressedMessages = [
    'componentWillReceiveProps has been renamed',
    'componentWillMount has been renamed',
  ];

  const message = args[0];
  if (
    typeof message === 'string' &&
    suppressedMessages.some(msg => message.includes(msg))
  ) {
    return;
  }

  originalWarn.call(console, ...args);
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();

  // Clean up any DOM mutations
  document.body.innerHTML = '';

  // Reset fetch mock
  if (global.fetch.mockClear) {
    global.fetch.mockClear();
  }
});

// Global test setup
beforeAll(() => {
  // Any global setup that needs to run once before all tests
});

// Global test teardown
afterAll(() => {
  // Any global cleanup that needs to run once after all tests
  console.error = originalError;
  console.warn = originalWarn;
});

// Custom Jest matchers (if needed)
expect.extend({
  toBeInTheViewport(element) {
    const rect = element.getBoundingClientRect();
    const isInViewport =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth);

    return {
      message: () =>
        `expected element ${isInViewport ? 'not ' : ''}to be in the viewport`,
      pass: isInViewport,
    };
  },
});
