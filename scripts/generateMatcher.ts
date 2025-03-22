/**
 * Middleware Matcher Generator Script
 * 
 * This script generates a static middleware matcher configuration based on
 * the current locale settings. It should be run as part of the build process
 * to ensure the middleware matcher is always up-to-date with the locale config.
 */

import fs from 'fs';
import path from 'path';

// Get locales from the i18n file
// Note: We're parsing the file here rather than importing it directly
// to avoid issues with TypeScript compilation
function getLocales(): string[] {
  try {
    const i18nPath = path.resolve(__dirname, '../src/i18n.ts');
    const i18nContent = fs.readFileSync(i18nPath, 'utf8');
    
    // Extract the locales array using regex
    const localesMatch = i18nContent.match(/export\s+const\s+locales\s*=\s*\[([^\]]+)\]/);
    if (!localesMatch || !localesMatch[1]) {
      throw new Error('Could not find locales definition in i18n.ts');
    }
    
    // Parse the comma-separated list of locales
    const localesStr = localesMatch[1].trim();
    return localesStr.split(',').map(locale => 
      locale.trim().replace(/['"]/g, '')
    );
  } catch (error) {
    console.error('Error reading locales:', error);
    return ['en']; // Fallback to English only
  }
}

// Generate the middleware matcher configuration
function generateMatcherConfiguration(): string {
  const locales = getLocales();
  const excludePaths = ['api', '_next', '_vercel'];
  
  console.log(`Generating matcher with locales: ${locales.join(', ')}`);
  
  // Create the matcher configuration
  return `/**
 * GENERATED FILE - DO NOT EDIT DIRECTLY
 * 
 * This file is auto-generated by the generateMatcher.ts script.
 * Run 'npm run generate-matcher' to update it.
 */

export const middlewareMatcherConfig = {
  matcher: [
    // Match all paths except those starting with excluded paths or file paths with extensions
    '/((?!${excludePaths.join('|')}|.*\\\\.[^/]+$).*)',
    // Include root path
    '/'
  ]
};
`;
}

// Write the generated configuration to a file
function writeMatcherConfiguration(): void {
  const outputPath = path.resolve(__dirname, '../src/utils/generatedMatcher.ts');
  const content = generateMatcherConfiguration();
  
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`Matcher configuration written to ${outputPath}`);
}

// Run the script
writeMatcherConfiguration(); 