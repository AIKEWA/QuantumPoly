#!/usr/bin/env node

/**
 * Environment Detection Script for CI/CD Workflows
 * 
 * Detects test frameworks, accessibility tools, package managers,
 * and other project dependencies to enable conditional workflow logic.
 * 
 * Usage:
 *   node .github/scripts/detect-env.js
 * 
 * Outputs GitHub Actions environment variables via $GITHUB_OUTPUT
 * 
 * @module detect-env
 */

const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} DetectionResult
 * @property {string} packageManager - Detected package manager (npm|pnpm|yarn)
 * @property {string} testFramework - Detected test framework (jest|vitest|playwright|none)
 * @property {boolean} hasPlaywright - Whether @playwright/test is available
 * @property {boolean} hasAxeCore - Whether @axe-core/playwright is available
 * @property {boolean} hasJest - Whether jest is available
 * @property {boolean} hasVitest - Whether vitest is available
 * @property {boolean} hasTypeScript - Whether TypeScript is configured
 * @property {boolean} hasESLint - Whether ESLint is configured
 * @property {string[]} nodeVersions - Node versions from package.json engines
 * @property {string} vercelNodeVersion - Vercel runtime version if detectable
 */

class EnvironmentDetector {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.packageJsonPath = path.join(rootDir, 'package.json');
    this.packageJson = null;
  }

  /**
   * Load and parse package.json
   * @returns {Object|null}
   */
  loadPackageJson() {
    try {
      if (!this.packageJson && fs.existsSync(this.packageJsonPath)) {
        const content = fs.readFileSync(this.packageJsonPath, 'utf-8');
        this.packageJson = JSON.parse(content);
      }
      return this.packageJson;
    } catch (error) {
      console.error(`❌ Failed to load package.json: ${error.message}`);
      return null;
    }
  }

  /**
   * Detect package manager based on lock files
   * @returns {string}
   */
  detectPackageManager() {
    if (fs.existsSync(path.join(this.rootDir, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }
    if (fs.existsSync(path.join(this.rootDir, 'yarn.lock'))) {
      return 'yarn';
    }
    if (fs.existsSync(path.join(this.rootDir, 'package-lock.json'))) {
      return 'npm';
    }
    return 'npm'; // default fallback
  }

  /**
   * Check if a package exists in dependencies or devDependencies
   * @param {string} packageName
   * @returns {boolean}
   */
  hasPackage(packageName) {
    const pkg = this.loadPackageJson();
    if (!pkg) return false;

    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    return packageName in deps;
  }

  /**
   * Detect primary test framework
   * @returns {string}
   */
  detectTestFramework() {
    if (this.hasPackage('jest')) return 'jest';
    if (this.hasPackage('vitest')) return 'vitest';
    if (this.hasPackage('@playwright/test')) return 'playwright';
    return 'none';
  }

  /**
   * Check for TypeScript configuration
   * @returns {boolean}
   */
  hasTypeScript() {
    return (
      fs.existsSync(path.join(this.rootDir, 'tsconfig.json')) ||
      this.hasPackage('typescript')
    );
  }

  /**
   * Check for ESLint configuration
   * @returns {boolean}
   */
  hasESLint() {
    const configFiles = [
      '.eslintrc',
      '.eslintrc.js',
      '.eslintrc.cjs',
      '.eslintrc.json',
      '.eslintrc.yml',
      '.eslintrc.yaml',
      'eslint.config.js',
      'eslint.config.mjs',
    ];

    const hasConfigFile = configFiles.some((file) =>
      fs.existsSync(path.join(this.rootDir, file))
    );

    const pkg = this.loadPackageJson();
    const hasEslintConfig = pkg && 'eslintConfig' in pkg;

    return hasConfigFile || hasEslintConfig || this.hasPackage('eslint');
  }

  /**
   * Extract Node version requirements from package.json engines
   * @returns {string[]}
   */
  getNodeVersions() {
    const pkg = this.loadPackageJson();
    if (!pkg || !pkg.engines || !pkg.engines.node) {
      return ['18.x', '20.x']; // default LTS versions
    }

    const nodeConstraint = pkg.engines.node;
    // Parse simple constraints like ">=18.0.0", "^18.0.0 || ^20.0.0"
    const versions = [];
    
    if (nodeConstraint.includes('18')) versions.push('18.x');
    if (nodeConstraint.includes('20')) versions.push('20.x');
    if (nodeConstraint.includes('21')) versions.push('21.x');

    return versions.length > 0 ? versions : ['18.x', '20.x'];
  }

  /**
   * Detect Vercel runtime Node version from vercel.json or package.json
   * @returns {string|null}
   */
  detectVercelNodeVersion() {
    // Check vercel.json
    const vercelJsonPath = path.join(this.rootDir, 'vercel.json');
    if (fs.existsSync(vercelJsonPath)) {
      try {
        const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
        if (vercelConfig.functions && vercelConfig.functions['**/*']) {
          return vercelConfig.functions['**/*'].runtime || null;
        }
      } catch (error) {
        // Silent fail - vercel.json might not have runtime config
      }
    }

    // Check package.json engines
    const pkg = this.loadPackageJson();
    if (pkg && pkg.engines && pkg.engines.node) {
      // Extract major version from constraint
      const match = pkg.engines.node.match(/(\d+)/);
      return match ? `${match[1]}.x` : null;
    }

    return null;
  }

  /**
   * Run full detection and return results
   * @returns {DetectionResult}
   */
  detect() {
    const packageManager = this.detectPackageManager();
    const testFramework = this.detectTestFramework();
    const hasPlaywright = this.hasPackage('@playwright/test');
    const hasAxeCore = this.hasPackage('@axe-core/playwright');
    const hasJest = this.hasPackage('jest');
    const hasVitest = this.hasPackage('vitest');
    const hasTypeScript = this.hasTypeScript();
    const hasESLint = this.hasESLint();
    const nodeVersions = this.getNodeVersions();
    const vercelNodeVersion = this.detectVercelNodeVersion();

    return {
      packageManager,
      testFramework,
      hasPlaywright,
      hasAxeCore,
      hasJest,
      hasVitest,
      hasTypeScript,
      hasESLint,
      nodeVersions,
      vercelNodeVersion,
    };
  }

  /**
   * Output results to GitHub Actions format ($GITHUB_OUTPUT)
   * @param {DetectionResult} results
   */
  outputToGitHubActions(results) {
    const output = process.env.GITHUB_OUTPUT;
    
    if (!output) {
      // Not running in GitHub Actions - print to console for debugging
      console.log('🔍 Environment Detection Results:');
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    // Write to $GITHUB_OUTPUT file
    const lines = [
      `package_manager=${results.packageManager}`,
      `test_framework=${results.testFramework}`,
      `has_playwright=${results.hasPlaywright}`,
      `has_axe_core=${results.hasAxeCore}`,
      `has_jest=${results.hasJest}`,
      `has_vitest=${results.hasVitest}`,
      `has_typescript=${results.hasTypeScript}`,
      `has_eslint=${results.hasESLint}`,
      `node_versions=${JSON.stringify(results.nodeVersions)}`,
      `vercel_node_version=${results.vercelNodeVersion || 'unknown'}`,
    ];

    fs.appendFileSync(output, lines.join('\n') + '\n');
    console.log('✅ Environment detection complete. Results written to $GITHUB_OUTPUT');
  }
}

// Main execution
if (require.main === module) {
  const detector = new EnvironmentDetector();
  const results = detector.detect();
  detector.outputToGitHubActions(results);
}

module.exports = { EnvironmentDetector };

