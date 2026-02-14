// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jest-axe for accessibility testing
import 'jest-axe/extend-expect';

// Polyfill Next.js Web APIs for API route testing (Block 4.4)
// Next.js uses Web APIs (Request, Response, Headers) that aren't available in JSDOM
import { TextEncoder, TextDecoder } from 'node:util';
import { ReadableStream, TransformStream } from 'node:stream/web';

// Polyfill TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill Web Streams API
global.ReadableStream = ReadableStream;
global.TransformStream = TransformStream;

// Suppress React DOM Test Utils act warnings in favor of React.act
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('ReactDOMTestUtils.act') &&
      args[0].includes('deprecated')
    ) {
      return;
    }
    const isActWarning = typeof args[0] === 'string' && args[0].includes('not wrapped in act');
    const componentName = args.find(
      (arg) =>
        typeof arg === 'string' && (arg === 'NewsletterForm' || arg === 'LanguageSwitcher'),
    );

    if (isActWarning && componentName) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Suppress act warnings in tests - we handle async behavior with userEvent and waitFor
// This is a temporary solution while React Testing Library's userEvent API matures
global.IS_REACT_ACT_ENVIRONMENT = true;

// Mock window.matchMedia for tests (JSDOM doesn't provide this)
// Only define in jsdom environment (not in node environment for API route tests)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false, // Default to no motion preference
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock next-intl for tests
jest.mock('next-intl', () => ({
  useTranslations: (namespace) => (key) => `${namespace}.${key}`,
  useLocale: () => 'en',
  NextIntlClientProvider: ({ children }) => children,
}));

// Mock next-intl/server for tests
jest.mock('next-intl/server', () => ({
  getMessages: async () => ({}),
  getRequestConfig: jest.fn(),
}));

// Mock next/navigation for tests
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/en',
  useSearchParams: () => ({}), // Simple mock object
  notFound: jest.fn(),
}));
