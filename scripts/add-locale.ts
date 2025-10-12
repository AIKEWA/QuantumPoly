#!/usr/bin/env ts-node
/**
 * Automated Locale Scaffolding Script
 * 
 * Automates the process of adding a new locale to the project:
 * 1. Creates locale directory with translation JSON files
 * 2. Copies structure from source locale (English)
 * 3. Marks strings with [NEEDS_TRANSLATION] placeholder
 * 4. Updates i18n.ts configuration
 * 5. Updates middleware.ts matcher
 * 6. Prints instructions for completing the setup
 * 
 * Usage: npm run add-locale -- --locale es --label "Español"
 */

import * as fs from 'fs';
import * as path from 'path';

interface LocaleOptions {
  locale: string;
  label: string;
  direction?: 'ltr' | 'rtl';
}

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales');
const SOURCE_LOCALE = 'en';
const I18N_FILE = path.join(__dirname, '..', 'src', 'i18n.ts');
const MIDDLEWARE_FILE = path.join(__dirname, '..', 'src', 'middleware.ts');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

/**
 * Parse command-line arguments
 */
function parseArgs(): LocaleOptions | null {
  const args = process.argv.slice(2);
  let locale = '';
  let label = '';
  let direction: 'ltr' | 'rtl' = 'ltr';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--locale' && i + 1 < args.length) {
      locale = args[i + 1].toLowerCase();
      i++;
    } else if (args[i] === '--label' && i + 1 < args.length) {
      label = args[i + 1];
      i++;
    } else if (args[i] === '--rtl') {
      direction = 'rtl';
    }
  }

  if (!locale || !label) {
    console.error(`${colors.red}Error: Missing required arguments${colors.reset}\n`);
    console.log('Usage: npm run add-locale -- --locale <code> --label <name> [--rtl]\n');
    console.log('Examples:');
    console.log('  npm run add-locale -- --locale es --label "Español"');
    console.log('  npm run add-locale -- --locale ar --label "العربية" --rtl\n');
    return null;
  }

  // Validate locale code format
  if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(locale)) {
    console.error(
      `${colors.red}Error: Invalid locale code format. Use lowercase 2-letter code (e.g., 'en', 'es')${colors.reset}\n`
    );
    return null;
  }

  return { locale, label, direction };
}

/**
 * Mark a translation string as needing translation
 */
function markForTranslation(value: any): any {
  if (typeof value === 'string') {
    return `[NEEDS_TRANSLATION] ${value}`;
  }

  if (Array.isArray(value)) {
    return value.map(markForTranslation);
  }

  if (typeof value === 'object' && value !== null) {
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = markForTranslation(val);
    }
    return result;
  }

  return value;
}

/**
 * Copy translation files from source locale
 */
