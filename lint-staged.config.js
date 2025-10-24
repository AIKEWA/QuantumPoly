/**
 * lint-staged configuration
 * 
 * This configuration defines which tools to run on staged files before committing.
 * It ensures code quality and consistent formatting across the project.
 */

export default {
  // TypeScript and JavaScript files (production code only)
  'src/**/*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  
  // Markdown, JSON, CSS, and other formatted files
  '*.{md,mdx,json,css}': [
    'prettier --write',
  ],
  
  // Package.json and other JSON config files
  'package.json': [
    'prettier --write',
  ],
};
