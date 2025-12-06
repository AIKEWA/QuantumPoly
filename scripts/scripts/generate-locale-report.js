#!/usr/bin/env ts-node
"use strict";
/**
 * @fileoverview Locale Validation Report Generator
 * @description Executes locale validation scripts, captures results, and generates
 *              a comprehensive Markdown report for CI/CD transparency.
 * @author CASP Development Team
 * @date 2025-10-12
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ============================
// Configuration
// ============================
const DOCS_DIR = path.join(process.cwd(), 'docs');
const REPORT_PATH = path.join(DOCS_DIR, 'LOCALE_VALIDATION.md');
const SUPPORTED_LOCALES = ['en', 'de', 'tr', 'es', 'fr', 'it'];
// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
};
// ============================
// Utility Functions
// ============================
/**
 * Executes a validation command and captures its result
 */
function runValidation(command, scriptName) {
    const startTime = Date.now();
    let output = '';
    let exitCode = 0;
    let passed = true;
    try {
        output = (0, child_process_1.execSync)(command, {
            encoding: 'utf-8',
            stdio: 'pipe',
            cwd: process.cwd(),
        });
    }
    catch (error) {
        passed = false;
        exitCode = error.status || 1;
        output = error.stdout || error.stderr || error.message;
    }
    const duration = Date.now() - startTime;
    return {
        command: scriptName,
        passed,
        exitCode,
        output,
        duration,
    };
}
/**
 * Parses validation output to extract error and warning counts
 */
function parseValidationMetrics(results) {
    let errors = 0;
    let warnings = 0;
    for (const result of results) {
        if (!result.passed) {
            errors++;
        }
        // Count warnings in output
        const warningMatches = result.output.match(/⚠️|warning|WARNING/gi);
        if (warningMatches) {
            warnings += warningMatches.length;
        }
        // Count error indicators
        const errorMatches = result.output.match(/❌|error|ERROR|FAILED/gi);
        if (errorMatches && !result.passed) {
            errors += errorMatches.length - 1; // -1 because we already counted the overall failure
        }
    }
    return { errors, warnings };
}
/**
 * Generates the Technical Rationale section
 */
function generateTechnicalRationale() {
    return `## Technical Rationale

### Why Locale Validation Must Exist as a CI Gate

Multilingual applications face unique challenges that cannot be reliably addressed through manual code review alone:

#### 1. **Scale and Complexity**
   - With ${SUPPORTED_LOCALES.length} supported locales and multiple translation files per locale, manual verification becomes error-prone and time-consuming.
   - A single missing translation key can cascade into runtime errors affecting thousands of users.

#### 2. **Consistency Enforcement**
   - Format string placeholders (e.g., \`{name}\`, \`{count}\`) must match exactly across all translations.
   - Structural inconsistencies between locale files can cause silent failures that only manifest in specific language contexts.

#### 3. **Deployment Risk Mitigation**
   - **Pre-production detection**: Catching translation errors during CI prevents broken experiences from reaching users.
   - **Immediate feedback**: Developers receive instant notification of translation issues in their pull requests.
   - **Zero-downtime requirement**: International users expect consistent functionality regardless of their language preference.

#### 4. **Developer Experience**
   - Automated validation removes cognitive load from developers, allowing them to focus on feature development.
   - Clear error messages guide contributors toward correct translation practices.
   - CI integration ensures that translation quality is treated with the same rigor as code quality.

#### 5. **Long-term Maintainability**
   - As the application scales to support additional locales, automated validation becomes increasingly critical.
   - Prevents technical debt accumulation in the internationalization layer.
   - Enables confident refactoring of translation structures.

### Future Evolution

This validation system is designed to evolve:
- **Machine translation QA**: Automated quality checks for AI-generated translations
- **Cross-locale consistency diffing**: Detecting semantic drift between language versions
- **Translation coverage metrics**: Tracking completeness across locales over time
- **Automated translation syncing**: Integration with translation management platforms

---`;
}
/**
 * Generates the Markdown report
 */
function generateMarkdownReport(data) {
    const statusIcon = data.overallStatus === 'PASSED' ? '✅' : '❌';
    const statusColor = data.overallStatus === 'PASSED' ? 'green' : 'red';
    let markdown = `# Locale Validation Report

**Generated**: ${data.timestamp}  
**Status**: ${statusIcon} **${data.overallStatus}**

---

## Validation Summary

- **Total locales**: ${data.totalLocales}
- **Locales validated**: ${SUPPORTED_LOCALES.filter(l => l !== 'en').join(', ')}
- **Validation scripts executed**: ${data.validationResults.length}
- **Errors**: ${data.errors}
- **Warnings**: ${data.warnings}

---

## Validation Results

`;
    for (const result of data.validationResults) {
        const icon = result.passed ? '✅' : '❌';
        const status = result.passed ? 'PASSED' : 'FAILED';
        const duration = (result.duration / 1000).toFixed(2);
        markdown += `### ${icon} ${result.command}

**Status**: ${status}  
**Duration**: ${duration}s  
**Exit Code**: ${result.exitCode}

`;
        if (!result.passed) {
            markdown += `#### Error Output

\`\`\`
${result.output.trim()}
\`\`\`

`;
        }
        else {
            markdown += `#### Summary

All validations passed successfully.

`;
        }
    }
    markdown += `---

`;
    markdown += generateTechnicalRationale();
    markdown += `
## CI/CD Integration

This report is automatically generated during the continuous integration process as part of the \`validate-i18n\` job.

### Pipeline Behavior

- **Success**: If all validations pass, the build continues to compilation and deployment stages.
- **Failure**: Any validation failure immediately halts the pipeline, preventing broken translations from reaching production.

### Local Development

Developers can run validation locally before committing:

\`\`\`bash
# Run individual validations
npm run validate:locales
npm run validate:translations

# Run full validation with report generation
npm run validate:i18n:report
\`\`\`

### Troubleshooting

If validation fails:

1. **Review the error output** above for specific issues (missing keys, format mismatches, etc.)
2. **Check the affected locale files** in \`src/locales/\`
3. **Ensure key consistency** with the reference locale (\`en\`)
4. **Verify format placeholders** match between source and target translations
5. **Run validation locally** to test fixes before pushing

---

**Last Updated**: ${data.timestamp}  
**Generated by**: \`scripts/generate-locale-report.ts\`
`;
    return markdown;
}
/**
 * Logs a formatted console message
 */
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}
/**
 * Prints a formatted header
 */
