#!/usr/bin/env node

/**
 * Coverage Merging Script for Multi-Node CI Workflows
 * 
 * Merges coverage reports from multiple Node.js versions into a single
 * coverage-summary.json suitable for Governance Dashboard ingestion.
 * 
 * Usage:
 *   node .github/scripts/merge-coverage.js [artifact-dir]
 * 
 * Expected Input Structure (from GitHub Actions artifacts):
 *   artifacts/
 *     coverage-report-node-18.x/
 *       coverage/coverage-final.json
 *       coverage/lcov.info
 *     coverage-report-node-20.x/
 *       coverage/coverage-final.json
 *       coverage/lcov.info
 * 
 * Output:
 *   coverage-summary.json (merged and averaged metrics)
 * 
 * @module merge-coverage
 */

const fs = require('fs');
const path = require('path');

class CoverageMerger {
  constructor(artifactDir = './artifacts') {
    this.artifactDir = artifactDir;
    this.outputFile = 'coverage-summary.json';
  }

  /**
   * Find all coverage-final.json files in artifact directories
   * @returns {string[]} Array of file paths
   */
  findCoverageFiles() {
    if (!fs.existsSync(this.artifactDir)) {
      console.error(`❌ Artifact directory not found: ${this.artifactDir}`);
      return [];
    }

    const coverageFiles = [];
    const entries = fs.readdirSync(this.artifactDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('coverage-report-')) {
        const coverageFilePath = path.join(
          this.artifactDir,
          entry.name,
          'coverage',
          'coverage-final.json'
        );

        if (fs.existsSync(coverageFilePath)) {
          coverageFiles.push(coverageFilePath);
          console.log(`✓ Found coverage file: ${coverageFilePath}`);
        }
      }
    }

