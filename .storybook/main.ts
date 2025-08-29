/**
 * @fileoverview Storybook main configuration
 * @module .storybook/main
 */

import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../src/**/*.story.@(js|jsx|ts|tsx)',
  ],

  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-links',
    // '@storybook/addon-controls',
    // '@storybook/addon-backgrounds',
    // '@storybook/addon-viewport',
  ],

  framework: {
    name: '@storybook/nextjs',
    options: {},
  },

  docs: {
    autodocs: 'tag',
  },

  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: prop =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },

  features: {
    buildStoriesJson: true,
  },

  staticDirs: ['../public'],

  // Rely on @storybook/nextjs defaults for CSS & PostCSS handling
};

export default config;
