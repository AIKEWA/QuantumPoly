import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import tailwind from 'eslint-plugin-tailwindcss';
import unicorn from 'eslint-plugin-unicorn';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      import: importPlugin,
      tailwindcss: tailwind,
      unicorn,
      'jsx-a11y': jsxA11y
    },
    rules: {
      // Exports & imports
      'import/no-default-export': 'error',
      'no-duplicate-imports': 'error',
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true }
      }],
      // Tailwind hygiene
      'tailwindcss/classnames-order': 'error',
      // File naming: Components PascalCase, utils kebabCase
      'unicorn/filename-case': ['error', { cases: { pascalCase: true, kebabCase: true } }],
      // Accessibility (jsx-a11y recommended rules)
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': ['error', {
        components: ['Link'],
        aspects: ['invalidHref', 'preferButton']
      }],
      'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/autocomplete-valid': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/media-has-caption': 'warn',
      'jsx-a11y/mouse-events-have-key-events': 'error',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-distracting-elements': 'error',
      'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'error',
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
      'jsx-a11y/no-noninteractive-tabindex': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/scope': 'error',
      'jsx-a11y/tabindex-no-positive': 'error'
    },
    settings: {
      'import/resolver': { typescript: true }
    }
  },
  // Next.js App Router pages/layouts must export default
  {
    files: [
      'src/app/**/page.tsx',
      'src/app/**/layout.tsx',
      'src/app/**/not-found.tsx',
      'src/app/**/error.tsx',
      'src/app/robots.ts',
      'src/app/sitemap.ts'
    ],
    rules: { 'import/no-default-export': 'off' }
  },
  // Allow default exports in Storybook and config files
  {
    files: [
      'stories/**/*.stories.tsx',
      '.storybook/**/*.ts',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.ts'
    ],
    rules: { 'import/no-default-export': 'off' }
  },
  // Environment-specific configurations
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.test.js', 'jest.setup.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    }
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
        global: 'readonly',
        window: 'readonly',
        document: 'readonly',
        CSS: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  },
  {
    files: ['**/*.mjs', 'scripts/**/*.mjs', '.github/scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly'
      }
    }
  },
  // Relaxed rules for governance/audit scripts
  {
    files: ['scripts/**/*.js', 'scripts/**/*.mjs', 'scripts/**/*.ts'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-undef': 'off'
    }
  },
  {
    ignores: [
      '.next/**/*',
      'out/**/*',
      'node_modules/**/*',
      'dist/**/*',
      'build/**/*',
      'coverage/**/*',
      'storybook-static/**/*',
      'e2e/**/*',
      'docs/**/*',
      'content/**/*',
      '.env*',
      '*.log',
      '.vscode/',
      '.idea/',
      '.DS_Store',
      'Thumbs.db',
      'docs/dist/'
    ]
  }
];