    return coverageFiles;
  }

  /**
   * Load and parse a coverage JSON file
   * @param {string} filePath
   * @returns {Object|null}
   */
  loadCoverageFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`❌ Failed to load ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Calculate metrics for a single file's coverage data
   * @param {Object} fileCoverage - Coverage data for a single file
   * @returns {Object} Calculated metrics
   */
  calculateFileMetrics(fileCoverage) {
    const { s, f, b } = fileCoverage;

    // Statements
    const statements = Object.values(s || {});
    const statementsCovered = statements.filter((count) => count > 0).length;
    const statementsTotal = statements.length;
    const statementsPct = statementsTotal > 0 
      ? (statementsCovered / statementsTotal) * 100 
      : 100;

    // Functions
    const functions = Object.values(f || {});
    const functionsCovered = functions.filter((count) => count > 0).length;
    const functionsTotal = functions.length;
    const functionsPct = functionsTotal > 0 
      ? (functionsCovered / functionsTotal) * 100 
      : 100;

    // Branches
    const branches = Object.values(b || {});
    const branchesCovered = branches.flat().filter((count) => count > 0).length;
    const branchesTotal = branches.flat().length;
    const branchesPct = branchesTotal > 0 
      ? (branchesCovered / branchesTotal) * 100 
      : 100;

    return {
      statements: { total: statementsTotal, covered: statementsCovered, pct: statementsPct },
      functions: { total: functionsTotal, covered: functionsCovered, pct: functionsPct },
      branches: { total: branchesTotal, covered: branchesCovered, pct: branchesPct },
      lines: { total: statementsTotal, covered: statementsCovered, pct: statementsPct }, // Approximate
    };
  }

  /**
   * Merge multiple coverage reports
   * @param {string[]} coverageFiles
   * @returns {Object} Merged coverage summary
   */
  mergeCoverageReports(coverageFiles) {
    if (coverageFiles.length === 0) {
      throw new Error('No coverage files found to merge');
    }

    const allCoverageData = coverageFiles.map((file) => this.loadCoverageFile(file)).filter(Boolean);

    if (allCoverageData.length === 0) {
      throw new Error('Failed to load any valid coverage data');
    }

    // Aggregate file-level metrics
    const fileMetrics = {};
    const nodeVersionMetrics = {};

    allCoverageData.forEach((coverageData, index) => {
      const nodeVersion = this.extractNodeVersion(coverageFiles[index]);
      nodeVersionMetrics[nodeVersion] = { files: {} };

      Object.entries(coverageData).forEach(([filePath, fileCoverage]) => {
        const metrics = this.calculateFileMetrics(fileCoverage);

        // Initialize file entry if not exists
        if (!fileMetrics[filePath]) {
          fileMetrics[filePath] = {
            versions: {},
            merged: { statements: 0, functions: 0, branches: 0, lines: 0 },
          };
        }

        // Store version-specific metrics
        fileMetrics[filePath].versions[nodeVersion] = metrics;
        nodeVersionMetrics[nodeVersion].files[filePath] = metrics;
      });
    });

    // Calculate merged metrics (average across versions)
    const globalMetrics = { statements: 0, functions: 0, branches: 0, lines: 0 };
    let fileCount = 0;

    Object.entries(fileMetrics).forEach(([filePath, data]) => {
      const versions = Object.values(data.versions);
      const avgMetrics = {
        statements: this.average(versions.map((v) => v.statements.pct)),
        functions: this.average(versions.map((v) => v.functions.pct)),
        branches: this.average(versions.map((v) => v.branches.pct)),
        lines: this.average(versions.map((v) => v.lines.pct)),
      };

      fileMetrics[filePath].merged = avgMetrics;

      // Accumulate global metrics
      globalMetrics.statements += avgMetrics.statements;
      globalMetrics.functions += avgMetrics.functions;
      globalMetrics.branches += avgMetrics.branches;
      globalMetrics.lines += avgMetrics.lines;
      fileCount++;
    });

    // Calculate global averages
    if (fileCount > 0) {
      Object.keys(globalMetrics).forEach((key) => {
        globalMetrics[key] = globalMetrics[key] / fileCount;
      });
    }

    return {
      timestamp: new Date().toISOString(),
      nodeVersions: Object.keys(nodeVersionMetrics),
      global: globalMetrics,
      files: fileMetrics,
      byNodeVersion: nodeVersionMetrics,
    };
  }

  /**
   * Extract Node version from artifact path
   * @param {string} filePath
   * @returns {string}
   */
  extractNodeVersion(filePath) {
    const match = filePath.match(/node-(\d+\.x)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Calculate average of an array of numbers
   * @param {number[]} values
   * @returns {number}
   */
  average(values) {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  /**
   * Write merged coverage summary to file
   * @param {Object} summary
   */
  writeSummary(summary) {
    try {
      fs.writeFileSync(this.outputFile, JSON.stringify(summary, null, 2));
      console.log(`\n✅ Merged coverage summary written to: ${this.outputFile}`);
      console.log('\n📊 Global Coverage Metrics (averaged across Node versions):');
      console.log(`   Statements: ${summary.global.statements.toFixed(2)}%`);
      console.log(`   Functions:  ${summary.global.functions.toFixed(2)}%`);
      console.log(`   Branches:   ${summary.global.branches.toFixed(2)}%`);
      console.log(`   Lines:      ${summary.global.lines.toFixed(2)}%`);
      console.log(`\n🔢 Node Versions Analyzed: ${summary.nodeVersions.join(', ')}`);
    } catch (error) {
      console.error(`❌ Failed to write summary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run the merge process
   */
  run() {
    console.log('🔄 Starting coverage merge process...\n');

    const coverageFiles = this.findCoverageFiles();

    if (coverageFiles.length === 0) {
      console.error('❌ No coverage files found. Ensure artifacts are downloaded correctly.');
      process.exit(1);
    }

    console.log(`\n📦 Found ${coverageFiles.length} coverage report(s)\n`);

    const summary = this.mergeCoverageReports(coverageFiles);
    this.writeSummary(summary);
  }
}

// Main execution
if (require.main === module) {
  const artifactDir = process.argv[2] || './artifacts';
  const merger = new CoverageMerger(artifactDir);
  
  try {
    merger.run();
  } catch (error) {
    console.error(`\n❌ Coverage merge failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { CoverageMerger };

