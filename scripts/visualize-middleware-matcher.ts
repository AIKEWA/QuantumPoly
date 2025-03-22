#!/usr/bin/env ts-node
/**
 * Middleware Matcher Visualization Script
 * 
 * Generates an HTML report visualizing which paths will trigger middleware execution.
 * Usage: npm run visualize-middleware
 */

import fs from 'fs';
import path from 'path';
import { createMatcherReport } from '../src/utils/middlewareMatcherVisualizer';
import { createMiddlewareMatcher } from '../src/utils/middlewareMatcherFactory';
import { locales } from '../src/i18n';

// Output file path
const outputFile = path.join(process.cwd(), 'middleware-matcher-report.html');

// Get patterns from our middleware configuration
const patterns = createMiddlewareMatcher({
  locales,
  excludePaths: ['api', '_next', '_vercel', 'assets'],
  includeRoot: true
});

console.log('Current middleware matcher patterns:');
patterns.forEach(pattern => console.log(` - ${pattern}`));

// Paths to test
const pathsToTest = [
  '/',
  '/about',
  '/contact',
  '/products/123',
  ...locales.map(locale => `/${locale}`),
  ...locales.map(locale => `/${locale}/about`),
  ...locales.map(locale => `/${locale}/products/123`),
  '/api/user',
  '/api/data/123',
  '/_next/static/chunks/main.js',
  '/favicon.ico',
  '/images/logo.png',
  '/assets/styles.css'
];

// Generate the report
const report = createMatcherReport(patterns, pathsToTest);

// Write to file
fs.writeFileSync(outputFile, report);
console.log(`Report generated at ${outputFile}`);
console.log('Open this file in your browser to view the report.');

// Add this script to package.json by adding:
// "scripts": {
//   "visualize-middleware": "ts-node scripts/visualize-middleware-matcher.ts"
// } 