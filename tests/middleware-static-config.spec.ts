import fs from 'fs';
import path from 'path';

describe('Middleware Static Config', () => {
  const middlewarePath = path.resolve(__dirname, '../src/middleware.ts');
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');

  it('should have statically analyzable config export', () => {
    // The config should be a static object literal, not an imported variable
    const configMatch = middlewareContent.match(/export\s+const\s+config\s*=\s*{[\s\S]*?};/);
    expect(configMatch).not.toBeNull();
    
    // Check that the config doesn't use import variables
    const configSection = configMatch ? configMatch[0] : '';
    expect(configSection).not.toContain('middlewareMatcherConfig');
    expect(configSection).not.toContain('import');
    
    // Check that the matcher array is statically defined
    expect(configSection).toContain('matcher: [');
    
    // Verify that locale exclusions are included in the matcher
    const localesFromI18n = getLocalesFromI18n();
    localesFromI18n.forEach(locale => {
      expect(configSection).toContain(locale);
    });
  });
  
  it('should not reference dynamic imports in matcher definition', () => {
    // Config should not reference any imports or variables
    const dynamicReferences = [
      'locales.join', 
      'locales.map', 
      'middlewareMatcherConfig',
      '${',
      'createMiddlewareMatcher',
      'getLocales'
    ];
    
    // Extract the config section
    const configMatch = middlewareContent.match(/export\s+const\s+config\s*=\s*{[\s\S]*?};/);
    const configSection = configMatch ? configMatch[0] : '';
    
    // None of these dynamic references should be in the config
    dynamicReferences.forEach(ref => {
      expect(configSection).not.toContain(ref);
    });
  });
});

// Helper to get locales from i18n.ts for verification
function getLocalesFromI18n(): string[] {
  const i18nPath = path.resolve(__dirname, '../src/i18n.ts');
  const i18nContent = fs.readFileSync(i18nPath, 'utf8');
  
  const localesMatch = i18nContent.match(/export\s+const\s+locales\s*=\s*\[([^\]]+)\]/);
  if (!localesMatch || !localesMatch[1]) {
    return ['en'];
  }
  
  const localesStr = localesMatch[1].trim();
  return localesStr.split(',').map(locale => 
    locale.trim().replace(/['"]/g, '')
  );
} 