function copyTranslationFiles(localeCode: string): void {
  const sourceDir = path.join(LOCALES_DIR, SOURCE_LOCALE);
  const targetDir = path.join(LOCALES_DIR, localeCode);

  // Create target directory
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Get all JSON files from source
  const files = fs
    .readdirSync(sourceDir)
    .filter((file) => file.endsWith('.json'));

  console.log(`\n${colors.blue}Copying translation files:${colors.reset}\n`);

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);

    // Load source content
    const sourceContent = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));

    // Mark all strings for translation
    const markedContent = markForTranslation(sourceContent);

    // Write to target
    fs.writeFileSync(targetPath, JSON.stringify(markedContent, null, 2) + '\n');

    console.log(`  ${colors.green}✓${colors.reset} ${file}`);
  }

  // Create index.ts
  const indexContent = `// Auto-generated locale index file
// Generated for locale: ${localeCode}

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

  fs.writeFileSync(path.join(targetDir, 'index.ts'), indexContent);
  console.log(`  ${colors.green}✓${colors.reset} index.ts`);
}

/**
 * Update i18n.ts configuration
 */
function updateI18nConfig(options: LocaleOptions): void {
  console.log(`\n${colors.blue}Updating i18n configuration:${colors.reset}\n`);

  let content = fs.readFileSync(I18N_FILE, 'utf-8');

  // Check if locale already exists
  if (content.includes(`'${options.locale}'`)) {
    console.log(
      `  ${colors.yellow}⚠${colors.reset} Locale '${options.locale}' already exists in i18n.ts`
    );
    return;
  }

  // Update locales array
  content = content.replace(
    /(export const locales = \[)([^\]]+)(\] as const;)/,
    (match, start, locales, end) => {
      const localeList = locales
        .split(',')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0);
      localeList.push(`'${options.locale}'`);
      return `${start}${localeList.join(', ')}${end}`;
    }
  );

  // Update localeLabels
  content = content.replace(
    /(export const localeLabels: Record<Locale, string> = \{)([^}]+)(\};)/,
    (match, start, labels, end) => {
      const updatedLabels = labels.trim() + `,\n  ${options.locale}: '${options.label}',`;
      return `${start}\n  ${updatedLabels}\n${end}`;
    }
  );

  // If RTL, add to localeDirections (if it exists)
  if (options.direction === 'rtl' && content.includes('localeDirections')) {
    content = content.replace(
      /(export const localeDirections: Record<[^>]+> = \{)([^}]+)(\};)/,
      (match, start, directions, end) => {
        const updatedDirections =
          directions.trim() + `,\n  ${options.locale}: '${options.direction}',`;
        return `${start}\n  ${updatedDirections}\n${end}`;
      }
    );
  }

  fs.writeFileSync(I18N_FILE, content);
  console.log(`  ${colors.green}✓${colors.reset} Updated src/i18n.ts`);
}

/**
 * Update middleware.ts matcher
 */
function updateMiddleware(localeCode: string): void {
  let content = fs.readFileSync(MIDDLEWARE_FILE, 'utf-8');

  // Update matcher pattern
  content = content.replace(
    /(matcher: \[['"]\/['"], ['"]\/)(\([^)]+\))(\/:\w+\*['"]\])/,
    (match, start, locales, end) => {
      const localeList = locales
        .slice(1, -1) // Remove parentheses
        .split('|')
        .map((l: string) => l.trim());

      if (!localeList.includes(localeCode)) {
        localeList.push(localeCode);
        localeList.sort();
      }

      return `${start}(${localeList.join('|')})${end}`;
    }
  );

  fs.writeFileSync(MIDDLEWARE_FILE, content);
  console.log(`  ${colors.green}✓${colors.reset} Updated src/middleware.ts`);
}

/**
 * Print completion instructions
 */
function printInstructions(options: LocaleOptions): void {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  Locale Scaffolding Complete!${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.green}✓${colors.reset} Created locale: ${colors.yellow}${options.locale}${colors.reset} (${options.label})\n`);

  console.log(`${colors.blue}Next Steps:${colors.reset}\n`);

  console.log(`1. ${colors.yellow}Translate content:${colors.reset}`);
  console.log(
    `   Edit files in ${colors.cyan}src/locales/${options.locale}/${colors.reset}`
  );
  console.log(
    `   Replace all ${colors.red}[NEEDS_TRANSLATION]${colors.reset} markers with actual translations\n`
  );

  console.log(`2. ${colors.yellow}Update layout:${colors.reset}`);
  console.log(`   Add to ${colors.cyan}generateStaticParams${colors.reset} in:`);
  console.log(`   ${colors.cyan}src/app/[locale]/layout.tsx${colors.reset}`);
  console.log(`   Add: { locale: '${options.locale}' },\n`);

  console.log(`3. ${colors.yellow}Update Storybook (optional):${colors.reset}`);
  console.log(`   Add to ${colors.cyan}.storybook/preview.tsx${colors.reset}`);
  console.log(`   Import messages and add to toolbar\n`);

  console.log(`4. ${colors.yellow}Validate translations:${colors.reset}`);
  console.log(`   ${colors.cyan}npm run validate:translations${colors.reset}\n`);

  console.log(`5. ${colors.yellow}Test the locale:${colors.reset}`);
  console.log(`   ${colors.cyan}npm run dev${colors.reset}`);
  console.log(`   Visit: ${colors.cyan}http://localhost:3000/${options.locale}${colors.reset}\n`);

  console.log(`${colors.blue}Files Created:${colors.reset}`);
  console.log(`  • ${colors.cyan}src/locales/${options.locale}/*.json${colors.reset}`);
  console.log(`  • ${colors.cyan}src/locales/${options.locale}/index.ts${colors.reset}\n`);

  console.log(`${colors.blue}Files Updated:${colors.reset}`);
  console.log(`  • ${colors.cyan}src/i18n.ts${colors.reset}`);
  console.log(`  • ${colors.cyan}src/middleware.ts${colors.reset}\n`);
}

/**
 * Main execution
 */
function main(): void {
  console.log(`${colors.cyan}╔═══════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║   Automated Locale Scaffolding Script    ║${colors.reset}`);
  console.log(`${colors.cyan}╚═══════════════════════════════════════════╝${colors.reset}`);

  const options = parseArgs();
  if (!options) {
    process.exit(1);
  }

  // Check if locale already exists
  const targetDir = path.join(LOCALES_DIR, options.locale);
  if (fs.existsSync(targetDir)) {
    console.error(
      `\n${colors.red}Error: Locale '${options.locale}' already exists!${colors.reset}\n`
    );
    process.exit(1);
  }

  // Perform scaffolding
  copyTranslationFiles(options.locale);
  updateI18nConfig(options);
  updateMiddleware(options.locale);
  printInstructions(options);
}

main();

