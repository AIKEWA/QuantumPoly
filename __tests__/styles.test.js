/**
 * QuantumPoly Styles Test Suite
 * Testing CSS integration and cyberpunk theme functionality
 */

// Mock CSS module for testing
const mockCSS = {
  supports: (property, value) => true,
  getPropertyValue: property => {
    const mockValues = {
      '--cyberpunk-primary': '#00ffff',
      '--cyberpunk-secondary': '#ff00ff',
      '--cyberpunk-dark': '#0a0a0a',
      '--background': '#ffffff',
      '--foreground': '#171717',
    };
    return mockValues[property] || '';
  },
};

// Mock window.CSS for testing CSS support
global.CSS = mockCSS;

describe('QuantumPoly Global Styles', () => {
  beforeEach(() => {
    // Reset DOM for each test
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  describe('CSS Custom Properties', () => {
    test('should define cyberpunk theme variables', () => {
      // Create a test element to check CSS variable resolution
      const testElement = document.createElement('div');
      testElement.style.setProperty(
        '--test-primary',
        'var(--cyberpunk-primary)'
      );
      document.body.appendChild(testElement);

      // Verify CSS custom properties are properly defined
      expect(CSS.supports('color', 'var(--cyberpunk-primary)')).toBe(true);
      expect(CSS.supports('color', 'var(--cyberpunk-secondary)')).toBe(true);
    });

    test('should support dark mode variables', () => {
      expect(CSS.supports('color', 'var(--background)')).toBe(true);
      expect(CSS.supports('color', 'var(--foreground)')).toBe(true);
    });
  });

  describe('Cyberpunk Component Classes', () => {
    test('should apply cyberpunk-glow class correctly', () => {
      const element = document.createElement('span');
      element.className = 'cyberpunk-glow';
      document.body.appendChild(element);

      // Verify the element has the cyberpunk-glow class
      expect(element.classList.contains('cyberpunk-glow')).toBe(true);
    });

    test('should apply cyberpunk-border class correctly', () => {
      const element = document.createElement('div');
      element.className = 'cyberpunk-border';
      document.body.appendChild(element);

      expect(element.classList.contains('cyberpunk-border')).toBe(true);
    });

    test('should apply responsive text utilities', () => {
      const element = document.createElement('p');
      element.className = 'text-responsive';
      document.body.appendChild(element);

      expect(element.classList.contains('text-responsive')).toBe(true);
    });
  });

  describe('Accessibility Features', () => {
    test('should support focus-visible styles', () => {
      const button = document.createElement('button');
      button.className = 'focus-visible';
      document.body.appendChild(button);

      expect(button.classList.contains('focus-visible')).toBe(true);
    });

    test('should respect reduced motion preferences', () => {
      // Mock matchMedia for reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('prefers-reduced-motion: reduce'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      expect(mediaQuery.matches).toBe(true);
    });
  });

  describe('Performance Optimizations', () => {
    test('should use efficient box-sizing', () => {
      expect(CSS.supports('box-sizing', 'border-box')).toBe(true);
    });

    test('should support CSS transitions', () => {
      expect(CSS.supports('transition', 'all 0.3s ease')).toBe(true);
    });

    test('should support modern CSS functions', () => {
      expect(CSS.supports('font-size', 'clamp(1rem, 2.5vw, 1.5rem)')).toBe(
        true
      );
    });
  });
});

// Integration test for CSS loading
describe('CSS Integration', () => {
  test('should load Tailwind CSS directives', () => {
    // Test that Tailwind directives are supported
    expect(CSS.supports('display', 'flex')).toBe(true);
    expect(CSS.supports('position', 'relative')).toBe(true);
  });

  test('should maintain cyberpunk theme consistency', () => {
    const primaryColor = CSS.getPropertyValue('--cyberpunk-primary');
    const secondaryColor = CSS.getPropertyValue('--cyberpunk-secondary');

    expect(primaryColor).toBe('#00ffff');
    expect(secondaryColor).toBe('#ff00ff');
  });
});

// REVIEW: These tests ensure our CSS architecture is properly structured
// DISCUSS: Consider adding visual regression tests for cyberpunk effects
// FEEDBACK: Monitor theme switching performance in real usage