function printHeader() {
    console.log('');
    log('╔════════════════════════════════════════════════════╗', 'cyan');
    log('║  🌍  i18n Validation Report Generator             ║', 'cyan');
    log('╚════════════════════════════════════════════════════╝', 'cyan');
    console.log('');
}
/**
 * Prints validation results to console
 */
function printResults(data) {
    console.log('');
    log('─────────────────────────────────────────────────────', 'cyan');
    log('  Validation Results', 'bold');
    log('─────────────────────────────────────────────────────', 'cyan');
    console.log('');
    for (const result of data.validationResults) {
        const icon = result.passed ? '✅' : '❌';
        const color = result.passed ? 'green' : 'red';
        const status = result.passed ? 'PASSED' : 'FAILED';
        log(`${icon} ${result.command} - ${status}`, color);
    }
    console.log('');
    log('─────────────────────────────────────────────────────', 'cyan');
    log('  Summary', 'bold');
    log('─────────────────────────────────────────────────────', 'cyan');
    console.log('');
    const overallIcon = data.overallStatus === 'PASSED' ? '✅' : '❌';
    const overallColor = data.overallStatus === 'PASSED' ? 'green' : 'red';
    log(`📊 Overall Status: ${overallIcon} ${data.overallStatus}`, overallColor);
    log(`📄 Report generated: ${REPORT_PATH}`, 'blue');
    log(`⏱️  Total execution time: ${data.validationResults.reduce((sum, r) => sum + r.duration, 0) / 1000}s`, 'blue');
    if (data.errors > 0) {
        log(`❌ Errors: ${data.errors}`, 'red');
    }
    if (data.warnings > 0) {
        log(`⚠️  Warnings: ${data.warnings}`, 'yellow');
    }
    console.log('');
}
// ============================
// Main Execution
// ============================
/**
 * Main function
 */
function main() {
    printHeader();
    log('Starting locale validation...', 'blue');
    console.log('');
    // Run validations
    const validationResults = [];
    log('→ Running validate:locales...', 'blue');
    const localesResult = runValidation('npm run validate:locales', 'validate:locales');
    validationResults.push(localesResult);
    log(`  ${localesResult.passed ? '✅' : '❌'} Completed in ${(localesResult.duration / 1000).toFixed(2)}s`, localesResult.passed ? 'green' : 'red');
    console.log('');
    log('→ Running validate:translations...', 'blue');
    const translationsResult = runValidation('npm run validate:translations', 'validate:translations');
    validationResults.push(translationsResult);
    log(`  ${translationsResult.passed ? '✅' : '❌'} Completed in ${(translationsResult.duration / 1000).toFixed(2)}s`, translationsResult.passed ? 'green' : 'red');
    console.log('');
    // Determine overall status
    const allPassed = validationResults.every((r) => r.passed);
    const overallStatus = allPassed ? 'PASSED' : 'FAILED';
    // Parse metrics
    const { errors, warnings } = parseValidationMetrics(validationResults);
    // Prepare report data
    const reportData = {
        timestamp: new Date().toISOString(),
        overallStatus,
        validationResults,
        totalLocales: SUPPORTED_LOCALES.length,
        totalChecks: 0, // Could be enhanced to parse actual check counts
        errors,
        warnings,
    };
    // Generate markdown report
    log('→ Generating validation report...', 'blue');
    const markdown = generateMarkdownReport(reportData);
    // Ensure docs directory exists
    if (!fs.existsSync(DOCS_DIR)) {
        fs.mkdirSync(DOCS_DIR, { recursive: true });
    }
    // Write report to file
    fs.writeFileSync(REPORT_PATH, markdown, 'utf-8');
    log(`  ✅ Report written to: ${REPORT_PATH}`, 'green');
    // Print results to console
    printResults(reportData);
    // Return exit code
    return allPassed ? 0 : 1;
}
// ============================
// Script Entry Point
// ============================
try {
    const exitCode = main();
    process.exit(exitCode);
}
catch (error) {
    log(`\n❌ Fatal error: ${error instanceof Error ? error.message : String(error)}`, 'red');
    process.exit(1);
}
