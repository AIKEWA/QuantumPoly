/**
 * Middleware Updater Script
 * 
 * This script updates the middleware.ts file with a static config
 * that matches the current locale settings. It modifies the file in place,
 * replacing the config export with a static version that Next.js can analyze
 * at build time.
 */

import fs from 'fs';
import path from 'path';

// Get locales from the i18n file
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

// Update the middleware.ts file with static config
function updateMiddlewareConfig(): void {
  const middlewarePath = path.resolve(__dirname, '../src/middleware.ts');
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  
  const locales = getLocales();
  const excludePaths = ['api', '_next'];

  console.log(`Updating middleware with locales: ${locales.join(', ')}`);
  
  // Generate the static config
  const staticConfig = `export const config = {
  matcher: [
    // Match all paths except those starting with excluded paths or file paths with extensions
    '/((?!${excludePaths.join('|')}|.*\\\\..*).*)' ,
    // Explicitly exclude locale prefixes
    '/((?!${locales.join('|')}).*)',
    // Include root path
    '/'
  ]
};`;

  // Replace the existing config export with the static version
  const updatedContent = middlewareContent.replace(
    /export\s+const\s+config\s*=[\s\S]*?};/,
    staticConfig
  );
  
  fs.writeFileSync(middlewarePath, updatedContent, 'utf8');
  console.log(`Middleware configuration updated in ${middlewarePath}`);
}

// Run the script
updateMiddlewareConfig(); 