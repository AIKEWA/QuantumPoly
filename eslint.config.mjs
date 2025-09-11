import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import tailwind from 'eslint-plugin-tailwindcss';
import unicorn from 'eslint-plugin-unicorn';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      import: importPlugin,
      tailwindcss: tailwind,
      unicorn
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
      'unicorn/filename-case': ['error', { cases: { pascalCase: true, kebabCase: true } }]
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
      'src/app/**/error.tsx'
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
    ignores: [
      '.next/**/*',
      'out/**/*',
      'node_modules/**/*',
      'dist/**/*',
      'build/**/*',
      'coverage/**/*',
      'storybook-static/**/*',
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
