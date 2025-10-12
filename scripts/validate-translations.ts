#!/usr/bin/env ts-node
/**
 * Translation Validation Script
 * 
 * Validates that all locale translation files have:
 * - Identical key structures
 * - Consistent format string placeholders
 * - No missing or extra keys
 * - Valid JSON syntax
 * 
 * Usage: npm run validate:translations
 * Exit code: 0 (success) or 1 (validation errors found)
 */

import * as fs from 'fs';
import * as path from 'path';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface ValidationError {
  locale: string;
  file: string;
  type: 'missing_key' | 'extra_key' | 'format_mismatch' | 'structure_mismatch';
  key: string;
  details?: string;
}

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales');
const SOURCE_LOCALE = 'en'; // Reference locale for comparison

/**
 * Get all locale directories
 */
function getLocales(): string[] {
  return fs
    .readdirSync(LOCALES_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && dirent.name !== 'qps')
    .map((dirent) => dirent.name)
    .sort();
}

/**
 * Get all JSON files in a locale directory
 */
function getTranslationFiles(locale: string): string[] {
  const localeDir = path.join(LOCALES_DIR, locale);
  return fs
    .readdirSync(localeDir)
    .filter((file) => file.endsWith('.json'))
    .sort();
}

/**
 * Load and parse a translation file
 */
function loadTranslationFile(locale: string, file: string): Record<string, any> {
  const filePath = path.join(LOCALES_DIR, locale, file);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(
      `${colors.red}✗ Error parsing ${locale}/${file}: ${error instanceof Error ? error.message : String(error)}${colors.reset}`
    );
    process.exit(1);
  }
}

/**
 * Recursively get all keys from a nested object
 */
function getAllKeys(obj: Record<string, any>, prefix = ''): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys.sort();
}

/**
 * Get value from nested object using dot notation
 */
function getNestedValue(obj: Record<string, any>, key: string): any {
  const keys = key.split('.');
  let value: any = obj;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }

  return value;
}

/**
 * Extract format placeholders from a string (e.g., {name}, {count})
 */
function extractPlaceholders(text: string): string[] {
  const regex = /\{([^}]+)\}/g;
  const placeholders: string[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    placeholders.push(match[1]);
  }

  return placeholders.sort();
}

/**
 * Compare format placeholders between two strings
 */
function comparePlaceholders(
  sourceText: string,
  targetText: string
): { match: boolean; details?: string } {
  const sourcePlaceholders = extractPlaceholders(sourceText);
  const targetPlaceholders = extractPlaceholders(targetText);

  if (sourcePlaceholders.length !== targetPlaceholders.length) {
    return {
      match: false,
      details: `Expected ${sourcePlaceholders.length} placeholder(s), found ${targetPlaceholders.length}`,
    };
  }

  for (let i = 0; i < sourcePlaceholders.length; i++) {
    if (sourcePlaceholders[i] !== targetPlaceholders[i]) {
      return {
        match: false,
        details: `Expected placeholder '{${sourcePlaceholders[i]}}', found '{${targetPlaceholders[i]}}'`,
      };
    }
  }

  return { match: true };
}

/**
 * Validate a single locale against the source locale
 */
function validateLocale(
  locale: string,
  sourceData: Map<string, Record<string, any>>,
  targetData: Map<string, Record<string, any>>
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check that target has all source files
  for (const file of sourceData.keys()) {
    if (!targetData.has(file)) {
      errors.push({
        locale,
        file,
        type: 'structure_mismatch',
        key: '[FILE_MISSING]',
        details: `File ${file} is missing in ${locale} locale`,
      });
      continue;
    }

    const sourceContent = sourceData.get(file)!;
    const targetContent = targetData.get(file)!;

    const sourceKeys = getAllKeys(sourceContent);
    const targetKeys = getAllKeys(targetContent);

    const sourceKeySet = new Set(sourceKeys);
    const targetKeySet = new Set(targetKeys);

    // Check for missing keys
    for (const key of sourceKeys) {
      if (!targetKeySet.has(key)) {
        errors.push({
          locale,
          file,
          type: 'missing_key',
          key,
          details: `Key exists in ${SOURCE_LOCALE} but missing in ${locale}`,
        });
      }
    }

    // Check for extra keys
    for (const key of targetKeys) {
      if (!sourceKeySet.has(key)) {
        errors.push({
          locale,
          file,
          type: 'extra_key',
          key,
          details: `Key exists in ${locale} but not in ${SOURCE_LOCALE}`,
        });
      }
    }

    // Check format string consistency for matching keys
    for (const key of sourceKeys) {
      if (targetKeySet.has(key)) {
        const sourceValue = getNestedValue(sourceContent, key);
        const targetValue = getNestedValue(targetContent, key);

        if (typeof sourceValue === 'string' && typeof targetValue === 'string') {
          const comparison = comparePlaceholders(sourceValue, targetValue);
          if (!comparison.match) {
            errors.push({
              locale,
              file,
              type: 'format_mismatch',
              key,
              details: comparison.details,
            });
          }
        }
      }
    }
  }

  // Check for extra files in target
  for (const file of targetData.keys()) {
    if (!sourceData.has(file)) {
      errors.push({
        locale,
        file,
        type: 'structure_mismatch',
        key: '[EXTRA_FILE]',
        details: `File ${file} exists in ${locale} but not in ${SOURCE_LOCALE}`,
      });
    }
  }

  return errors;
}

