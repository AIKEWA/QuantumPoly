module.exports = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Semantic tokens using CSS variables for theming support
        primary: {
          DEFAULT: 'var(--color-primary, #06b6d4)',
          600: 'var(--color-primary-600, #0891b2)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary, #8b5cf6)',
          600: 'var(--color-secondary-600, #7c3aed)',
        },
        surface: {
          DEFAULT: 'var(--color-surface, #ffffff)',
          secondary: 'var(--color-surface-secondary, #f8fafc)',
        },
        text: {
          DEFAULT: 'var(--color-text, #1f2937)',
          muted: 'var(--color-text-muted, #6b7280)',
          inverse: 'var(--color-text-inverse, #ffffff)',
        },
        'gate-viz': {
          active: 'var(--gate-viz-active, #4CAF50)',
          inactive: 'var(--gate-viz-inactive, #9E9E9E)',
          error: 'var(--gate-viz-error, #F44336)',
          background: 'var(--gate-viz-background, #212121)',
          text: 'var(--gate-viz-text, #FFFFFF)',
          'tooltip-bg': 'var(--gate-viz-tooltip-bg, #424242)',
        },
      },
      spacing: {
        // 4px scale for consistent spacing
        0: '0px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
        24: '96px',
      },
      fontSize: {
        // Semantic typography sizes
        body: ['1rem', { lineHeight: '1.5' }],
        'body-sm': ['0.875rem', { lineHeight: '1.43' }],
        'body-lg': ['1.125rem', { lineHeight: '1.56' }],
        heading: ['1.25rem', { lineHeight: '1.4' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.44' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.33' }],
        'heading-xl': ['1.875rem', { lineHeight: '1.27' }],
        'heading-2xl': ['2.25rem', { lineHeight: '1.22' }],
        'heading-3xl': ['3rem', { lineHeight: '1.17' }],
      },
      borderRadius: {
        // Consistent border radius tokens
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
};
