#!/usr/bin/env node
/**
 * intent-audit.js - Audit tool for detecting silent successes in Next.js application
 * 
 * This tool scans your Next.js application for:
 * 1. Routes that might return 200 OK but don't have visible content
 * 2. Missing page components or layouts
 * 3. Mismatches between i18n message keys and component usage
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { glob } = require('glob');

// Configuration
const config = {
  appDir: path.resolve(process.cwd(), 'src/app'),
  componentsDir: path.resolve(process.cwd(), 'src/components'),
  messagesDir: path.resolve(process.cwd(), 'src/messages'),
  locales: ['en', 'de', 'tr'], // This should come from your i18n config
};

// Utility to check if a file exists
const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

// Check for potential issues in the route
async function auditRoutes() {
  console.log(chalk.blue.bold('\n📋 Auditing routes for silent successes...\n'));
  
  // Get all the route segments
  const routeSegments = await glob('**/*', { 
    cwd: config.appDir,
    ignore: ['**/node_modules/**', '**/.next/**'],
    nodir: false
  });
  
  // Filter to directories that might be routes
  const potentialRoutes = routeSegments
    .filter(segment => !segment.includes('.'))
    .map(segment => segment.replace(/\\/g, '/'));
  
  let warnings = 0;
  
  for (const route of potentialRoutes) {
    const routePath = path.join(config.appDir, route);
    const pageFile = path.join(routePath, 'page.tsx');
    const pageFileJs = path.join(routePath, 'page.js');
    const layoutFile = path.join(routePath, 'layout.tsx');
    const layoutFileJs = path.join(routePath, 'layout.js');
    
    const hasPage = fileExists(pageFile) || fileExists(pageFileJs);
    const hasLayout = fileExists(layoutFile) || fileExists(layoutFileJs);
    
    // Check if this route has proper components
    if (!hasPage && !hasLayout) {
      console.log(chalk.yellow(`⚠️  Route '/${route}' may need page.tsx or layout.tsx`));
      warnings++;
      continue;
    }
    
    // Read page content to check for rendering
    if (hasPage) {
      const pagePath = fileExists(pageFile) ? pageFile : pageFileJs;
      const pageContent = fs.readFileSync(pagePath, 'utf-8');
      
      // Check if the page returns JSX or a component
      const hasVisibleRender = 
        pageContent.includes('return') && 
        (pageContent.includes('<') || pageContent.includes('React.createElement'));
      
      if (!hasVisibleRender) {
        console.log(chalk.red(`❌ Silent success detected in '/${route}': Page exists but may not render visible content`));
        warnings++;
      } else {
        console.log(chalk.green(`✅ Route '/${route}' has visible render output`));
      }
    }
  }
  
  if (warnings === 0) {
    console.log(chalk.green('✅ No silent successes detected in routes!'));
  } else {
    console.log(chalk.yellow(`\n⚠️  Found ${warnings} potential silent success issues`));
  }
}

// Check for message key usage
async function auditI18nKeys() {
  console.log(chalk.blue.bold('\n📋 Auditing i18n message keys...\n'));
  
  // Load messages for the default locale
  const messagesPath = path.join(config.messagesDir, 'en.json');
  if (!fileExists(messagesPath)) {
    console.log(chalk.red('❌ Default messages file not found'));
    return;
  }
  
  const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf-8'));
  const messageKeys = Object.keys(messages);
  
  // Scan components for message key usage
  const componentFiles = await glob('**/*.{tsx,jsx}', { 
    cwd: config.componentsDir,
    ignore: ['**/node_modules/**', '**/.next/**']
  });
  
  let unusedKeys = [...messageKeys];
  let warnings = 0;
  
  for (const file of componentFiles) {
    const componentPath = path.join(config.componentsDir, file);
    const componentContent = fs.readFileSync(componentPath, 'utf-8');
    
    // Check each message key to see if it's used in this component
    for (const key of messageKeys) {
      if (componentContent.includes(`${key}.`) || 
          componentContent.includes(`"${key}"`) || 
          componentContent.includes(`'${key}'`)) {
        unusedKeys = unusedKeys.filter(k => k !== key);
      }
    }
  }
  
  if (unusedKeys.length > 0) {
    console.log(chalk.yellow(`⚠️  Found ${unusedKeys.length} potentially unused message namespaces:`));
    for (const key of unusedKeys) {
      console.log(chalk.yellow(`   - ${key}`));
    }
    warnings += unusedKeys.length;
  } else {
    console.log(chalk.green('✅ All message namespaces appear to be used!'));
  }
  
  if (warnings === 0) {
    console.log(chalk.green('✅ No i18n issues detected!'));
  }
}