/**
 * Print validation results
 */
function printResults(
  errors: Map<string, ValidationError[]>,
  locales: string[]
): void {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}   Translation Validation Report${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);

  let totalErrors = 0;
  let hasErrors = false;

  for (const locale of locales) {
    if (locale === SOURCE_LOCALE) continue;

    const localeErrors = errors.get(locale) || [];
    totalErrors += localeErrors.length;

    if (localeErrors.length === 0) {
      console.log(
        `${colors.green}✓ ${locale.toUpperCase()}: All validations passed${colors.reset}`
      );
    } else {
      hasErrors = true;
      console.log(
        `${colors.red}✗ ${locale.toUpperCase()}: ${localeErrors.length} error(s) found${colors.reset}\n`
      );

      // Group errors by file and type
      const errorsByFile = new Map<string, ValidationError[]>();
      for (const error of localeErrors) {
        if (!errorsByFile.has(error.file)) {
          errorsByFile.set(error.file, []);
        }
        errorsByFile.get(error.file)!.push(error);
      }

      for (const [file, fileErrors] of errorsByFile) {
        console.log(`  ${colors.yellow}File: ${file}${colors.reset}`);

        for (const error of fileErrors) {
          const icon =
            error.type === 'missing_key'
              ? '⚠ Missing'
              : error.type === 'extra_key'
                ? '+ Extra'
                : error.type === 'format_mismatch'
                  ? '≠ Format'
                  : '⚡ Structure';

          console.log(`    ${icon}: ${error.key}`);
          if (error.details) {
            console.log(`       ${colors.yellow}${error.details}${colors.reset}`);
          }
        }
        console.log('');
      }
    }
  }

  console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);

  if (hasErrors) {
    console.log(
      `${colors.red}Validation failed with ${totalErrors} total error(s).${colors.reset}\n`
    );
    console.log(`${colors.yellow}Please fix the issues above and run validation again.${colors.reset}\n`);
  } else {
    console.log(
      `${colors.green}✓ All translations are valid and consistent!${colors.reset}\n`
    );
  }
}

/**
 * Main validation function
 */
function main(): void {
  console.log(`${colors.blue}Starting translation validation...${colors.reset}\n`);

  // Get all locales
  const locales = getLocales();
  console.log(
    `${colors.blue}Found locales: ${locales.join(', ')}${colors.reset}\n`
  );

  if (!locales.includes(SOURCE_LOCALE)) {
    console.error(
      `${colors.red}Error: Source locale '${SOURCE_LOCALE}' not found!${colors.reset}`
    );
    process.exit(1);
  }

  // Load source locale data
  const sourceFiles = getTranslationFiles(SOURCE_LOCALE);
  const sourceData = new Map<string, Record<string, any>>();

  for (const file of sourceFiles) {
    sourceData.set(file, loadTranslationFile(SOURCE_LOCALE, file));
  }

  console.log(
    `${colors.blue}Loaded ${sourceFiles.length} file(s) from ${SOURCE_LOCALE} locale${colors.reset}\n`
  );

  // Validate each locale
  const errors = new Map<string, ValidationError[]>();

  for (const locale of locales) {
    if (locale === SOURCE_LOCALE) continue;

    const targetFiles = getTranslationFiles(locale);
    const targetData = new Map<string, Record<string, any>>();

    for (const file of targetFiles) {
      targetData.set(file, loadTranslationFile(locale, file));
    }

    const localeErrors = validateLocale(locale, sourceData, targetData);
    errors.set(locale, localeErrors);
  }

  // Print results
  printResults(errors, locales);

  // Exit with appropriate code
  const hasErrors = Array.from(errors.values()).some(
    (localeErrors) => localeErrors.length > 0
  );

  process.exit(hasErrors ? 1 : 0);
}

// Run validation
main();

