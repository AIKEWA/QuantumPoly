#!/usr/bin/env node

/**
 * Middleware Integrity Check
 * 
 * This script checks the middleware configuration for potential issues
 * and ensures it's ready for deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Log utilities
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}\n${'─'.repeat(msg.length)}\n`)
};

// Paths to check
const PATHS = {
  middleware: path.resolve(__dirname, '../src/middleware'),
  middlewareIndex: path.resolve(__dirname, '../src/middleware/index.ts'),
  middlewareConfig: path.resolve(__dirname, '../src/middleware/config.ts'),
  middlewareModules: path.resolve(__dirname, '../src/middleware/modules'),
  i18n: path.resolve(__dirname, '../src/i18n.ts'),
};

// Check if a file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Read a file
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

// Main check function
function checkMiddlewareIntegrity() {
  let issues = 0;
  let warnings = 0;
  
  log.title('QuantumPoly Middleware Integrity Check');
  
  // 1. Check if all required files exist
  log.info('Checking middleware file structure...');
  
  const requiredFiles = [
    { path: PATHS.middlewareIndex, name: 'Main middleware entry point' },
    { path: PATHS.middlewareConfig, name: 'Middleware configuration' },
    { path: path.join(PATHS.middlewareModules, 'localeHandler.ts'), name: 'Locale handler module' },
    { path: path.join(PATHS.middlewareModules, 'redirectLogic.ts'), name: 'Redirect logic module' },
    { path: path.join(PATHS.middlewareModules, 'browserCompat.ts'), name: 'Browser compatibility module' },
  ];
  
  requiredFiles.forEach(file => {
    if (fileExists(file.path)) {
      log.success(`${file.name} exists`);
    } else {
      log.error(`${file.name} is missing at ${file.path}`);
      issues++;
    }
  });
  
  // 2. Check config.ts has the matcher export
  if (fileExists(PATHS.middlewareConfig)) {
    const configContent = readFile(PATHS.middlewareConfig);
    
    if (configContent.includes('export const config = {')) {
      log.success('Middleware matcher configuration found');
      
      // Check if it has valid matcher syntax
      if (configContent.includes('matcher:')) {
        log.success('Matcher syntax is valid');
      } else {
        log.error('Matcher configuration is missing or invalid');
        issues++;
      }
    } else {
      log.error('Missing middleware configuration export');
      issues++;
    }
  }
  
  // 3. Check index.ts exports the config
  if (fileExists(PATHS.middlewareIndex)) {
    const indexContent = readFile(PATHS.middlewareIndex);
    
    if (indexContent.includes('export { config }')) {
      log.success('Middleware index exports the configuration');
    } else {
      log.error('Middleware index does not export the configuration');
      issues++;
    }
  }
  
  // 4. Check for locale consistency between i18n.ts and middleware config
  if (fileExists(PATHS.i18n) && fileExists(PATHS.middlewareConfig)) {
    const i18nContent = readFile(PATHS.i18n);
    const configContent = readFile(PATHS.middlewareConfig);
    
    // Simple regex check - could be improved with actual parsing
    const i18nLocalesMatch = i18nContent.match(/export const locales = \[(.*?)\]/s);
    const configLocalesMatch = configContent.match(/LOCALES: locales/);
    
    if (i18nLocalesMatch && configLocalesMatch) {
      log.success('Locale configuration is consistent between i18n and middleware');
    } else {
      log.warning('Locale configuration may be inconsistent between i18n and middleware');
      warnings++;
    }
  }
  
  // 5. Check for console.log statements that shouldn't be in production
  log.info('Checking for debug code...');
  
  let debugStatements = 0;
  
  try {
    const grepResult = execSync(
      `grep -r 'console.log' ${PATHS.middleware} --include="*.ts" | grep -v 'logDebug'`, 
      { encoding: 'utf-8' }
    );
    
    if (grepResult.trim()) {
      debugStatements = grepResult.split('\n').filter(Boolean).length;
      log.warning(`Found ${debugStatements} console.log statements that should be removed for production`);
      warnings++;
    } else {
      log.success('No stray console.log statements found');
    }
  } catch (error) {
    // grep returns non-zero exit code when no matches are found
    log.success('No stray console.log statements found');
  }
  
  // Summary
  log.title('Check Summary');
  
  if (issues === 0 && warnings === 0) {
    log.success('All middleware integrity checks passed! Ready for deployment.');
    return true;
  } else {
    if (issues > 0) {
      log.error(`Found ${issues} issue${issues === 1 ? '' : 's'} that need to be fixed before deployment.`);
    }
    
    if (warnings > 0) {
      log.warning(`Found ${warnings} warning${warnings === 1 ? '' : 's'} that should be reviewed.`);
    }
    
    return false;
  }
}

// Run the check
const result = checkMiddlewareIntegrity();

// Exit with appropriate code
process.exit(result ? 0 : 1); 