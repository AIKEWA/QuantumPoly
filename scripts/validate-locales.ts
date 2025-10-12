#!/usr/bin/env ts-node

/**
 * @fileoverview Locale Validation Script
 * @description Validates that all locale files exist, are syntactically valid,
 *              and contain consistent keys across all supported languages.
 * @author CASP Development Team
 * @date 2025-10-12
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================
// Configuration
// ============================

const LOCALES_DIR = path.join(process.cwd(), 'src/locales');
const DEFAULT_LOCALE = 'en';
const SUPPORTED_LOCALES = ['en', 'de', 'tr', 'es', 'fr', 'it'];
const REQUIRED_FILES = [
  'about.json',
  'common.json',
  'footer.json',
  'hero.json',
  'newsletter.json',
  'vision.json',
];

// ============================
// Type Definitions
// ============================

interface ValidationResult {
  locale: string;
  file: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

interface LocaleData {
  [key: string]: unknown;
}

// ============================
// Utility Functions
// ============================

/**
 * Logs a formatted message with timestamp
 */
function log(message: string, level: 'info' | 'error' | 'warning' | 'success' = 'info'): void {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '  ℹ️',
    error: '  ❌',
    warning: '  ⚠️',
    success: '  ✅',
  }[level];

  console.log(`${prefix}  ${message}`);
}

/**
 * Reads and parses a JSON file
 */
function readJsonFile(filePath: string): LocaleData | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as LocaleData;
  } catch (error) {
    return null;
  }
}

/**
 * Recursively extracts all keys from a nested object
 */