// Create a visual map of the application
async function createIntentMap() {
  console.log(chalk.blue.bold('\n📋 Generating application intent map...\n'));
  
  const routeSegments = await glob('**/*', { 
    cwd: config.appDir,
    ignore: ['**/node_modules/**', '**/.next/**'],
    nodir: false
  });
  
  // Filter to directories that might be routes
  const potentialRoutes = routeSegments
    .filter(segment => !segment.includes('.') || segment.includes('page.') || segment.includes('layout.'))
    .map(segment => segment.replace(/\\/g, '/'));
  
  // Build a tree structure
  const routeTree = {};
  
  for (const route of potentialRoutes) {
    let current = routeTree;
    const parts = route.split('/').filter(Boolean);
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Mark leaf nodes with page/layout info
    if (route.includes('page.')) {
      current._hasPage = true;
    }
    if (route.includes('layout.')) {
      current._hasLayout = true;
    }
  }
  
  // Print the tree
  console.log(chalk.bold('\nApplication Intent Map:'));
  printRouteTree(routeTree, '', true);
}

// Helper to print the route tree
function printRouteTree(node, prefix, isLast) {
  const hasContent = node._hasPage || node._hasLayout;
  const label = `${prefix}${isLast ? '└── ' : '├── '}`;
  
  if (Object.keys(node).length === 0) {
    return;
  }
  
  // Process non-metadata entries (actual routes)
  const entries = Object.entries(node)
    .filter(([key]) => !key.startsWith('_'))
    .sort(([a], [b]) => a.localeCompare(b));
  
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    const isLastItem = i === entries.length - 1;
    
    // Color code based on content presence
    const childHasContent = value._hasPage || value._hasLayout;
    let routeLabel = key;
    
    if (key.includes('page.') || key.includes('layout.')) {
      routeLabel = chalk.italic(key);
    } else if (key.startsWith('[') && key.endsWith(']')) {
      routeLabel = chalk.yellow(key); // Dynamic routes
    }
    
    if (childHasContent) {
      console.log(`${label}${chalk.green(routeLabel)} ${
        value._hasPage && value._hasLayout
          ? chalk.blue('(page+layout)')
          : value._hasPage
          ? chalk.blue('(page)')
          : chalk.blue('(layout)')
      }`);
    } else {
      console.log(`${label}${routeLabel}`);
    }
    
    printRouteTree(
      value,
      `${prefix}${isLast ? '    ' : '│   '}`,
      isLastItem
    );
  }
}

// Main function
async function main() {
  console.log(chalk.blue.bold('\n===================================='));
  console.log(chalk.blue.bold('📊 QuantumPoly Intent Audit Tool 📊'));
  console.log(chalk.blue.bold('====================================\n'));
  
  console.log(chalk.gray('Analyzing application structure...'));
  
  await auditRoutes();
  await auditI18nKeys();
  await createIntentMap();
  
  console.log(chalk.blue.bold('\n===================================='));
  console.log(chalk.blue.bold('✨ Intent Audit Complete ✨'));
  console.log(chalk.blue.bold('====================================\n'));
}

// Run the audit
main().catch(error => {
  console.error('Error during intent audit:', error);
  process.exit(1);
}); 