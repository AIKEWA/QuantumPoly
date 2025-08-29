import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import prettierConfig from 'eslint-plugin-prettier/recommended';
import jsdoc from 'eslint-plugin-jsdoc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  { root: true },
  ...compat.extends(
    'next/core-web-vitals',
    'plugin:prettier/recommended',
    'plugin:jsdoc/recommended-typescript'
  ),
  {
    parserOptions: { project: ['./tsconfig.json'] },
  },
  {
    plugins: { jsdoc },
    rules: {
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
          },
        },
      ],
    },
  },
  // Disable typed linting for Storybook stories to avoid TS project parsing
  {
    files: ['**/*.stories.ts', '**/*.stories.tsx', '**/*.stories.js', '**/*.stories.jsx'],
    languageOptions: {
      parserOptions: { project: null },
    },
  },
  {
    ignores: [
      '.next/**/*',
      'out/**/*',
      'node_modules/**/*',
      'dist/**/*',
      'build/**/*',
      'coverage/**/*',
      '*.config.js',
      '*.config.mjs',
      // Ignore Storybook config and stories from typed linting
      '.storybook/**/*',
      '**/*.stories.*',
    ],
  },
  ...prettierConfig,
];

export default eslintConfig;