function extractKeys(obj: LocaleData, prefix = ''): string[] {
  let keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(extractKeys(value as LocaleData, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Compares two sets of keys and returns missing and extra keys
 */
function compareKeys(
  referenceKeys: string[],
  targetKeys: string[],
): { missing: string[]; extra: string[] } {
  const referenceSet = new Set(referenceKeys);
  const targetSet = new Set(targetKeys);

  const missing = referenceKeys.filter((key) => !targetSet.has(key));
  const extra = targetKeys.filter((key) => !referenceSet.has(key));

  return { missing, extra };
}

// ============================
// Validation Functions
// ============================

/**
 * Validates that a locale directory exists
 */
function validateLocaleDirectory(locale: string): boolean {
  const localePath = path.join(LOCALES_DIR, locale);
  if (!fs.existsSync(localePath)) {
    log(`Locale directory not found: ${locale}`, 'error');
    return false;
  }
  return true;
}

/**
 * Validates that all required JSON files exist for a locale
 */
function validateRequiredFiles(locale: string): ValidationResult[] {
  const results: ValidationResult[] = [];
  const localePath = path.join(LOCALES_DIR, locale);

  for (const file of REQUIRED_FILES) {
    const filePath = path.join(localePath, file);

    if (!fs.existsSync(filePath)) {
      results.push({
        locale,
        file,
        status: 'error',
        message: `Missing required file: ${file}`,
      });
    } else {
      results.push({
        locale,
        file,
        status: 'success',
        message: `File exists: ${file}`,
      });
    }
  }

  return results;
}

/**
 * Validates JSON syntax for a file
 */
function validateJsonSyntax(locale: string, file: string): ValidationResult {
  const filePath = path.join(LOCALES_DIR, locale, file);

  if (!fs.existsSync(filePath)) {
    return {
      locale,
      file,
      status: 'error',
      message: `File does not exist`,
    };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    JSON.parse(content);

    return {
      locale,
      file,
      status: 'success',
      message: `Valid JSON syntax`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      locale,
      file,
      status: 'error',
      message: `Invalid JSON syntax: ${errorMessage}`,
    };
  }
}

/**
 * Validates that keys match between reference locale and target locale
 */
function validateKeys(
  referenceLocale: string,
  targetLocale: string,
  file: string,
): ValidationResult[] {
  const results: ValidationResult[] = [];

  const referencePath = path.join(LOCALES_DIR, referenceLocale, file);
  const targetPath = path.join(LOCALES_DIR, targetLocale, file);

  const referenceData = readJsonFile(referencePath);
  const targetData = readJsonFile(targetPath);

  if (!referenceData) {
    results.push({
      locale: targetLocale,
      file,
      status: 'error',
      message: `Cannot read reference file: ${referenceLocale}/${file}`,
    });
    return results;
  }

  if (!targetData) {
    results.push({
      locale: targetLocale,
      file,
      status: 'error',
      message: `Cannot read target file: ${targetLocale}/${file}`,
    });
    return results;
  }

  const referenceKeys = extractKeys(referenceData);
  const targetKeys = extractKeys(targetData);

  const { missing, extra } = compareKeys(referenceKeys, targetKeys);

  if (missing.length === 0 && extra.length === 0) {
    results.push({
      locale: targetLocale,
      file,
      status: 'success',
      message: `All keys match reference locale`,
    });
  } else {
    if (missing.length > 0) {
      results.push({
        locale: targetLocale,
        file,
        status: 'warning',
        message: `Missing keys (${missing.length}): ${missing.join(', ')}`,
      });
    }

    if (extra.length > 0) {
      results.push({
        locale: targetLocale,
        file,
        status: 'warning',
        message: `Extra keys (${extra.length}): ${extra.join(', ')}`,
      });
    }
  }

  return results;
}

// ============================
// Main Validation Logic
// ============================

/**
 * Main validation function
 */
function validateLocales(): number {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║  🌍  Locale Validation Script                     ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  log(`Locales directory: ${LOCALES_DIR}`, 'info');
  log(`Supported locales: ${SUPPORTED_LOCALES.join(', ')}`, 'info');
  log(`Required files: ${REQUIRED_FILES.join(', ')}`, 'info');
  console.log('');

  const allResults: ValidationResult[] = [];
  let hasErrors = false;
  let hasWarnings = false;

  // ============================
  // Step 1: Check Locale Directories
  // ============================
  console.log('───────────────────────────────────────────────────────');
  console.log('  Step 1: Checking locale directories...');
  console.log('───────────────────────────────────────────────────────\n');

  for (const locale of SUPPORTED_LOCALES) {
    if (!validateLocaleDirectory(locale)) {
      hasErrors = true;
      log(`Locale directory missing: ${locale}`, 'error');
    } else {
      log(`Locale directory found: ${locale}`, 'success');
    }
  }

  // ============================
  // Step 2: Check Required Files
  // ============================
  console.log('\n───────────────────────────────────────────────────────');
  console.log('  Step 2: Checking required files...');
  console.log('───────────────────────────────────────────────────────\n');

  for (const locale of SUPPORTED_LOCALES) {
    const fileResults = validateRequiredFiles(locale);
    allResults.push(...fileResults);

    const errors = fileResults.filter((r) => r.status === 'error');
    if (errors.length > 0) {
      hasErrors = true;
      errors.forEach((result) => log(`[${locale}] ${result.message}`, 'error'));
    } else {
      log(`[${locale}] All required files exist`, 'success');
    }
  }

  // ============================
  // Step 3: Validate JSON Syntax
  // ============================
  console.log('\n───────────────────────────────────────────────────────');
  console.log('  Step 3: Validating JSON syntax...');
  console.log('───────────────────────────────────────────────────────\n');

  for (const locale of SUPPORTED_LOCALES) {
    let localeHasErrors = false;

    for (const file of REQUIRED_FILES) {
      const syntaxResult = validateJsonSyntax(locale, file);
      allResults.push(syntaxResult);

      if (syntaxResult.status === 'error') {
        hasErrors = true;
        localeHasErrors = true;
        log(`[${locale}/${file}] ${syntaxResult.message}`, 'error');
      }
    }

    if (!localeHasErrors) {
      log(`[${locale}] All JSON files are valid`, 'success');
    }
  }

  // ============================
  // Step 4: Validate Key Consistency
  // ============================
  console.log('\n───────────────────────────────────────────────────────');
  console.log('  Step 4: Validating key consistency...');
  console.log('───────────────────────────────────────────────────────\n');

  for (const locale of SUPPORTED_LOCALES) {
    if (locale === DEFAULT_LOCALE) {
      log(`[${locale}] Skipping (reference locale)`, 'info');
      continue;
    }

    let localeHasIssues = false;

    for (const file of REQUIRED_FILES) {
      const keyResults = validateKeys(DEFAULT_LOCALE, locale, file);
      allResults.push(...keyResults);

      const warnings = keyResults.filter((r) => r.status === 'warning');
      if (warnings.length > 0) {
        hasWarnings = true;
        localeHasIssues = true;
        warnings.forEach((result) => log(`[${locale}/${file}] ${result.message}`, 'warning'));
      }
    }

    if (!localeHasIssues) {
      log(`[${locale}] All keys match reference locale`, 'success');
    }
  }

  // ============================
  // Summary
  // ============================
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║  📊  Validation Summary                            ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  const successCount = allResults.filter((r) => r.status === 'success').length;
  const errorCount = allResults.filter((r) => r.status === 'error').length;
  const warningCount = allResults.filter((r) => r.status === 'warning').length;

  console.log(`  Total checks: ${allResults.length}`);
  console.log(`  ✅ Successes: ${successCount}`);
  console.log(`  ⚠️  Warnings:  ${warningCount}`);
  console.log(`  ❌ Errors:    ${errorCount}`);
  console.log('');

  if (hasErrors) {
    console.log('  ❌ VALIDATION FAILED: Critical errors detected.\n');
    return 1;
  } else if (hasWarnings) {
    console.log('  ⚠️  VALIDATION PASSED WITH WARNINGS: Review recommended.\n');
    return 0;
  } else {
    console.log('  ✅ VALIDATION PASSED: All locales are valid.\n');
    return 0;
  }
}

// ============================
// Script Entry Point
// ============================

const exitCode = validateLocales();
process.exit(exitCode);

