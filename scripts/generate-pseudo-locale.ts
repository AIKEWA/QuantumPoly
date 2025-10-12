#!/usr/bin/env ts-node
/**
 * Pseudo-Localization Generator
 * 
 * Generates a pseudo-locale (qps) for QA testing that:
 * - Adds accents to characters (a → á, e → é)
 * - Extends strings by ~30% to test layout
 * - Wraps strings with markers [brackets] to identify truncation
 * - Preserves format placeholders like {name}, {count}
 * - Preserves HTML tags if present
 * 
 * This helps expose:
 * - Text truncation issues
 * - Layout problems with longer text
 * - Hardcoded strings (won't be pseudo-localized)
 * - Missing translations
 * 
 * Usage: npm run generate:pseudo-locale
 */

import * as fs from 'fs';
import * as path from 'path';

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales');
const SOURCE_LOCALE = 'en';
const PSEUDO_LOCALE = 'qps';

// Character mapping for pseudo-localization (adds accents)
const CHAR_MAP: Record<string, string> = {
  a: 'á',
  A: 'Á',
  b: 'ƀ',
  B: 'Ɓ',
  c: 'ç',
  C: 'Ç',
  d: 'ð',
  D: 'Ð',
  e: 'é',
  E: 'É',
  f: 'ƒ',
  F: 'Ƒ',
  g: 'ĝ',
  G: 'Ĝ',
  h: 'ĥ',
  H: 'Ĥ',
  i: 'í',
  I: 'Í',
  j: 'ĵ',
  J: 'Ĵ',
  k: 'ķ',
  K: 'Ķ',
  l: 'ļ',
  L: 'Ļ',
  m: 'ɱ',
  M: 'Ɱ',
  n: 'ñ',
  N: 'Ñ',
  o: 'ó',
  O: 'Ó',
  p: 'þ',
  P: 'Þ',
  q: 'ǫ',
  Q: 'Ǫ',
  r: 'ŕ',
  R: 'Ŕ',
  s: 'š',
  S: 'Š',
  t: 'ţ',
  T: 'Ţ',
  u: 'ú',
  U: 'Ú',
  v: 'ṽ',
  V: 'Ṽ',
  w: 'ŵ',
  W: 'Ŵ',
  x: 'ẋ',
  X: 'Ẋ',
  y: 'ý',
  Y: 'Ý',
  z: 'ž',
  Z: 'Ž',
};

/**
 * Convert a character to its pseudo-localized equivalent
 */
function pseudoChar(char: string): string {
  return CHAR_MAP[char] || char;
}

/**
 * Generate padding string to extend text length
 */
function generatePadding(length: number): string {
  // Use various Unicode characters for padding
  const paddingChars = ['·', '∙', '•'];
  const padding: string[] = [];
  
  for (let i = 0; i < length; i++) {
    padding.push(paddingChars[i % paddingChars.length]);
  }
  
  return padding.join('');
}

/**
 * Pseudo-localize a string
 * Preserves placeholders like {name} and HTML tags
 */
function pseudoLocalize(text: string): string {
  if (typeof text !== 'string') {
    return text;
  }

  // Regex to match placeholders {xxx} and HTML tags
  const placeholderRegex = /(\{[^}]+\}|<[^>]+>)/g;
  const parts: Array<{ text: string; isPlaceholder: boolean }> = [];
  
  let lastIndex = 0;
  let match;

  // Split text into parts: regular text and placeholders
  while ((match = placeholderRegex.exec(text)) !== null) {
    // Add text before placeholder
    if (match.index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, match.index),
        isPlaceholder: false,
      });
    }
    
    // Add placeholder itself
    parts.push({
      text: match[0],
      isPlaceholder: true,
    });
    
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      isPlaceholder: false,
    });
  }

  // If no parts were created, the entire text is regular text
  if (parts.length === 0) {
    parts.push({ text, isPlaceholder: false });
  }

  // Process each part
  const processedParts = parts.map((part) => {
    if (part.isPlaceholder) {
      return part.text; // Keep placeholders unchanged
    }

    // Apply character mapping
    let result = '';
    for (const char of part.text) {
      result += pseudoChar(char);
    }

    // Add padding (30% extension)
    const paddingLength = Math.ceil(part.text.length * 0.3);
    if (paddingLength > 0 && part.text.trim().length > 0) {
      result += ' ' + generatePadding(paddingLength);
    }

    return result;
  });

  // Combine all parts and wrap with markers
  const combined = processedParts.join('');
  
  // Only wrap if there's actual text content
  if (combined.trim().length > 0) {
    return `[${combined}]`;
  }
  
  return combined;
}

/**
 * Recursively pseudo-localize an object
 */
function pseudoLocalizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return pseudoLocalize(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(pseudoLocalizeObject);
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = pseudoLocalizeObject(value);
    }
    return result;
  }

  return obj;
}

/**
 * Generate pseudo-locale files
 */
function generatePseudoLocale(): void {
  console.log('🔧 Generating pseudo-locale (qps) for QA testing...\n');

  const sourceDir = path.join(LOCALES_DIR, SOURCE_LOCALE);
  const pseudoDir = path.join(LOCALES_DIR, PSEUDO_LOCALE);

  // Create pseudo-locale directory if it doesn't exist
  if (!fs.existsSync(pseudoDir)) {
    fs.mkdirSync(pseudoDir, { recursive: true });
    console.log(`✓ Created directory: ${PSEUDO_LOCALE}/`);
  }

  // Get all JSON files from source locale
  const files = fs
    .readdirSync(sourceDir)
    .filter((file) => file.endsWith('.json'));

  console.log(`\nProcessing ${files.length} file(s):\n`);

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const pseudoPath = path.join(pseudoDir, file);

    // Load source file
    const sourceContent = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));

    // Generate pseudo-localized version
    const pseudoContent = pseudoLocalizeObject(sourceContent);

    // Write pseudo-localized file
    fs.writeFileSync(pseudoPath, JSON.stringify(pseudoContent, null, 2) + '\n');

    console.log(`  ✓ ${file}`);
  }

  // Generate index.ts file
  const indexContent = `// Auto-generated pseudo-locale index file
// DO NOT EDIT MANUALLY - Run 'npm run generate:pseudo-locale' to regenerate

${files
  .map((file) => {
    const name = file.replace('.json', '');
    return `import ${name} from './${name}.json';`;
  })
  .join('\n')}

// eslint-disable-next-line import/no-default-export -- Required by next-intl
export default {
${files
  .map((file) => {
    const name = file.replace('.json', '');
    return `  ${name},`;
  })
  .join('\n')}
};
`;

  fs.writeFileSync(path.join(pseudoDir, 'index.ts'), indexContent);
  console.log(`  ✓ index.ts`);

  console.log('\n✅ Pseudo-locale generation complete!');
  console.log(`\n💡 To test: Add 'qps' to locales array in src/i18n.ts and visit /qps\n`);
}

/**
 * Display example of pseudo-localization
 */
function showExample(): void {
  console.log('\n📝 Pseudo-localization examples:\n');

  const examples = [
    'Hello, World!',
    'Welcome to {name}',
    'You have {count} items',
    'This is a longer text that might cause layout issues',
  ];

  for (const example of examples) {
    console.log(`  Original:  "${example}"`);
    console.log(`  Pseudo:    "${pseudoLocalize(example)}"`);
    console.log('');
  }
}

// Main execution
function main(): void {
  const args = process.argv.slice(2);

  if (args.includes('--example') || args.includes('-e')) {
    showExample();
  } else {
    generatePseudoLocale();
  }
}

main();

